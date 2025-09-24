import { StarfieldConfig } from "./starfield/StarfieldConfig";

export default {
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
            zoomAfterimage: {
              enabled: true,
              scaleX: 1.005,
              scaleY: 1.005,
              translateX: 0.0,
              translateY: 0.0,
              rotation: 0.0,
              oscillation: {
                damp: { min: 0.1, max: 0.5, speed: 1.0 }
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
          } as Partial<StarfieldConfig>