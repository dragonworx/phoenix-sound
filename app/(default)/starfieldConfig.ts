import { StarfieldConfig } from "./starfield/StarfieldConfig";

export default {
            // Renderer settings
            sizing: { mode: 'auto-fill' },
            camera: {
              type: 'perspective',
              position: [0, 0, 0],
              lookAt: [0, 0, -100],
              fov: 60,
              far: 2000
            },
            background: 'black',
            alpha: true,
            zoomAfterimage: {
              enabled: true,
              scaleX: 0.7,
              scaleY: 0.98,
              translateX: 0.0,
              translateY: 0.0,
              rotation: 0.1,
              oscillation: {
                damp: { min: 0.1, max: 0.5, speed: 1.5 },
                rotation: { min: 0.0, max: 0.2, speed: 1.0 }
              }
            },

            // Starfield settings
            distributionType: 'radial',
            maxStars: 800,
            speed: 2,
            cameraSpeed: 20,
            drift: true,
            driftSpeed: 0.9,
            minDriftDuration: 3.0,
            maxDriftDuration: 10.0,
            blendMode: 'screen'
          } as Partial<StarfieldConfig>