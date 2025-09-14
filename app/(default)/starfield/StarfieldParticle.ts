import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';

export class StarfieldParticle {
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public color: THREE.Color;
  public size: number;
  public rotation: number;
  public rotationSpeed: number;
  public isActive: boolean;
  public distanceFromCamera: number;

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
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.isActive = true;
    this.distanceFromCamera = 0;
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
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    this.isActive = true;
    this.distanceFromCamera = 0;
    this.velocity.set(0, 0, 0);
  }
}

export class StarfieldParticleSystem {
  private particles: StarfieldParticle[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.PlaneGeometry;
  private dummy: THREE.Object3D;
  private config: StarfieldConfig;

  constructor(config: StarfieldConfig, scene: THREE.Scene) {
    this.config = config;
    this.dummy = new THREE.Object3D();

    this.initializeGeometry();
    this.initializeMaterial();
    this.initializeInstancedMesh(scene);
    this.initializeParticles();
  }

  private initializeGeometry(): void {
    this.geometry = new THREE.PlaneGeometry(1, 1);
  }

  private initializeMaterial(): void {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vColor;

        void main() {
          vUv = uv;
          vColor = vec3(1.0, 1.0, 1.0); // Default white color for now

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vColor;

        void main() {
          vec2 center = vUv - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          float alpha = 1.0 - (dist * 2.0);
          alpha = pow(alpha, 2.0);

          gl_FragColor = vec4(vColor, alpha);
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
  }

  private updateInstanceMatrix(index: number, particle: StarfieldParticle, camera: THREE.Camera): void {
    // Billboard the particle to face the camera
    this.dummy.position.copy(particle.position);
    this.dummy.lookAt(camera.position);
    this.dummy.rotateZ(particle.rotation);
    this.dummy.scale.setScalar(particle.size);
    this.dummy.updateMatrix();

    this.instancedMesh.setMatrixAt(index, this.dummy.matrix);
    // Color will be handled by the shader for now
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
  }
}