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
      distributionType: 'galaxy',
      maxStars: 800,
      speed: 40,
      cameraSpeed: 35
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
            fov: 75,
            far: 2000
          }}
          background="transparent"
          alpha={true}
          onInit={onInit}
          onUpdate={onUpdate}
        />
      </main>

      <Footer />
    </div>
  );
}
