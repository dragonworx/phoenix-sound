import * as THREE from 'three';
import { StarfieldConfig } from './StarfieldConfig';

export class StarfieldDistribution {
  private static readonly PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
  private static camera: THREE.Camera | null = null;

  static setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

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
      case 'radial':
        return this.generateRadialPosition(config, cameraPosition);
      case 'uniform':
      default:
        return this.generateUniformPosition(config, cameraPosition);
    }
  }

  private static getViewFrustumBounds(distance: number): { width: number; height: number } {
    let width = 800;
    let height = 600;

    if (this.camera instanceof THREE.PerspectiveCamera) {
      const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
      const aspect = this.camera.aspect || (16 / 9);
      height = 2 * Math.tan(fov / 2) * distance;
      width = height * aspect;
    }

    return { width, height };
  }

  private static generateGalaxyPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3,
    index: number = Math.random() * 1000
  ): THREE.Vector3 {
    // Get viewport bounds at spawn distance to ensure uniform coverage
    const spawnDistance = config.spawnDistance;
    const { width: viewWidth, height: viewHeight } = this.getViewFrustumBounds(spawnDistance);

    // Use a hybrid approach: some stars follow galaxy pattern, others fill viewport uniformly
    const useUniformDistribution = Math.random() < 0.4; // 40% uniform fill for immediate coverage

    if (useUniformDistribution) {
      // Uniform distribution within view frustum for immediate star coverage
      const x = (Math.random() - 0.5) * viewWidth * 1.5; // Extend beyond viewport edge
      const y = (Math.random() - 0.5) * viewHeight * 1.5;
      const z = -spawnDistance * (0.5 + Math.random() * 0.5); // Vary depth

      return new THREE.Vector3(x, y, cameraPosition.z + z);
    }

    // Original galaxy pattern for 60% of stars
    const goldenAngle = Math.PI * 2 * (1 - 1/this.PHI);
    const angle = index * goldenAngle;

    // Distance from center with some randomness
    const t = Math.pow(Math.random(), 0.6); // Less bias towards outer edges
    const radius = Math.min(config.distributionRadius * t, Math.max(viewWidth, viewHeight) * 0.7);

    // Add spiral arms
    const spiralArms = 2;
    const armAngle = (angle + Math.sin(radius * 0.02) * spiralArms) % (Math.PI * 2);

    // Position in spiral, scaled to viewport
    const maxRadius = Math.max(viewWidth, viewHeight) * 0.6;
    const scaledRadius = Math.min(radius, maxRadius);
    const x = Math.cos(armAngle) * scaledRadius * (0.8 + Math.random() * 0.4);
    const z_spiral = Math.sin(armAngle) * scaledRadius * (0.8 + Math.random() * 0.4);

    // Improved vertical distribution - scale to viewport height
    const diskThickness = (Math.random() - 0.5) * (viewHeight * 0.1) * Math.exp(-scaledRadius * 0.01);
    const wideSpread = (Math.random() - 0.5) * viewHeight * 0.8;
    const y = Math.random() < 0.6 ? diskThickness : wideSpread;

    // Position relative to camera spawn distance
    const clampedZ = Math.max(z_spiral, -spawnDistance + 200);
    const basePosition = new THREE.Vector3(x, y, cameraPosition.z - spawnDistance + clampedZ);

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
    // Viewport-aware cluster distribution
    const spawnDistance = config.spawnDistance;
    const { width: viewWidth, height: viewHeight } = this.getViewFrustumBounds(spawnDistance);

    // Create multiple star clusters scaled to viewport
    const numClusters = 7;
    const clusterIndex = Math.floor(Math.random() * numClusters);

    // Scale cluster centers to viewport dimensions
    const maxDimension = Math.max(viewWidth, viewHeight);
    const clusterCenters = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(viewWidth * 0.3, viewHeight * 0.3, -spawnDistance * 0.4),
      new THREE.Vector3(-viewWidth * 0.2, -viewHeight * 0.35, -spawnDistance * 0.6),
      new THREE.Vector3(viewWidth * 0.15, -viewHeight * 0.4, spawnDistance * 0.3),
      new THREE.Vector3(-viewWidth * 0.35, viewHeight * 0.35, spawnDistance * 0.2),
      new THREE.Vector3(viewWidth * 0.25, viewHeight * 0.45, -spawnDistance * 0.3),
      new THREE.Vector3(-viewWidth * 0.3, -viewHeight * 0.45, spawnDistance * 0.5)
    ];

    const clusterCenter = clusterCenters[clusterIndex];
    const clusterRadius = maxDimension * (0.1 + Math.random() * 0.15); // Scale to viewport

    // Generate position within cluster using normal distribution
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * clusterRadius * Math.pow(Math.random(), 0.5);

    const x = clusterCenter.x + Math.cos(angle) * distance;
    const y = clusterCenter.y + (Math.random() - 0.5) * clusterRadius * 0.8;
    const z = clusterCenter.z + Math.sin(angle) * distance;

    // Ensure cluster stars don't get too close to galaxy plane
    const clampedZ = Math.max(z, -spawnDistance + 200);
    const position = new THREE.Vector3(
      x,
      y,
      cameraPosition.z + clampedZ
    );

    return position;
  }

  private static generateRadialPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3
  ): THREE.Vector3 {
    // Viewport-aware radial distribution
    const spawnDistance = config.spawnDistance;
    const { width: viewWidth, height: viewHeight } = this.getViewFrustumBounds(spawnDistance);

    // Use viewport height as the maximum radius to ensure stars fill the vertical view
    const maxRadius = viewHeight * 0.5; // Half of viewport height as max radius

    // Generate random radius with bias towards outer edges for better coverage
    const radiusBias = Math.pow(Math.random(), 0.7); // Slight bias towards larger radii
    const radius = maxRadius * radiusBias;

    // Random angle around the circle
    const angle = Math.random() * Math.PI * 2;

    // Convert polar coordinates to cartesian
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Random depth distribution across the spawn distance range
    const depthVariation = Math.random(); // 0 to 1
    const z = -spawnDistance * (0.3 + depthVariation * 0.7); // 30% to 100% of spawn distance

    // Ensure stars don't get too close
    const clampedZ = Math.max(z, -spawnDistance + 100);

    return new THREE.Vector3(x, y, cameraPosition.z + clampedZ);
  }

  private static generateUniformPosition(
    config: StarfieldConfig,
    cameraPosition: THREE.Vector3
  ): THREE.Vector3 {
    // Viewport-aware uniform distribution
    const spawnDistance = config.spawnDistance;
    const { width: viewWidth, height: viewHeight } = this.getViewFrustumBounds(spawnDistance);

    // Distribute uniformly across the viewport with some padding
    const x = (Math.random() - 0.5) * viewWidth * 2;
    const y = (Math.random() - 0.5) * viewHeight * 2;
    const z = Math.random() * spawnDistance * 0.5 - spawnDistance;

    // Ensure uniform stars don't get too close to galaxy plane
    const clampedZ = Math.max(z, -spawnDistance + 200);
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