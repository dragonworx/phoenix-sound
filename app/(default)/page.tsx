'use client';

import { useCallback } from 'react';
import * as THREE from 'three';
import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import ThreeRenderer from "./components/client/ThreeRenderer";
import { customScene } from './scene';

export default function HomePage() {
  const onInit = useCallback(customScene, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 bg-white overflow-y-auto relative">
        <ThreeRenderer
          sizing={{ mode: 'auto-fill' }}
          camera={{
            type: 'perspective',
            position: [100, 100, 100],
            lookAt: [0, 0, 0],
            fov: 45
          }}
          shadowMapEnabled={true}
          shadowMapType={THREE.PCFSoftShadowMap}
          background="transparent"
          alpha={true}
          onInit={onInit}
        />
      </main>

      <Footer />
    </div>
  );
}
