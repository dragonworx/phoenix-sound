'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { StarfieldConfig, CameraConfig, SizingConfig, AfterimageConfig } from '../starfield/StarfieldConfig';

interface ThreeRendererProps {
  scene?: THREE.Scene;
  config?: Partial<StarfieldConfig>;
  onInit?: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
  onUpdate?: (deltaTime: number, elapsedTime: number) => void;
  onResize?: (width: number, height: number) => void;
}

// Legacy interface for backwards compatibility if needed
interface LegacyThreeRendererProps {
  scene?: THREE.Scene;
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
  onInit?: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
  onUpdate?: (deltaTime: number, elapsedTime: number) => void;
  onResize?: (width: number, height: number) => void;
}

export default function ThreeRenderer({
  scene: externalScene,
  config = {},
  onInit,
  onUpdate,
  onResize
}: ThreeRendererProps) {
  // Extract renderer settings from config with defaults
  const sizing = config.sizing ?? { mode: 'auto-fill' };
  const cameraConfig = config.camera ?? {
    type: 'perspective',
    position: [0, 0, 0],
    lookAt: [0, 0, -100],
    fov: 75,
    near: 0.1,
    far: 1000
  };
  const frameRate = config.frameRate ?? 60;
  const background = config.background ?? '#000000';
  const antialias = config.antialias ?? true;
  const alpha = config.alpha ?? false;
  const shadowMapEnabled = config.shadowMapEnabled ?? false;
  const shadowMapType = config.shadowMapType ?? THREE.PCFSoftShadowMap;
  const pixelRatio = config.pixelRatio;
  const afterimage = config.afterimage;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const afterimagePassRef = useRef<AfterimagePass | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createCamera = useCallback((width: number, height: number): THREE.Camera => {
    const aspect = width / height;

    if (cameraConfig.type === 'perspective') {
      const camera = new THREE.PerspectiveCamera(
        cameraConfig.fov ?? 75,
        aspect,
        cameraConfig.near ?? 0.1,
        cameraConfig.far ?? 1000
      );

      if (cameraConfig.position) {
        camera.position.set(...cameraConfig.position);
      } else {
        camera.position.set(0, 0, 5);
      }

      if (cameraConfig.lookAt) {
        camera.lookAt(...cameraConfig.lookAt);
      }

      return camera;
    } else {
      const frustumSize = 10;
      const camera = new THREE.OrthographicCamera(
        cameraConfig.left ?? (-frustumSize * aspect) / 2,
        cameraConfig.right ?? (frustumSize * aspect) / 2,
        cameraConfig.top ?? frustumSize / 2,
        cameraConfig.bottom ?? -frustumSize / 2,
        cameraConfig.near ?? 0.1,
        cameraConfig.far ?? 1000
      );

      if (cameraConfig.position) {
        camera.position.set(...cameraConfig.position);
      } else {
        camera.position.set(0, 0, 5);
      }

      if (cameraConfig.lookAt) {
        camera.lookAt(...cameraConfig.lookAt);
      }

      return camera;
    }
  }, [cameraConfig]);

  const handleResize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !containerRef.current) return;

    let width: number;
    let height: number;

    if (sizing.mode === 'auto-fill') {
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
    } else {
      width = sizing.width;
      height = sizing.height;
    }

    rendererRef.current.setSize(width, height);
    composerRef.current?.setSize(width, height);

    if (cameraRef.current instanceof THREE.PerspectiveCamera) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    } else if (cameraRef.current instanceof THREE.OrthographicCamera) {
      const aspect = width / height;
      const frustumSize = 10;
      cameraRef.current.left = (-frustumSize * aspect) / 2;
      cameraRef.current.right = (frustumSize * aspect) / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = -frustumSize / 2;
      cameraRef.current.updateProjectionMatrix();
    }

    onResize?.(width, height);
  }, [sizing, onResize]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const currentTime = performance.now();
    const elapsedTime = currentTime / 1000;

    const targetFrameTime = 1000 / frameRate;

    if (currentTime - lastTimeRef.current >= targetFrameTime) {
      // Calculate deltaTime based on target frame rate, not actual frame time
      const deltaTime = targetFrameTime / 1000;
      onUpdate?.(deltaTime, elapsedTime);

      if (afterimagePassRef.current && afterimage) {
        afterimagePassRef.current.enabled = afterimage.enabled ?? true;

        // Handle oscillation or static damp value
        if (afterimage.oscillation) {
          const { min, max, speed } = afterimage.oscillation;
          const oscillationValue = Math.sin(elapsedTime * speed) * 0.5 + 0.5; // Normalize to 0-1
          afterimagePassRef.current.damp = min + (max - min) * oscillationValue;
        } else if (afterimage.damp !== undefined) {
          afterimagePassRef.current.damp = afterimage.damp;
        }
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      lastTimeRef.current = currentTime;
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }, [frameRate, onUpdate, afterimage?.enabled]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let width: number;
    let height: number;

    if (sizing.mode === 'auto-fill') {
      width = containerRef.current.clientWidth || 800;
      height = containerRef.current.clientHeight || 600;
    } else {
      width = sizing.width;
      height = sizing.height;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias,
      alpha,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio ?? window.devicePixelRatio);

    // Disable tone mapping and color management to preserve original texture colors
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // Prevent sRGB conversion

    if (shadowMapEnabled) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = shadowMapType;
    }

    if (background === 'transparent') {
      renderer.setClearColor(0x000000, 0);
    } else {
      renderer.setClearColor(background);
    }

    const scene = externalScene || new THREE.Scene();
    const camera = createCamera(width, height);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    onInit?.(renderer, scene, camera);

    // Setup postprocessing if afterimage is enabled
    if (afterimage) {
      const composer = new EffectComposer(renderer);

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const afterimagePass = new AfterimagePass();
      afterimagePass.damp = afterimage.damp ?? 0.96;
      composer.addPass(afterimagePass);

      const outputPass = new OutputPass();
      outputPass.toneMapping = THREE.NoToneMapping; // Disable tone mapping to preserve original colors
      composer.addPass(outputPass);

      composerRef.current = composer;
      afterimagePassRef.current = afterimagePass;
    }

    lastTimeRef.current = performance.now();
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      composerRef.current?.dispose();
      renderer.dispose();
    };
  }, [externalScene, createCamera, antialias, alpha, shadowMapEnabled, shadowMapType, pixelRatio, background, sizing, afterimage, onInit, animate]);

  useEffect(() => {
    if (sizing.mode === 'auto-fill') {
      const resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      window.addEventListener('resize', handleResize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [handleResize, sizing.mode]);

  const containerStyle: React.CSSProperties = sizing.mode === 'auto-fill'
    ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
    : { width: sizing.width, height: sizing.height };

  const canvasStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
}