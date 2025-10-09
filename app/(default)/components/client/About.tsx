import MenuItem from "./MenuItem";
import { GALAXY_IMAGES } from "./MenuItem";

interface AboutProps {
  focused?: boolean;
}

export default function About({ focused = false }: AboutProps) {
  if (focused) {
    const galaxyImage = GALAXY_IMAGES[0];

    return (
      <div
        className="text-white"
        style={{
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(4, 41, 84, 0.7)), url(${galaxyImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-4xl font-bold mb-4">About Phoenix Sound</h1>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Liz Column */}
          <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-white/20">
              <img
                src="/img/liz.jpg"
                alt="Liz"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mb-3">Liz Chamas</h2>
            <p className="text-white/90 leading-relaxed">
              Founder of Phoenix Studio with 30 years of experience as a dancer,
              clinical pilates educator, and somatic movement practitioner.
              Guiding you through exercises to release tension and stress.
            </p>
          </div>

          {/* Ali Column */}
          <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-white/20">
              <img
                src="/img/ali.jpg"
                alt="Ali"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ali Chamas</h2>
            <p className="text-white/90 leading-relaxed">
              Live musician with film and television experience. Creating live
              spontaneous and unique ambient soundscapes through digital FX,
              loops, and deep textures to take you on a sonic journey.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MenuItem imageIndex={0}>
      <div className="text-center">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-white text-xl font-bold mb-2">About</h3>
        <p className="text-white/80 text-sm">Our mission and values</p>
      </div>
    </MenuItem>
  );
}
