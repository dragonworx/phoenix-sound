"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  StarfieldConfig,
  CameraConfig,
  SizingConfig,
  AfterimageConfig,
  ZoomAfterimageConfig,
} from "../../starfield/StarfieldConfig";
import { ZoomAfterimagePass } from "../../effects/ZoomAfterimagePass";

interface ThreeRendererProps {
  scene?: THREE.Scene;
  config?: Partial<StarfieldConfig>;
  onInit?: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => void;
  onUpdate?: (deltaTime: number, elapsedTime: number) => void;
  onResize?: (width: number, height: number) => void;
}

// Legacy interface for backwards compatibility if needed
interface LegacyThreeRendererProps {
  scene?: THREE.Scene;
  sizing: SizingConfig;
  camera: CameraConfig;
  frameRate?: number;
  background?: string | "transparent";
  antialias?: boolean;
  alpha?: boolean;
  shadowMapEnabled?: boolean;
  shadowMapType?: THREE.ShadowMapType;
  pixelRatio?: number;
  afterimage?: AfterimageConfig;
  onInit?: (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) => void;
  onUpdate?: (deltaTime: number, elapsedTime: number) => void;
  onResize?: (width: number, height: number) => void;
}

export default function ThreeRenderer({
  scene: externalScene,
  config = {},
  onInit,
  onUpdate,
  onResize,
}: ThreeRendererProps) {
  // Extract renderer settings from config with defaults
  const sizing = config.sizing ?? { mode: "auto-fill" };
  const cameraConfig = config.camera ?? {
    type: "perspective",
    position: [0, 0, 0],
    lookAt: [0, 0, -100],
    fov: 75,
    near: 0.1,
    far: 1000,
  };
  const frameRate = config.frameRate ?? 60;
  const background = config.background ?? "#000000";
  const antialias = config.antialias ?? true;
  const alpha = config.alpha ?? false;
  const shadowMapEnabled = config.shadowMapEnabled ?? false;
  const shadowMapType = config.shadowMapType ?? THREE.PCFSoftShadowMap;
  const pixelRatio = config.pixelRatio;
  const afterimage = config.afterimage;
  const zoomAfterimage = config.zoomAfterimage;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const afterimagePassRef = useRef<AfterimagePass | null>(null);
  const zoomAfterimagePassRef = useRef<ZoomAfterimagePass | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createCamera = useCallback(
    (width: number, height: number): THREE.Camera => {
      const aspect = width / height;

      if (cameraConfig.type === "perspective") {
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
    },
    [cameraConfig]
  );

  const handleResize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !containerRef.current)
      return;

    let width: number;
    let height: number;

    if (sizing.mode === "auto-fill") {
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

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let width: number;
    let height: number;

    if (sizing.mode === "auto-fill") {
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

    if (background === "transparent") {
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

    // Setup postprocessing if afterimage or zoomAfterimage is enabled
    if (afterimage || zoomAfterimage) {
      const composer = new EffectComposer(renderer);

      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      if (zoomAfterimage) {
        const zoomAfterimagePass = new ZoomAfterimagePass(
          zoomAfterimage.damp ?? 0.96,
          {
            scaleX: zoomAfterimage.scaleX ?? 1.002,
            scaleY: zoomAfterimage.scaleY ?? 1.002,
            translateX: zoomAfterimage.translateX ?? 0.0,
            translateY: zoomAfterimage.translateY ?? 0.0,
            rotation: zoomAfterimage.rotation ?? 0.0,
            enabled: zoomAfterimage.enabled ?? true,
          }
        );
        composer.addPass(zoomAfterimagePass);
        zoomAfterimagePassRef.current = zoomAfterimagePass;
      } else if (afterimage) {
        const afterimagePass = new AfterimagePass();
        afterimagePass.damp = afterimage.damp ?? 0.96;
        composer.addPass(afterimagePass);
        afterimagePassRef.current = afterimagePass;
      }

      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      composerRef.current = composer;
    }

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;

      const currentTime = performance.now();
      const elapsedTime = currentTime / 1000;

      const targetFrameTime = 1000 / frameRate;

      if (currentTime - lastTimeRef.current >= targetFrameTime) {
        // Calculate deltaTime based on target frame rate, not actual frame time
        const deltaTime = targetFrameTime / 1000;
        onUpdate?.(deltaTime, elapsedTime);

        // Update zoom afterimage pass
        if (zoomAfterimagePassRef.current && zoomAfterimage) {
          zoomAfterimagePassRef.current.enabled =
            zoomAfterimage.enabled ?? true;

          // Handle oscillations for all parameters
          if (zoomAfterimage.oscillation) {
            const osc = zoomAfterimage.oscillation;

            if (osc.damp) {
              const dampOsc =
                Math.sin(elapsedTime * osc.damp.speed) * 0.5 + 0.5;
              zoomAfterimagePassRef.current.damp =
                osc.damp.min + (osc.damp.max - osc.damp.min) * dampOsc;
            }

            if (osc.scaleX) {
              const scaleXOsc =
                Math.sin(elapsedTime * osc.scaleX.speed) * 0.5 + 0.5;
              zoomAfterimagePassRef.current.scaleX =
                osc.scaleX.min + (osc.scaleX.max - osc.scaleX.min) * scaleXOsc;
            }

            if (osc.scaleY) {
              const scaleYOsc =
                Math.sin(elapsedTime * osc.scaleY.speed) * 0.5 + 0.5;
              zoomAfterimagePassRef.current.scaleY =
                osc.scaleY.min + (osc.scaleY.max - osc.scaleY.min) * scaleYOsc;
            }

            if (osc.translateX) {
              const translateXOsc = Math.sin(
                elapsedTime * osc.translateX.speed
              );
              zoomAfterimagePassRef.current.translateX =
                osc.translateX.min +
                (osc.translateX.max - osc.translateX.min) *
                  (translateXOsc * 0.5 + 0.5);
            }

            if (osc.translateY) {
              const translateYOsc = Math.sin(
                elapsedTime * osc.translateY.speed
              );
              zoomAfterimagePassRef.current.translateY =
                osc.translateY.min +
                (osc.translateY.max - osc.translateY.min) *
                  (translateYOsc * 0.5 + 0.5);
            }

            if (osc.rotation) {
              const rotationOsc = Math.sin(elapsedTime * osc.rotation.speed);
              zoomAfterimagePassRef.current.rotation =
                osc.rotation.min +
                (osc.rotation.max - osc.rotation.min) *
                  (rotationOsc * 0.5 + 0.5);
            }
          } else {
            // Use static values
            if (zoomAfterimage.damp !== undefined)
              zoomAfterimagePassRef.current.damp = zoomAfterimage.damp;
            if (zoomAfterimage.scaleX !== undefined)
              zoomAfterimagePassRef.current.scaleX = zoomAfterimage.scaleX;
            if (zoomAfterimage.scaleY !== undefined)
              zoomAfterimagePassRef.current.scaleY = zoomAfterimage.scaleY;
            if (zoomAfterimage.translateX !== undefined)
              zoomAfterimagePassRef.current.translateX =
                zoomAfterimage.translateX;
            if (zoomAfterimage.translateY !== undefined)
              zoomAfterimagePassRef.current.translateY =
                zoomAfterimage.translateY;
            if (zoomAfterimage.rotation !== undefined)
              zoomAfterimagePassRef.current.rotation = zoomAfterimage.rotation;
          }
        }

        // Fallback to regular afterimage if zoom afterimage is not used
        if (afterimagePassRef.current && afterimage && !zoomAfterimage) {
          afterimagePassRef.current.enabled = afterimage.enabled ?? true;

          // Handle oscillation or static damp value
          if (afterimage.oscillation) {
            const { min, max, speed } = afterimage.oscillation;
            const oscillationValue = Math.sin(elapsedTime * speed) * 0.5 + 0.5; // Normalize to 0-1
            afterimagePassRef.current.damp =
              min + (max - min) * oscillationValue;
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
    };

    lastTimeRef.current = performance.now();
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      composerRef.current?.dispose();
      renderer.dispose();
    };
  }, [
    externalScene,
    createCamera,
    antialias,
    alpha,
    shadowMapEnabled,
    shadowMapType,
    pixelRatio,
    background,
    sizing,
    afterimage,
    zoomAfterimage,
    onInit,
  ]);

  useEffect(() => {
    if (sizing.mode === "auto-fill") {
      const resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      window.addEventListener("resize", handleResize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [handleResize, sizing.mode]);

  const containerStyle: React.CSSProperties =
    sizing.mode === "auto-fill"
      ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
      : { width: sizing.width, height: sizing.height };

  const canvasStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
}
