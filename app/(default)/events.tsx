import MenuItem from "./components/client/MenuItem";

interface EventsProps {
  focused?: boolean;
}

export default function Events({ focused = false }: EventsProps) {
  if (focused) {
    return (
      <div className="text-white">
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">🎧</div>
          <h1 className="text-4xl font-bold mb-4">Events & Performances</h1>
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-white/90 leading-relaxed">
            Experience immersive audio environments tailored for your events. Our custom sound solutions create unforgettable atmospheres that elevate your gatherings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold mb-3">Live Events</h3>
              <p className="text-white/80 text-sm">
                Professional sound reinforcement and live mixing for concerts, festivals, and corporate events.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold mb-3">Installations</h3>
              <p className="text-white/80 text-sm">
                Permanent audio installations for galleries, museums, and interactive experiences.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold mb-3">Conferences</h3>
              <p className="text-white/80 text-sm">
                Clear, professional audio solutions for presentations and corporate communications.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold mb-3">Custom Soundscapes</h3>
              <p className="text-white/80 text-sm">
                Tailored ambient audio environments for retail, hospitality, and public spaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MenuItem>
      <div className="text-center">
        <div className="text-4xl mb-4">🎧</div>
        <h3 className="text-white text-xl font-bold mb-2">Events</h3>
        <p className="text-white/80 text-sm">
          Custom sound effects and audio branding solutions
        </p>
      </div>
    </MenuItem>
  );
}
