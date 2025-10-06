import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';
import { StarfieldParticleSystem, StarfieldParticle } from './StarfieldParticle';
import { StarfieldDistribution } from './StarfieldDistribution';

export const starTextures = [
  // '/img/stars/galaxy-1.png',
  // '/img/stars/galaxy-2.png',
  // '/img/stars/galaxy-3.png',
  // '/img/stars/galaxy-4.png',
  '/img/stars/flare-2.png',
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
  private phoenixSprite: THREE.Mesh | null = null;
  private phoenixPulseTime: number = 0;
  private phoenixBloomTime: number = 0;

  // Drift state for camera rotation
  private driftState: {
    enabled: boolean;
    currentRotation: number;
    startRotation: number;
    targetRotation: number;
    transitionTime: number;
    transitionDuration: number;
    isTransitioning: boolean;
  } = {
    enabled: false,
    currentRotation: 0,
    startRotation: 0,
    targetRotation: 0,
    transitionTime: 0,
    transitionDuration: 2.0,
    isTransitioning: false
  };

  constructor(config: StarfieldConfig, scene: THREE.Scene, camera: THREE.Camera) {
    this.config = config;
    this.scene = scene;
    this.camera = camera;
    this.particleSystem = new StarfieldParticleSystem(config, scene);

    // Set camera reference for viewport-aware star distribution
    StarfieldDistribution.setCamera(camera);

    this.initializeStarfield();
  }

  private initializeStarfield(): void {
    // Start camera movement - move forward in negative Z direction (towards where camera is looking)
    this.cameraVelocity.set(0, 0, -this.config.cameraSpeed);

    // Initialize drift system if enabled
    if (this.config.drift) {
      this.driftState.enabled = true;
      this.generateNewDriftTarget();
    }

    // Create galaxy background
    this.createGalaxyBackground();

    // Create phoenix sprite
    this.createPhoenixSprite();

    // Spawn initial stars
    this.spawnInitialStars();
  }

  private createGalaxyBackground(): void {
    // Load galaxy texture
    const textureLoader = new THREE.TextureLoader();
    const galaxyTexture = textureLoader.load('/img/galaxy.png');

    // Disable sRGB color space to prevent gamma correction brightening
    galaxyTexture.colorSpace = THREE.LinearSRGBColorSpace;
    galaxyTexture.generateMipmaps = false;
    galaxyTexture.wrapS = THREE.ClampToEdgeWrapping;
    galaxyTexture.wrapT = THREE.ClampToEdgeWrapping;
    galaxyTexture.minFilter = THREE.LinearFilter;
    galaxyTexture.magFilter = THREE.LinearFilter;

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
      opacity: 1.0, // Full opacity to preserve original image contrast
      // Remove color tint to preserve original image colors
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

  private createPhoenixSprite(): void {
    // Load phoenix texture
    const textureLoader = new THREE.TextureLoader();
    const phoenixTexture = textureLoader.load('/img/phoenix.png');

    // Configure texture similar to galaxy background
    phoenixTexture.colorSpace = THREE.LinearSRGBColorSpace;
    phoenixTexture.generateMipmaps = false;
    phoenixTexture.wrapS = THREE.ClampToEdgeWrapping;
    phoenixTexture.wrapT = THREE.ClampToEdgeWrapping;
    phoenixTexture.minFilter = THREE.LinearFilter;
    phoenixTexture.magFilter = THREE.LinearFilter;

    // Calculate sprite size based on viewport height (60% of window height)
    let spriteHeight = 600 * 0.6; // Default fallback
    let spriteWidth = spriteHeight; // Assume square aspect ratio initially

    if (this.camera instanceof THREE.PerspectiveCamera) {
      const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
      const distance = 50; // Place sprite close to camera
      const viewportHeight = 2 * Math.tan(fov / 2) * distance;
      spriteHeight = viewportHeight * 0.6; // 60% of viewport height
      spriteWidth = spriteHeight; // Keep aspect ratio square for now
    }

    // Create plane geometry and unlit material with screen blend mode
    const spriteGeometry = new THREE.PlaneGeometry(spriteWidth, spriteHeight);
    // Choose blending mode based on config
    let blendMode: THREE.Blending = THREE.AdditiveBlending; // Default bloom effect
    let opacity = this.config.phoenixBloom ? this.config.phoenixBloomStrength || 1.5 : 1.0;

    if (!this.config.phoenixBloom) {
      // Use screen blend mode if bloom is disabled
      blendMode = THREE.CustomBlending;
    }

    const spriteMaterial = new THREE.MeshBasicMaterial({
      map: phoenixTexture,
      transparent: true,
      opacity: opacity,
      fog: false, // Don't apply fog to sprite
      depthWrite: false, // Allow other objects to render in front if needed
      side: THREE.DoubleSide,
      blending: blendMode,
      ...(blendMode === THREE.CustomBlending && {
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneMinusDstColorFactor,
        blendDst: THREE.OneFactor
      })
    });

    // Create the sprite mesh
    this.phoenixSprite = new THREE.Mesh(spriteGeometry, spriteMaterial);

    // Position sprite at center of view, close to camera
    this.phoenixSprite.position.set(0, 0, -50);

    // Make sprite face the camera
    this.phoenixSprite.lookAt(this.camera.position);

    // Set render order to render in front of galaxy but behind UI elements
    this.phoenixSprite.renderOrder = 0;

    // Add to scene
    this.scene.add(this.phoenixSprite);
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

    // Handle drift rotation if enabled
    if (this.driftState.enabled) {
      this.updateDriftRotation(deltaTime);
    } else {
      // Default rotation behavior
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

    // Update phoenix sprite to stay centered and aligned with view, with optional pulsing and bloom oscillation
    if (this.phoenixSprite) {
      // Update animation timers
      this.phoenixPulseTime += deltaTime;
      this.phoenixBloomTime += deltaTime;

      // Base distance from camera
      let spriteDistance = 50;

      // Apply pulsing effect if enabled
      if (this.config.phoenixPulse) {
        const pulseSpeed = this.config.phoenixPulseSpeed || 0.8;
        const pulseAmplitude = this.config.phoenixPulseAmplitude || 20;
        const pulseOffset = Math.sin(this.phoenixPulseTime * pulseSpeed) * pulseAmplitude;
        spriteDistance += pulseOffset;
      }

      // Position sprite in front of camera
      const forwardDirection = new THREE.Vector3(0, 0, -1);
      forwardDirection.applyQuaternion(this.camera.quaternion);

      this.phoenixSprite.position.copy(this.camera.position)
        .add(forwardDirection.multiplyScalar(spriteDistance));

      // Apply inverse rotation to keep phoenix aligned with view despite camera drift
      if (this.driftState.enabled) {
        // Apply positive rotation (same direction as camera) to counteract camera drift
        this.phoenixSprite.rotation.set(0, 0, this.driftState.currentRotation);
      } else {
        // Reset rotation if drift is disabled
        this.phoenixSprite.rotation.set(0, 0, 0);
      }

      // Apply bloom oscillation if enabled
      if (this.config.phoenixBloomOscillate && this.phoenixSprite.material instanceof THREE.MeshBasicMaterial) {
        const oscillateSpeed = this.config.phoenixBloomOscillateSpeed || 0.5;
        const minBloom = this.config.phoenixBloomMin || 0.8;
        const maxBloom = this.config.phoenixBloomMax || 2.2;

        const bloomValue = minBloom + (maxBloom - minBloom) *
          (0.5 + 0.5 * Math.sin(this.phoenixBloomTime * oscillateSpeed));

        this.phoenixSprite.material.opacity = bloomValue;
      }

      // Update sprite size based on current viewport (for resize handling)
      if (this.camera instanceof THREE.PerspectiveCamera) {
        const fov = this.camera.fov * (Math.PI / 180);
        const viewportHeight = 2 * Math.tan(fov / 2) * spriteDistance;
        const spriteHeight = viewportHeight * 0.6; // 60% of viewport height
        const spriteWidth = spriteHeight; // Keep aspect ratio square for now

        // Update geometry scale to match new size
        const geometry = this.phoenixSprite.geometry as THREE.PlaneGeometry;
        this.phoenixSprite.scale.set(
          spriteWidth / geometry.parameters.width,
          spriteHeight / geometry.parameters.height,
          1
        );
      }
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

  private generateNewDriftTarget(): void {
    // Store current rotation as the starting point for the new transition
    this.driftState.startRotation = this.driftState.currentRotation;

    // Generate random rotation target between -45 to +45 degrees, scaled by driftSpeed
    const maxRotation = Math.PI / 4; // 45 degrees in radians
    const baseRotation = (Math.random() - 0.5) * 2 * maxRotation;
    this.driftState.targetRotation = baseRotation * (this.config.driftSpeed || 1.0);

    // Reset transition state
    this.driftState.transitionTime = 0;

    // Use configurable min/max duration
    const minDuration = this.config.minDriftDuration || 10.0;
    const maxDuration = this.config.maxDriftDuration || 20.0;
    this.driftState.transitionDuration = minDuration + Math.random() * (maxDuration - minDuration);

    this.driftState.isTransitioning = true;
  }

  private updateDriftRotation(deltaTime: number): void {
    if (!this.driftState.isTransitioning) {
      // Generate new target if not currently transitioning
      this.generateNewDriftTarget();
      return;
    }

    // Update transition time (driftSpeed doesn't affect timing, only rotation amount)
    this.driftState.transitionTime += deltaTime;

    // Debug: Log deltaTime and progress occasionally
    // if (Math.random() < 0.01) { // Log roughly 1% of frames
    //   console.log(`deltaTime: ${deltaTime.toFixed(4)}s, progress: ${(this.driftState.transitionTime / this.driftState.transitionDuration * 100).toFixed(1)}%`);
    // }

    // Calculate transition progress (0 to 1)
    const progress = Math.min(this.driftState.transitionTime / this.driftState.transitionDuration, 1.0);

    // Use smooth ease-in-out curve for natural motion
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - 2 * (1 - progress) * (1 - progress);

    // Interpolate between start and target rotation over the full duration
    const previousRotation = this.driftState.currentRotation;
    this.driftState.currentRotation = this.driftState.startRotation +
      (this.driftState.targetRotation - this.driftState.startRotation) * easedProgress;

    // Apply rotation to camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      // Calculate rotation delta for this frame
      const rotationDelta = this.driftState.currentRotation - previousRotation;

      // Create rotation quaternion for Z-axis rotation
      const rotationQuaternion = new THREE.Quaternion();
      rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotationDelta);

      // Apply rotation to camera's quaternion
      this.camera.quaternion.multiplyQuaternions(rotationQuaternion, this.camera.quaternion);

      // Update the camera matrix
      this.camera.updateMatrix();
    }

    // Check if transition is complete
    if (progress >= 1.0) {
      console.log(`Drift completed in ${this.driftState.transitionTime.toFixed(1)}s (expected: ${this.driftState.transitionDuration.toFixed(1)}s)`);
      // Complete the current transition and immediately start next one for smooth flow
      this.driftState.currentRotation = this.driftState.targetRotation;
      this.generateNewDriftTarget();
    }
  }

  // Configuration methods
  setSpeed(speed: number): void {
    this.config.speed = speed;
    this.cameraVelocity.z = -speed; // Move forward in negative Z direction
  }

  setDistributionType(type: 'galaxy' | 'nebula' | 'cluster' | 'uniform' | 'radial'): void {
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

    if (this.phoenixSprite) {
      this.scene.remove(this.phoenixSprite);
      this.phoenixSprite.geometry.dispose();
      if (this.phoenixSprite.material instanceof THREE.Material) {
        this.phoenixSprite.material.dispose();
      }
      this.phoenixSprite = null;
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