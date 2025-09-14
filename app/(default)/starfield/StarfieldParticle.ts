import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';
import { starTextures } from './StarfieldManager';

export class StarfieldParticle {
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public color: THREE.Color;
  public size: number;
  public rotation: number;
  public rotationSpeed: number;
  public isActive: boolean;
  public distanceFromCamera: number;
  public textureIndex: number;

  constructor(
    position: THREE.Vector3 = new THREE.Vector3(),
    color: number = 0xffffff,
    size: number = 1.0
  ) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3();
    this.color = new THREE.Color(color);
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    // Increased rotation speed to complete 1-3 rotations during lifetime (approx 10-15 seconds)
    this.rotationSpeed = (Math.random() - 0.5) * 2 * Math.PI * (1 + Math.random() * 2) / 12;
    this.isActive = true;
    this.distanceFromCamera = 0;
    this.textureIndex = Math.floor(Math.random() * starTextures.length);
  }

  update(deltaTime: number, config: StarfieldConfig, cameraPosition: THREE.Vector3): void {
    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Update position based on velocity
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Calculate distance from camera
    this.distanceFromCamera = this.position.distanceTo(cameraPosition);

    // Check if particle should be culled (behind camera or too far)
    if (this.distanceFromCamera > config.cullingDistance || this.position.z > cameraPosition.z + 10) {
      this.isActive = false;
    }
  }

  recycle(newPosition: THREE.Vector3, newColor: number, newSize: number): void {
    this.position.copy(newPosition);
    this.color.setHex(newColor);
    this.size = newSize;
    this.rotation = Math.random() * Math.PI * 2;
    // Increased rotation speed to complete 1-3 rotations during lifetime (approx 10-15 seconds)
    this.rotationSpeed = (Math.random() - 0.5) * 2 * Math.PI * (1 + Math.random() * 2) / 12;
    this.isActive = true;
    this.distanceFromCamera = 0;
    this.velocity.set(0, 0, 0);
    this.textureIndex = Math.floor(Math.random() * starTextures.length);
  }
}

