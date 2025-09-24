import MenuItem from "./components/client/MenuItem";

interface AudioProps {
  focused?: boolean;
}

export default function Audio({ focused = false }: AudioProps) {
  if (focused) {
    return (
      <div className="text-white">
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">🎧</div>
          <h1 className="text-4xl font-bold mb-4">Audio Recordings</h1>
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-white/90 leading-relaxed">
            Transform your musical ideas into polished, professional recordings.
            Our comprehensive audio production services cover every stage of the
            creative process.
          </p>
          <div className="space-y-8 mt-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Recording Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded border border-white/10">
                  <h4 className="font-bold text-white/90 mb-2">
                    Studio Recording
                  </h4>
                  <p className="text-white/70 text-sm">
                    State-of-the-art equipment in acoustically treated rooms
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded border border-white/10">
                  <h4 className="font-bold text-white/90 mb-2">
                    Remote Recording
                  </h4>
                  <p className="text-white/70 text-sm">
                    Professional quality recording at your location
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Post-Production</h2>
              <div className="space-y-2 text-white/80">
                <p>• Professional mixing with industry-standard plugins</p>
                <p>• Mastering for streaming, CD, and vinyl formats</p>
                <p>• Audio restoration and enhancement</p>
                <p>• Stem creation for remixing and licensing</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Specialized Services</h2>
              <div className="space-y-2 text-white/80">
                <p>• Podcast production and editing</p>
                <p>• Voice-over recording and processing</p>
                <p>• Audio for video synchronization</p>
                <p>• Custom sample creation</p>
              </div>
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
        <h3 className="text-white text-xl font-bold mb-2">Recordings</h3>
        <p className="text-white/80 text-sm">Live recordings from our events</p>
      </div>
    </MenuItem>
  );
}
