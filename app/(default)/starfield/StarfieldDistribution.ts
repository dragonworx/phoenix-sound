import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';

export class StarfieldDistribution {
  private static readonly PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

  static generatePosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3,
    index?: number
  ): THREE.Vector3 {
    switch (config.distributionType) {
      case 'galaxy':
        return this.generateGalaxyPosition(config, cameraPosition, index);
      case 'nebula':
        return this.generateNebulaPosition(config, cameraPosition);
      case 'cluster':
        return this.generateClusterPosition(config, cameraPosition);
      case 'uniform':
      default:
        return this.generateUniformPosition(config, cameraPosition);
    }
  }

  private static generateGalaxyPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3,
    index: number = Math.random() * 1000
  ): THREE.Vector3 {
    // Create spiral galaxy pattern using golden angle
    const goldenAngle = Math.PI * 2 * (1 - 1/this.PHI);
    const angle = index * goldenAngle;

    // Distance from center with some randomness
    const t = Math.pow(Math.random(), 0.8); // Bias towards outer edges
    const radius = config.distributionRadius * t;

    // Add spiral arms
    const spiralArms = 2;
    const armAngle = (angle + Math.sin(radius * 0.02) * spiralArms) % (Math.PI * 2);

    // Position in spiral
    const x = Math.cos(armAngle) * radius * (0.8 + Math.random() * 0.4);
    const z = Math.sin(armAngle) * radius * (0.8 + Math.random() * 0.4);

    // Expanded vertical distribution to fill the view height
    // Use both galactic disk pattern and wider spread for visual coverage
    const diskThickness = (Math.random() - 0.5) * (config.distributionRadius * 0.15) * Math.exp(-radius * 0.008);
    const wideSpread = (Math.random() - 0.5) * config.distributionRadius * 0.8;
    const y = Math.random() < 0.7 ? diskThickness : wideSpread;

    // Position relative to camera spawn distance (spawn in front of camera)
    // Ensure stars don't get too close to galaxy plane at z=-1800
    const clampedZ = Math.max(z, -config.spawnDistance + 200); // Keep 200 units away from galaxy
    const basePosition = new THREE.Vector3(x, y, cameraPosition.z - config.spawnDistance + clampedZ);

    return basePosition;
  }

  private static generateNebulaPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3
  ): THREE.Vector3 {
    // Create nebula-like cloud distribution with noise
    const centerOffset = new THREE.Vector3(
      (Math.random() - 0.5) * config.distributionRadius * 0.5,
      (Math.random() - 0.5) * config.distributionRadius * 0.8, // Increased height spread
      0
    );

    // Use Perlin-like noise pattern for clustering
    const scale = 0.05;
    const x = (Math.random() - 0.5) * config.distributionRadius;
    const y = (Math.random() - 0.5) * config.distributionRadius * 1.2; // Increased height range
    const z = (Math.random() - 0.5) * config.distributionRadius * 0.8;

    // Add noise-based clustering
    const noiseX = Math.sin(x * scale) * Math.cos(y * scale) * config.distributionRadius * 0.3;
    const noiseY = Math.cos(x * scale) * Math.sin(z * scale) * config.distributionRadius * 0.4; // Enhanced Y noise
    const noiseZ = Math.sin(y * scale) * Math.cos(z * scale) * config.distributionRadius * 0.3;

    // Ensure nebula stars don't get too close to galaxy plane
    const clampedZ = Math.max(-z + noiseZ, -config.spawnDistance + 200);
    const position = new THREE.Vector3(
      x + noiseX + centerOffset.x,
      y + noiseY + centerOffset.y,
      cameraPosition.z + clampedZ
    );

    return position;
  }

  private static generateClusterPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3
  ): THREE.Vector3 {
    // Create multiple star clusters with better vertical distribution
    const numClusters = 7; // Added more clusters for better coverage
    const clusterIndex = Math.floor(Math.random() * numClusters);

    // Cluster centers arranged with improved vertical spread
    const clusterCenters = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(config.distributionRadius * 0.6, config.distributionRadius * 0.6, -config.distributionRadius * 0.4),
      new THREE.Vector3(-config.distributionRadius * 0.4, -config.distributionRadius * 0.7, -config.distributionRadius * 0.6),
      new THREE.Vector3(config.distributionRadius * 0.3, -config.distributionRadius * 0.8, config.distributionRadius * 0.3),
      new THREE.Vector3(-config.distributionRadius * 0.7, config.distributionRadius * 0.7, config.distributionRadius * 0.2),
      new THREE.Vector3(config.distributionRadius * 0.5, config.distributionRadius * 0.9, -config.distributionRadius * 0.3),
      new THREE.Vector3(-config.distributionRadius * 0.6, -config.distributionRadius * 0.9, config.distributionRadius * 0.5)
    ];

    const clusterCenter = clusterCenters[clusterIndex];
    const clusterRadius = config.distributionRadius * (0.2 + Math.random() * 0.3);

    // Generate position within cluster using normal distribution
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * clusterRadius * Math.pow(Math.random(), 0.5); // Bias towards center

    const x = clusterCenter.x + Math.cos(angle) * distance;
    const y = clusterCenter.y + (Math.random() - 0.5) * clusterRadius * 0.8; // Increased Y spread within clusters
    const z = clusterCenter.z + Math.sin(angle) * distance;

    // Ensure cluster stars don't get too close to galaxy plane
    const clampedZ = Math.max(-z, -config.spawnDistance + 200);
    const position = new THREE.Vector3(
      x,
      y,
      cameraPosition.z + clampedZ
    );

    return position;
  }

  private static generateUniformPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3
  ): THREE.Vector3 {
    // Simple uniform random distribution
    const x = (Math.random() - 0.5) * config.distributionRadius * 2;
    const y = (Math.random() - 0.5) * config.distributionRadius * 2;
    const z = Math.random() * config.distributionRadius - config.spawnDistance;

    // Ensure uniform stars don't get too close to galaxy plane
    const clampedZ = Math.max(-z, -config.spawnDistance + 200);
    return new THREE.Vector3(x, y, cameraPosition.z + clampedZ);
  }

  static generateStarColor(config: StarfieldConfig): number {
    // Use white color to preserve source texture colors and alpha transparency
    return 0xffffff;
  }

  static generateStarSize(config: StarfieldConfig): number {
    // Generate size with bias towards smaller stars
    const t = Math.pow(Math.random(), 2); // Bias towards smaller values
    return config.starSizeMin + (config.starSizeMax - config.starSizeMin) * (1 - t);
  }
}