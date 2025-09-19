'use client';

import { useCallback } from 'react';
import * as THREE from 'three';
import ThreeRenderer from './ThreeRenderer';
import { starfieldScene, updateStarfieldScene } from '../../starfieldScene';
import { StarfieldConfig, DEFAULT_STARFIELD_CONFIG } from '../../starfield/StarfieldConfig';

interface StarfieldRendererProps {
  config?: Partial<StarfieldConfig>;
}

export default function StarfieldRenderer({
  config: userConfig = {}
}: StarfieldRendererProps) {
  // Merge user config with defaults
  const finalConfig: StarfieldConfig = { ...DEFAULT_STARFIELD_CONFIG, ...userConfig };

  const onInit = useCallback((renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    // Initialize starfield scene with the merged config
    starfieldScene(renderer, scene, camera, finalConfig);
  }, [finalConfig]);

  const onUpdate = useCallback((deltaTime: number, elapsedTime: number) => {
    updateStarfieldScene(deltaTime, elapsedTime);
  }, []);

  return (
    <ThreeRenderer
      config={finalConfig}
      onInit={onInit}
      onUpdate={onUpdate}
    />
  );
}