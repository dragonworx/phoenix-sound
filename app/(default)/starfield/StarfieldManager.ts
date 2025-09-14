import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';
import { StarfieldParticleSystem, StarfieldParticle } from './StarfieldParticle';
import { StarfieldDistribution } from './StarfieldDistribution';

export class StarfieldManager {
  private particleSystem: StarfieldParticleSystem;
  private config: StarfieldConfig;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private spawnCounter: number = 0;

  // Movement state
  private cameraVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private lastUpdateTime: number = 0;

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

    // Spawn initial stars
    this.spawnInitialStars();
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

    // Optional: Add subtle camera sway for more organic movement
    const time = this.lastUpdateTime * 0.5;
    const sway = Math.sin(time) * 0.5;
    const bob = Math.sin(time * 0.7) * 0.3;

    this.camera.position.x += sway * deltaTime;
    this.camera.position.y += bob * deltaTime;

    // Update camera target (looking forward)
    const lookTarget = this.camera.position.clone().add(new THREE.Vector3(0, 0, -100));
    this.camera.lookAt(lookTarget);
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