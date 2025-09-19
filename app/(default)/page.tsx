'use client';

import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import StarfieldRenderer from "./components/client/StarfieldRenderer";

export default function HomePage() {
  return (
    <div className="h-screen relative bg-black">
      <Header />

      <main className="absolute inset-0">
        <StarfieldRenderer
          config={{
            // Renderer settings
            sizing: { mode: 'auto-fill' },
            camera: {
              type: 'perspective',
              position: [0, 0, 0],
              lookAt: [0, 0, -100],
              fov: 90,
              far: 2000
            },
            background: 'black',
            alpha: true,
            afterimage: {
              enabled: true,
              oscillation: {
                min: 0.5,
                max: 0.9,
                speed: 0.1
              }
            },

            // Starfield settings
            distributionType: 'radial',
            maxStars: 800,
            speed: 1,
            cameraSpeed: 20,
            drift: true,
            driftSpeed: 0.5,
            minDriftDuration: 3.0,
            maxDriftDuration: 10.0,
            blendMode: 'additive'
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
