'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

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

type CameraConfig = PerspectiveCameraConfig | OrthographicCameraConfig;

interface SizingAuto {
  mode: 'auto-fill';
}

interface SizingFixed {
  mode: 'fixed';
  width: number;
  height: number;
}

type SizingConfig = SizingAuto | SizingFixed;

interface ThreeRendererProps {
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
  onInit?: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => void;
  onUpdate?: (deltaTime: number, elapsedTime: number) => void;
  onResize?: (width: number, height: number) => void;
}

export default function ThreeRenderer({
  scene: externalScene,
  sizing,
  camera: cameraConfig,
  frameRate = 60,
  background = '#000000',
  antialias = true,
  alpha = false,
  shadowMapEnabled = false,
  shadowMapType = THREE.PCFSoftShadowMap,
  pixelRatio,
  onInit,
  onUpdate,
  onResize
}: ThreeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
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
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    const elapsedTime = currentTime / 1000;

    const targetFrameTime = 1000 / frameRate;

    if (currentTime - lastTimeRef.current >= targetFrameTime) {
      onUpdate?.(deltaTime, elapsedTime);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      lastTimeRef.current = currentTime;
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }, [frameRate, onUpdate]);

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

    lastTimeRef.current = performance.now();
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, [externalScene, createCamera, antialias, alpha, shadowMapEnabled, shadowMapType, pixelRatio, background, sizing, onInit, animate]);

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