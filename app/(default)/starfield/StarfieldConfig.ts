import * as THREE from 'three';

// Camera configuration interfaces
interface BaseCameraConfig {
  position?: [number, number, number];
  lookAt?: [number, number, number];
}

interface PerspectiveCameraConfig extends BaseCameraConfig {
  type: 'perspective';
  fov?: number;
  near?: number;
  far?: number;
}

interface OrthographicCameraConfig extends BaseCameraConfig {
  type: 'orthographic';
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  near?: number;
  far?: number;
}

export type CameraConfig = PerspectiveCameraConfig | OrthographicCameraConfig;

// Sizing configuration interfaces
interface SizingAuto {
  mode: 'auto-fill';
}

interface SizingFixed {
  mode: 'fixed';
  width: number;
  height: number;
}

export type SizingConfig = SizingAuto | SizingFixed;

// Afterimage effect configuration
export interface AfterimageConfig {
  enabled?: boolean;
  damp?: number;
  oscillation?: {
    min: number;
    max: number;
    speed: number;
  };
}

// Zoom afterimage effect configuration with transformations
export interface ZoomAfterimageConfig {
  enabled?: boolean;
  damp?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
  rotation?: number;
  oscillation?: {
    damp?: { min: number; max: number; speed: number };
    scaleX?: { min: number; max: number; speed: number };
    scaleY?: { min: number; max: number; speed: number };
    translateX?: { min: number; max: number; speed: number };
    translateY?: { min: number; max: number; speed: number };
    rotation?: { min: number; max: number; speed: number };
  };
}

// Unified configuration interface combining all renderer and starfield settings !
export interface StarfieldConfig {
  // Renderer settings
  sizing: SizingConfig;
  camera: CameraConfig;
  frameRate?: number;
  background?: string | 'transparent';
  antialias?: boolean;
  alpha?: boolean;
  shadowMapEnabled?: boolean;
  shadowMapType?: THREE.ShadowMapType;
  pixelRatio?: number;
  afterimage?: AfterimageConfig;
  zoomAfterimage?: ZoomAfterimageConfig;

  // Movement and speed
  speed: number;
  spinSpeed: number;
  cameraSpeed: number;
  drift?: boolean;
  driftSpeed?: number;
  minDriftDuration?: number;
  maxDriftDuration?: number;

  // Star properties
  maxStars: number;
  starSizeMin: number;
  starSizeMax: number;
  cullingDistance: number;
  spawnDistance: number;

  // Distribution algorithm
  distributionType: 'galaxy' | 'nebula' | 'cluster' | 'uniform' | 'radial';
  distributionRadius: number;
  distributionDensity: number;

  // Visual effects
  colors: number[];
  fogColor: number;
  fogNear: number;
  fogFar: number;
  lightIntensity: number;
  lightDistance: number;
  blendMode?: 'additive' | 'normal' | 'multiply' | 'screen' | 'subtract';

  // Phoenix sprite settings
  phoenixPulse?: boolean;
  phoenixPulseSpeed?: number;
  phoenixPulseAmplitude?: number;
  phoenixBloom?: boolean;
  phoenixBloomStrength?: number;
  phoenixBloomOscillate?: boolean;
  phoenixBloomOscillateSpeed?: number;
  phoenixBloomMin?: number;
  phoenixBloomMax?: number;

  // Performance
  instanceBatchSize: number;
  updateFrequency: number;
}

export const DEFAULT_STARFIELD_CONFIG: StarfieldConfig = {
  // Renderer settings
  sizing: { mode: 'auto-fill' },
  camera: {
    type: 'perspective',
    position: [0, 0, 0],
    lookAt: [0, 0, -100],
    fov: 90,
    near: 0.1,
    far: 2000
  },
  frameRate: 60,
  background: 'black',
  antialias: true,
  alpha: true,
  shadowMapEnabled: false,
  shadowMapType: THREE.PCFSoftShadowMap,
  zoomAfterimage: {
    enabled: true,
    damp: 0.1,
    scaleX: 1.003,
    scaleY: 1.003,
    translateX: 0.0,
    translateY: 0.0,
    rotation: 0.0,
    oscillation: {
      damp: { min: 0.94, max: 0.98, speed: 0.15 },
      scaleX: { min: 1.001, max: 1.005, speed: 0.08 },
      scaleY: { min: 1.001, max: 1.005, speed: 0.08 }
    }
  },

  // Movement and speed
  speed: 50,
  spinSpeed: 0.001,
  cameraSpeed: 20,
  drift: false,
  driftSpeed: 1.0,
  minDriftDuration: 10.0,
  maxDriftDuration: 20.0,

  // Star properties
  maxStars: 500, // Increased for denser starfield
  starSizeMin: 0.5,
  starSizeMax: 4.0, // Slightly larger max size for better visibility
  cullingDistance: 350, // Reduced to prevent z-fighting with galaxy background
  spawnDistance: 400, // Reduced spawn distance to keep stars in proper depth range

  // Distribution algorithm
  distributionType: 'galaxy',
  distributionRadius: 300, // Increased for wider star field coverage
  distributionDensity: 1,

  // Visual effects
  colors: [0xffffff, 0xffffcc, 0xccccff, 0xffcccc, 0xccffcc, 0xffccff],
  fogColor: 0x4488aa,
  fogNear: 50,
  fogFar: 350, // Reduced to match culling distance
  lightIntensity: 2,
  lightDistance: 100,
  blendMode: 'additive',

  // Phoenix sprite settings
  phoenixPulse: true,
  phoenixPulseSpeed: 0.8,
  phoenixPulseAmplitude: 20,
  phoenixBloom: true,
  phoenixBloomStrength: 10,
  phoenixBloomOscillate: true,
  phoenixBloomOscillateSpeed: 1.0,
  phoenixBloomMin: 0.8,
  phoenixBloomMax: 8,

  // Performance
  instanceBatchSize: 100,
  updateFrequency: 60
};