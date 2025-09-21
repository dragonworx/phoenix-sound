'use client';

import Header from "./components/server/Header";
import Footer from "./components/server/Footer";
import StarfieldRenderer from "./components/client/StarfieldRenderer";
import MenuCarrousel from "./components/client/MenuCarrousel";
import MenuItem from "./components/client/MenuItem";

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

        {/* Floating Menu Carrousel */}
        <div className="absolute inset-0 pointer-events-none">
          <MenuCarrousel
            fan={120}
            tilt={25}
            autoSpin={true}
            autoSpinSpeed={0.3}
            inertia={0.98}
            className="w-full h-full"
          >
            <MenuItem>
              <div className="text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-white text-xl font-bold mb-2">Music Studio</h3>
                <p className="text-white/80 text-sm">Professional audio production and mixing services</p>
              </div>
            </MenuItem>

            <MenuItem>
              <div className="text-center">
                <div className="text-4xl mb-4">🎧</div>
                <h3 className="text-white text-xl font-bold mb-2">Sound Design</h3>
                <p className="text-white/80 text-sm">Custom sound effects and audio branding solutions</p>
              </div>
            </MenuItem>

            <MenuItem>
              <div className="text-center">
                <div className="text-4xl mb-4">🔊</div>
                <h3 className="text-white text-xl font-bold mb-2">Live Events</h3>
                <p className="text-white/80 text-sm">Concert and event audio engineering services</p>
              </div>
            </MenuItem>
          </MenuCarrousel>
        </div>
      </main>

      <Footer />
    </div>
  );
}
