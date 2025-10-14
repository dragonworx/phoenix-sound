import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';
import { starTextures } from './StarfieldManager';

/**
 * Represents a single interaction particle with physics properties
 */
export class InteractionParticle {
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public color: THREE.Color;
  public size: number;
  public rotation: number;
  public rotationSpeed: number;
  public isActive: boolean;
  public lifetime: number;
  public maxLifetime: number;
  public textureIndex: number;

  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.color = new THREE.Color(0xffffff);
    this.size = 1.0;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.isActive = false;
    this.lifetime = 0;
    this.maxLifetime = 2.0;
    this.textureIndex = 0;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update lifetime
    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.isActive = false;
      return;
    }

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Update position based on velocity
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
  }

  activate(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    color: number,
    size: number
  ): void {
    this.position.copy(position);
    this.velocity.copy(velocity);
    this.color.setHex(color);
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * Math.PI * 2;
    this.isActive = true;
    this.lifetime = 0;
    this.maxLifetime = 1.5 + Math.random() * 1.0; // 1.5-2.5 seconds
    this.textureIndex = Math.floor(Math.random() * starTextures.length);
  }
}

/**
 * Manages a pool of interaction particles that emit from user click/touch points
 */
export class InteractionParticleSystem {
  private particles: InteractionParticle[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.PlaneGeometry;
  private dummy: THREE.Object3D;
  private config: StarfieldConfig;
  private textures: THREE.Texture[] = [];
  private isInitialized: boolean = false;
  private poolSize: number = 100;

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

    starTextures.forEach((texturePath, index) => {
      textureLoader.load(texturePath, (texture) => {
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.textures[index] = texture;
        loadedCount++;

        if (loadedCount === starTextures.length && this.material && this.material.uniforms) {
          this.material.uniforms.uTextures.value = this.textures;
          this.material.uniforms.uTextureCount.value = this.textures.length;
          this.material.needsUpdate = true;
        }
      });
    });
  }

