import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';
import { StarfieldParticleSystem, StarfieldParticle } from './StarfieldParticle';
import { StarfieldDistribution } from './StarfieldDistribution';

export const starTextures = [
  '/img/stars/logo.png',
]

export class StarfieldManager {
  private particleSystem: StarfieldParticleSystem;
  private config: StarfieldConfig;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private spawnCounter: number = 0;

  // Movement state
  private cameraVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private lastUpdateTime: number = 0;
  private rotationSpeed: number = 0.1; // radians per second
  private galaxyPlane: THREE.Mesh | null = null;

  constructor(config: StarfieldConfig, scene: THREE.Scene, camera: THREE.Camera) {
    this.config = config;
    this.scene = scene;
    this.camera = camera;
    this.particleSystem = new StarfieldParticleSystem(config, scene);

    this.initializeStarfield();
  }

  private initializeStarfield(): void {
    // Start camera movement - move forward in negative Z direction (towards where camera is looking)
    this.cameraVelocity.set(0, 0, -this.config.cameraSpeed);

    // Create galaxy background
    this.createGalaxyBackground();

    // Spawn initial stars
    this.spawnInitialStars();
  }

  private createGalaxyBackground(): void {
    // Load galaxy texture
    const textureLoader = new THREE.TextureLoader();
    const galaxyTexture = textureLoader.load('/img/galaxy.png');

    // Calculate plane size based on camera FOV and distance to ensure edges are occluded
    const distance = 1800; // Place galaxy far away but within camera range, reduced to avoid z-fighting
    let planeSize = 2000; // Default size

    if (this.camera instanceof THREE.PerspectiveCamera) {
      const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
      const aspect = this.camera.aspect || 1;
      const height = 2 * Math.tan(fov / 2) * distance;
      const width = height * aspect;
      planeSize = Math.max(width, height) * 1.2; // Make it 20% larger to ensure coverage
    }

    // Create plane geometry and material
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: galaxyTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      color: 0xffffff,
      fog: false, // Don't apply fog to galaxy
      depthWrite: false // Don't write to depth buffer so stars can render in front
    });

    // Create the mesh
    this.galaxyPlane = new THREE.Mesh(planeGeometry, planeMaterial);

    // Position the plane far away in front of the camera
    this.galaxyPlane.position.set(0, 0, -distance);

    // Make sure the plane is visible by ensuring it faces the camera initially
    this.galaxyPlane.lookAt(this.camera.position);

    // Set render order to ensure galaxy renders behind stars
    this.galaxyPlane.renderOrder = -1;

    // Add to scene
    this.scene.add(this.galaxyPlane);
  }

  private spawnInitialStars(): void {
    const targetStars = Math.min(this.config.maxStars, 200); // Start with fewer stars

    for (let i = 0; i < targetStars; i++) {
      this.spawnStar(i);
    }
  }

  private spawnStar(index?: number): void {
    const inactiveParticle = this.particleSystem.getInactiveParticle();
    if (!inactiveParticle) return;

    const position = StarfieldDistribution.generatePosition(
      this.config,
      this.camera.position,
      index
    );

    const color = StarfieldDistribution.generateStarColor(this.config);
    const size = StarfieldDistribution.generateStarSize(this.config);

    inactiveParticle.recycle(position, color, size);
    this.spawnCounter++;
  }

  update(deltaTime: number): void {
    this.lastUpdateTime += deltaTime;

    // Update camera movement
    this.updateCameraMovement(deltaTime);

    // Update particle system
    this.particleSystem.update(deltaTime, this.camera);

    // Manage star lifecycle
    this.manageStarLifecycle();

    // Spawn new stars as needed
    this.spawnNewStars();
  }

  private updateCameraMovement(deltaTime: number): void {
    // Move camera forward
    const movement = this.cameraVelocity.clone().multiplyScalar(deltaTime);
    this.camera.position.add(movement);

    // Rotate camera around Z-axis (roll rotation)
    const rotationAmount = this.rotationSpeed * deltaTime;

    if (this.camera instanceof THREE.PerspectiveCamera) {
      // Create rotation quaternion for Z-axis rotation
      const rotationQuaternion = new THREE.Quaternion();
      rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotationAmount);

      // Apply rotation to camera's quaternion
      this.camera.quaternion.multiplyQuaternions(rotationQuaternion, this.camera.quaternion);

      // Update the camera matrix
      this.camera.updateMatrix();
    }

    // Update galaxy background to always face camera while maintaining rotation
    if (this.galaxyPlane) {
      // Keep galaxy plane at a fixed distance from camera
      const galaxyDistance = 1800; // Reduced to avoid z-fighting with stars
      const forwardDirection = new THREE.Vector3(0, 0, -1);

      // Apply camera's rotation to the forward direction
      forwardDirection.applyQuaternion(this.camera.quaternion);

      // Position galaxy plane in front of the camera
      this.galaxyPlane.position.copy(this.camera.position).add(
        forwardDirection.multiplyScalar(galaxyDistance)
      );

      // Make galaxy plane face the camera (perpendicular to camera's forward direction)
      this.galaxyPlane.lookAt(this.camera.position);
    }

    // Optional: Add subtle camera sway for more organic movement
    const time = this.lastUpdateTime * 0.5;
    const sway = Math.sin(time) * 0.5;
    const bob = Math.sin(time * 0.7) * 0.3;

    this.camera.position.x += sway * deltaTime;
    this.camera.position.y += bob * deltaTime;

    // Update matrix after position changes
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.updateMatrix();
    }
  }

  private manageStarLifecycle(): void {
    // Stars are automatically managed by the particle system
    // Inactive stars are recycled automatically when they move past the camera
  }

  private spawnNewStars(): void {
    const activeStars = this.particleSystem.getActiveParticleCount();
    const targetStars = Math.min(this.config.maxStars, 500);

    if (activeStars < targetStars) {
      const starsToSpawn = Math.min(
        targetStars - activeStars,
        this.config.instanceBatchSize
      );

      for (let i = 0; i < starsToSpawn; i++) {
        this.spawnStar();
      }
    }
  }

  // Configuration methods
  setSpeed(speed: number): void {
    this.config.speed = speed;
    this.cameraVelocity.z = -speed; // Move forward in negative Z direction
  }

  setDistributionType(type: 'galaxy' | 'nebula' | 'cluster' | 'uniform'): void {
    this.config.distributionType = type;
  }

  setMaxStars(maxStars: number): void {
    this.config.maxStars = Math.max(1, Math.min(maxStars, 1000));
  }

  // Cleanup
  dispose(): void {
    this.particleSystem.dispose();

    if (this.galaxyPlane) {
      this.scene.remove(this.galaxyPlane);
      this.galaxyPlane.geometry.dispose();
      if (this.galaxyPlane.material instanceof THREE.Material) {
        this.galaxyPlane.material.dispose();
      }
      this.galaxyPlane = null;
    }
  }

  // Getters for debugging/monitoring
  getActiveStarCount(): number {
    return this.particleSystem.getActiveParticleCount();
  }

  getCameraPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  getConfig(): StarfieldConfig {
    return { ...this.config };
  }
}