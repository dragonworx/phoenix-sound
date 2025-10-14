"use client";

import { useCallback, useMemo } from "react";
import * as THREE from "three";
import ThreeRenderer from "./ThreeRenderer";
import { starfieldScene, updateStarfieldScene, handleInteraction } from "../../starfieldScene";
import {
  StarfieldConfig,
  DEFAULT_STARFIELD_CONFIG,
} from "../../starfield/StarfieldConfig";

interface StarfieldRendererProps {
  config?: Partial<StarfieldConfig>;
  onCanvasClick?: () => void;
}

export default function StarfieldRenderer({
  config: userConfig = {},
  onCanvasClick,
}: StarfieldRendererProps) {
  // Merge user config with defaults and memoize to prevent unnecessary re-renders
  const finalConfig: StarfieldConfig = useMemo(
    () => ({
      ...DEFAULT_STARFIELD_CONFIG,
      ...userConfig,
    }),
    [userConfig]
  );

  const onInit = useCallback(
    (
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.Camera
    ) => {
      // Initialize starfield scene with the merged config
      starfieldScene(renderer, scene, camera, finalConfig);
    },
    [finalConfig]
  );

  const onUpdate = useCallback((deltaTime: number, elapsedTime: number) => {
    updateStarfieldScene(deltaTime, elapsedTime);
  }, []);

  const onCanvasInteraction = useCallback(
    (worldPosition: THREE.Vector3, camera: THREE.Camera) => {
      handleInteraction(worldPosition, camera);
    },
    []
  );

  return (
    <ThreeRenderer
      config={finalConfig}
      onInit={onInit}
      onUpdate={onUpdate}
      onCanvasClick={onCanvasClick}
      onCanvasInteraction={onCanvasInteraction}
    />
  );
}