  private initializeMaterial(): void {
    // Create default texture (white circle)
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

    const getBlendMode = (mode: string): THREE.Blending => {
      switch (mode) {
        case 'additive': return THREE.AdditiveBlending;
        case 'normal': return THREE.NormalBlending;
        case 'multiply': return THREE.MultiplyBlending;
        case 'screen': return THREE.AdditiveBlending;
        case 'subtract': return THREE.SubtractiveBlending;
        default: return THREE.AdditiveBlending;
      }
    };

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      blending: getBlendMode(this.config.blendMode || 'additive'),
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uTextures: { value: [defaultTexture] },
        uTextureCount: { value: 1 }
      },
      vertexShader: `
        attribute float textureIndex;
        attribute float alpha;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vTextureIndex;
        varying float vAlpha;

        void main() {
          vUv = uv;
          vColor = instanceColor;
          vTextureIndex = textureIndex;
          vAlpha = alpha;

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
        varying float vAlpha;

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

          // Apply fade based on lifetime
          gl_FragColor = vec4(textureColor.rgb, textureColor.a * vAlpha);
        }
      `
    });
  }

  private initializeInstancedMesh(scene: THREE.Scene): void {
    this.instancedMesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.poolSize
    );
    this.instancedMesh.frustumCulled = false;
    this.instancedMesh.renderOrder = 2; // Render on top of stars

    // Initialize instance colors
    this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(this.poolSize * 3),
      3
    );

    // Initialize texture index attribute
    const textureIndices = new Float32Array(this.poolSize);
    for (let i = 0; i < this.poolSize; i++) {
      textureIndices[i] = 0;
    }
    this.instancedMesh.geometry.setAttribute(
      'textureIndex',
      new THREE.InstancedBufferAttribute(textureIndices, 1)
    );

    // Initialize alpha attribute for fading
    const alphas = new Float32Array(this.poolSize);
    for (let i = 0; i < this.poolSize; i++) {
      alphas[i] = 1.0;
    }
    this.instancedMesh.geometry.setAttribute(
      'alpha',
      new THREE.InstancedBufferAttribute(alphas, 1)
    );

    scene.add(this.instancedMesh);
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const particle = new InteractionParticle();
      particle.isActive = false;
      this.particles.push(particle);
    }
  }

  /**
   * Emit particles from a 3D world position
   */
  emitFromPosition(worldPosition: THREE.Vector3, camera: THREE.Camera): void {
    const particlesToEmit = 3; // Emit fewer particles per click
    const colors = this.config.colors || [0xffffff];

    for (let i = 0; i < particlesToEmit; i++) {
      const particle = this.getInactiveParticle();
      if (!particle) break;

      // Random spread around the click point - much wider spread
      const spread = 30;
      const offsetX = (Math.random() - 0.5) * spread;
      const offsetY = (Math.random() - 0.5) * spread;
      const offsetZ = (Math.random() - 0.5) * spread * 2; // More depth variation
      const position = new THREE.Vector3(
        worldPosition.x + offsetX,
        worldPosition.y + offsetY,
        worldPosition.z + offsetZ
      );

      // Calculate velocity toward camera (outward from click point)
      const direction = new THREE.Vector3()
        .subVectors(camera.position, position)
        .normalize();

      // Add some random spread to the direction
      direction.x += (Math.random() - 0.5) * 0.5;
      direction.y += (Math.random() - 0.5) * 0.5;
      direction.z += (Math.random() - 0.5) * 0.5;
      direction.normalize();

      // Velocity magnitude with variation - similar to starfield speed
      const speed = 20 + Math.random() * 30; // 20-50 units per second
      const velocity = direction.multiplyScalar(speed);

      const color = colors[Math.floor(Math.random() * colors.length)];
      // Match starfield particle sizes but 5x larger
      const baseSize = this.config.starSizeMin + Math.random() * (this.config.starSizeMax - this.config.starSizeMin);
      const size = baseSize * 5;

      particle.activate(position, velocity, color, size);
    }
  }

  update(deltaTime: number, camera: THREE.Camera): void {
    if (!this.isInitialized || !this.instancedMesh) {
      return;
    }

    const activeParticles: { index: number; particle: InteractionParticle }[] = [];

    // Update all particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      if (particle.isActive) {
        particle.update(deltaTime);

        if (particle.isActive) {
          activeParticles.push({ index: i, particle });
        }
      }
    }

    // Update instance matrices
    for (let i = 0; i < activeParticles.length; i++) {
      this.updateInstanceMatrix(i, activeParticles[i].particle, camera);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.count = activeParticles.length;

    // Update attributes
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    const textureIndexAttribute = this.instancedMesh.geometry.getAttribute('textureIndex') as THREE.InstancedBufferAttribute;
    if (textureIndexAttribute) {
      textureIndexAttribute.needsUpdate = true;
    }

    const alphaAttribute = this.instancedMesh.geometry.getAttribute('alpha') as THREE.InstancedBufferAttribute;
    if (alphaAttribute) {
      alphaAttribute.needsUpdate = true;
    }
  }

  private updateInstanceMatrix(index: number, particle: InteractionParticle, camera: THREE.Camera): void {
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

    // Set alpha based on lifetime
    const alphaAttribute = this.instancedMesh.geometry.getAttribute('alpha') as THREE.InstancedBufferAttribute;
    if (alphaAttribute) {
      const lifetimeProgress = particle.lifetime / particle.maxLifetime;
      const alpha = 1.0 - lifetimeProgress; // Fade out linearly
      alphaAttribute.setX(index, alpha);
    }
  }

  private getInactiveParticle(): InteractionParticle | null {
    return this.particles.find(p => !p.isActive) || null;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.textures.forEach(texture => texture.dispose());
    this.textures = [];
  }
}
