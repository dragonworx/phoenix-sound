import MenuItem from "./MenuItem";
import FocusedFrame from "./FocusedFrame";

interface AboutProps {
  focused?: boolean;
}

export default function About({ focused = false }: AboutProps) {
  if (focused) {
    return (
      <FocusedFrame imageIndex={0} title="Phoenix Sound Team">
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
            <h2 className="text-2xl font-bold mb-3">Liz Chamas ❤️</h2>
            <h3 className="text-2xs text-white/80 font-bold mb-3">Movement</h3>
            <p className="text-white/90 leading-relaxed">
              Founder of Phoenix Studio with 30 years of experience as a dancer,
              clinical pilates educator, and somatic movement practitioner.
              Guiding you through the release of tension all the way to yoga
              nidra.
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
            <h2 className="text-2xl font-bold mb-3">Ali Chamas 🔥</h2>
            <h3 className="text-2xs text-white/80 font-bold mb-3">Music</h3>
            <p className="text-white/90 leading-relaxed">
              Seasoned musician with a unique live setup, improvising
              spontaneous and unique ambient soundscapes through digital FX,
              loops, and textures to take you on a deep sonic journey.
            </p>
          </div>
        </div>
      </FocusedFrame>
    );
  }

  return (
    <MenuItem imageIndex={0}>
      <div className="text-center">
        <h3 className="text-white text-xl font-bold mb-2">The Team</h3>
        <p className="text-white/80 text-sm">
          The team behind Phoenix Sound...
        </p>
      </div>
    </MenuItem>
  );
}
