import * as THREE from 'three';

export interface StarfieldConfig {
  // Movement and speed
  speed: number;
  spinSpeed: number;
  cameraSpeed: number;

  // Star properties
  maxStars: number;
  starSizeMin: number;
  starSizeMax: number;
  cullingDistance: number;
  spawnDistance: number;

  // Distribution algorithm
  distributionType: 'galaxy' | 'nebula' | 'cluster' | 'uniform';
  distributionRadius: number;
  distributionDensity: number;

  // Visual effects
  colors: number[];
  fogColor: number;
  fogNear: number;
  fogFar: number;
  lightIntensity: number;
  lightDistance: number;

  // Performance
  instanceBatchSize: number;
  updateFrequency: number;
}

export const DEFAULT_STARFIELD_CONFIG: StarfieldConfig = {
  // Movement and speed
  speed: 50,
  spinSpeed: 0.001,
  cameraSpeed: 20,

  // Star properties
  maxStars: 500,
  starSizeMin: 0.5,
  starSizeMax: 3.0,
  cullingDistance: 200,
  spawnDistance: 300,

  // Distribution algorithm
  distributionType: 'galaxy',
  distributionRadius: 150,
  distributionDensity: 0.8,

  // Visual effects
  colors: [0xffffff, 0xffffcc, 0xccccff, 0xffcccc, 0xccffcc, 0xffccff],
  fogColor: 0x4488aa,
  fogNear: 50,
  fogFar: 400,
  lightIntensity: 2,
  lightDistance: 100,

  // Performance
  instanceBatchSize: 100,
  updateFrequency: 60
};