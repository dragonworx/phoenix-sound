import * as THREE from 'three';
import { StarfieldManager } from './starfield/StarfieldManager';
import { StarfieldConfig, DEFAULT_STARFIELD_CONFIG } from './starfield/StarfieldConfig';
import { InteractionParticleSystem } from './starfield/InteractionParticles';

// Global state for the starfield system
let starfieldManager: StarfieldManager | null = null;
let interactionParticles: InteractionParticleSystem | null = null;
let lastTime: number = 0;
let currentCamera: THREE.Camera | null = null;

/**
 * Starfield scene with infinite movement through space
 * Features galactic distribution, instanced particles, and volumetric fog
 */
export const starfieldScene = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  config: Partial<StarfieldConfig> = {}
): void => {
  // Merge user config with defaults
  const finalConfig: StarfieldConfig = { ...DEFAULT_STARFIELD_CONFIG, ...config };

  // Set up scene background and fog
  setupSceneEnvironment(scene, finalConfig);

  // Initialize starfield manager
  starfieldManager = new StarfieldManager(finalConfig, scene, camera);

  // Initialize interaction particle system
  interactionParticles = new InteractionParticleSystem(finalConfig, scene);

  // Store camera reference
  currentCamera = camera;

  // Set up camera initial position and settings
  setupCamera(camera);
};

/**
 * Update function to be called each frame
 */
export const updateStarfieldScene = (deltaTime: number, elapsedTime: number): void => {
  if (!starfieldManager || !currentCamera) return;

  // Update starfield system
  starfieldManager.update(deltaTime);

  // Update interaction particles
  if (interactionParticles) {
    interactionParticles.update(deltaTime, currentCamera);
  }

  lastTime = elapsedTime;
};

/**
 * Setup scene environment (background, fog)
 */
function setupSceneEnvironment(scene: THREE.Scene, config: StarfieldConfig): void {
  // Transparent background to allow galaxy to show through
  scene.background = null;

  // Reduce fog effect to not obscure distant galaxy
  scene.fog = new THREE.Fog(
    config.fogColor,
    config.fogNear * 2, // Start fog further away
    config.fogFar
  );
}


/**
 * Setup initial camera configuration
 */
function setupCamera(camera: THREE.Camera): void {
  // Set initial camera position
  camera.position.set(0, 0, 0);

  // Look forward into space
  const lookTarget = new THREE.Vector3(0, 0, -100);
  camera.lookAt(lookTarget);

  if (camera instanceof THREE.PerspectiveCamera) {
    // Don't override FOV - use what's configured in the ThreeRenderer
    // camera.fov = 60; // Removed to preserve configured FOV
    // camera.updateProjectionMatrix(); // Not needed since we're not changing FOV

    // Enable manual matrix updates for rotation
    camera.matrixAutoUpdate = false;
    camera.updateMatrix();
  }
}

/**
 * Handle user interaction (click/touch)
 */
export const handleInteraction = (worldPosition: THREE.Vector3, camera: THREE.Camera): void => {
  if (interactionParticles) {
    interactionParticles.emitFromPosition(worldPosition, camera);
  }
};

/**
 * Configuration utilities
 */
export const starfieldUtils = {
  setSpeed: (speed: number) => {
    if (starfieldManager) {
      starfieldManager.setSpeed(speed);
    }
  },

  setDistribution: (type: 'galaxy' | 'nebula' | 'cluster' | 'uniform' | 'radial') => {
    if (starfieldManager) {
      starfieldManager.setDistributionType(type);
    }
  },

  setMaxStars: (maxStars: number) => {
    if (starfieldManager) {
      starfieldManager.setMaxStars(maxStars);
    }
  },

  getActiveStarCount: (): number => {
    return starfieldManager ? starfieldManager.getActiveStarCount() : 0;
  },

  getCameraPosition: (): THREE.Vector3 => {
    return starfieldManager ? starfieldManager.getCameraPosition() : new THREE.Vector3();
  }
};

/**
 * Cleanup function
 */
export const disposeStarfieldScene = (): void => {
  if (starfieldManager) {
    starfieldManager.dispose();
    starfieldManager = null;
  }

  if (interactionParticles) {
    interactionParticles.dispose();
    interactionParticles = null;
  }

  currentCamera = null;
};