export class StarfieldParticleSystem {
  private particles: StarfieldParticle[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.PlaneGeometry;
  private dummy: THREE.Object3D;
  private config: StarfieldConfig;
  private textures: THREE.Texture[] = [];
  private isInitialized: boolean = false;

  constructor(config: StarfieldConfig, scene: THREE.Scene) {
    this.config = config;
    this.dummy = new THREE.Object3D();

    this.initializeGeometry();
    this.initializeMaterial();
    this.initializeInstancedMesh(scene);
    this.initializeParticles();
    this.loadTextures();
    this.isInitialized = true;
  }

  private initializeGeometry(): void {
    this.geometry = new THREE.PlaneGeometry(1, 1);
  }

  private loadTextures(): void {
    if (starTextures.length === 0) return;

    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;

    // Load all textures
    starTextures.forEach((texturePath, index) => {
      textureLoader.load(texturePath, (texture) => {
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.textures[index] = texture;
        loadedCount++;

        // Update material uniforms when all textures are loaded
        if (loadedCount === starTextures.length && this.material && this.material.uniforms) {
          this.material.uniforms.uTextures.value = this.textures;
          this.material.uniforms.uTextureCount.value = this.textures.length;
          this.material.needsUpdate = true;
        }
      });
    });
  }

  private initializeMaterial(): void {
    // Create default texture (white circle) that will be replaced when real textures load
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const defaultTexture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uTextures: { value: [defaultTexture] },
        uTextureCount: { value: 1 }
      },
      vertexShader: `
        attribute float textureIndex;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vTextureIndex;

        void main() {
          vUv = uv;
          vColor = instanceColor;
          vTextureIndex = textureIndex;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTextures[5];
        uniform int uTextureCount;

        varying vec2 vUv;
        varying vec3 vColor;
        varying float vTextureIndex;

        void main() {
          vec4 textureColor = vec4(1.0);

          int texIndex = int(floor(vTextureIndex + 0.5));

          if (texIndex == 0) {
            textureColor = texture2D(uTextures[0], vUv);
          } else if (texIndex == 1 && uTextureCount > 1) {
            textureColor = texture2D(uTextures[1], vUv);
          } else if (texIndex == 2 && uTextureCount > 2) {
            textureColor = texture2D(uTextures[2], vUv);
          } else if (texIndex == 3 && uTextureCount > 3) {
            textureColor = texture2D(uTextures[3], vUv);
          } else if (texIndex == 4 && uTextureCount > 4) {
            textureColor = texture2D(uTextures[4], vUv);
          } else {
            textureColor = texture2D(uTextures[0], vUv);
          }

          // Apply color tint and preserve alpha from texture
          gl_FragColor = vec4(vColor * textureColor.rgb, textureColor.a);
        }
      `
    });
  }

  private initializeInstancedMesh(scene: THREE.Scene): void {
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.config.maxStars
    );
    this.instancedMesh.frustumCulled = false;
    this.instancedMesh.renderOrder = 1; // Render stars after galaxy background

    // Initialize instance colors
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(this.config.maxStars * 3),
      3
    );

    // Initialize texture index attribute
    const textureIndices = new Float32Array(this.config.maxStars);
    for (let i = 0; i < this.config.maxStars; i++) {
      textureIndices[i] = 0; // Default to first texture
    }
    this.instancedMesh.geometry.setAttribute(
      'textureIndex',
      new THREE.InstancedBufferAttribute(textureIndices, 1)
    );

    scene.add(this.instancedMesh);
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.config.maxStars; i++) {
      const particle = new StarfieldParticle();
      particle.isActive = false;
      this.particles.push(particle);
    }
  }

  update(deltaTime: number, camera: THREE.Camera): void {
    if (!this.isInitialized || !this.instancedMesh) {
      return;
    }

    const cameraPosition = camera.position;
    const activeParticles: {index: number, particle: StarfieldParticle}[] = [];

    // First pass: update particles and collect active ones
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      if (particle.isActive) {
        particle.update(deltaTime, this.config, cameraPosition);

        if (particle.isActive) {
          activeParticles.push({index: i, particle});
        }
      }
    }

    // Sort particles by distance to reduce flickering (furthest first)
    activeParticles.sort((a, b) => b.particle.distanceFromCamera - a.particle.distanceFromCamera);

    // Second pass: update instance matrices in sorted order
    for (let i = 0; i < activeParticles.length; i++) {
      this.updateInstanceMatrix(i, activeParticles[i].particle, camera);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.count = activeParticles.length;

    // Update attribute arrays
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    // Update texture index attribute
    const textureIndexAttribute = this.instancedMesh.geometry.getAttribute('textureIndex') as THREE.InstancedBufferAttribute;
    if (textureIndexAttribute) {
      textureIndexAttribute.needsUpdate = true;
    }
  }

  private updateInstanceMatrix(index: number, particle: StarfieldParticle, camera: THREE.Camera): void {
    // Billboard the particle to face the camera
    this.dummy.position.copy(particle.position);
    this.dummy.lookAt(camera.position);
    this.dummy.rotateZ(particle.rotation);
    this.dummy.scale.setScalar(particle.size);
    this.dummy.updateMatrix();

    this.instancedMesh.setMatrixAt(index, this.dummy.matrix);

    // Set color
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.setXYZ(index, particle.color.r, particle.color.g, particle.color.b);
    }

    // Set texture index
    const textureIndexAttribute = this.instancedMesh.geometry.getAttribute('textureIndex') as THREE.InstancedBufferAttribute;
    if (textureIndexAttribute) {
      textureIndexAttribute.setX(index, particle.textureIndex);
    }
  }

  getInactiveParticle(): StarfieldParticle | null {
    return this.particles.find(p => !p.isActive) || null;
  }

  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isActive).length;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();

    // Dispose textures
    this.textures.forEach(texture => texture.dispose());
    this.textures = [];
  }
}