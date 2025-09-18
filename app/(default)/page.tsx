'use client';

import { useCallback } from 'react';
import * as THREE from 'three';
import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import ThreeRenderer from "./components/client/ThreeRenderer";
import { starfieldScene, updateStarfieldScene } from './starfieldScene';

export default function HomePage() {
  const onInit = useCallback((renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    starfieldScene(renderer, scene, camera, {
      distributionType: 'radial',
      maxStars: 800,
      speed: 1,
      cameraSpeed: 20,
      drift: true,
      driftSpeed: 0.5,
      minDriftDuration: 3.0,
      maxDriftDuration: 10.0,
      blendMode: 'additive'
    });
  }, []);

  const onUpdate = useCallback((deltaTime: number, elapsedTime: number) => {
    updateStarfieldScene(deltaTime, elapsedTime);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 bg-white overflow-y-auto relative">
        <ThreeRenderer
          sizing={{ mode: 'auto-fill' }}
          camera={{
            type: 'perspective',
            position: [0, 0, 0],
            lookAt: [0, 0, -100],
            fov: 90,
            far: 2000
          }}
          background="black"
          alpha={true}
          afterimage={{
            enabled: true,
            oscillation: {
              min: 0.5,
              max: 0.9,
              speed: 0.5
            }
          }}
          onInit={onInit}
          onUpdate={onUpdate}
        />
      </main>

      <Footer />
    </div>
  );
}
