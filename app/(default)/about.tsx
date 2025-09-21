import MenuItem from "./components/client/MenuItem";

interface AboutProps {
  focused?: boolean;
}

export default function About({ focused = false }: AboutProps) {
  if (focused) {
    return (
      <div className="text-white">
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">🎵</div>
          <h1 className="text-4xl font-bold mb-4">About Phoenix Sound</h1>
        </div>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-white/90 leading-relaxed">
            Welcome to Phoenix Sound, where audio excellence meets creative innovation. We specialize in professional audio production, mixing, and sound design services that bring your artistic vision to life.
          </p>
          <p className="text-white/80 leading-relaxed">
            With years of experience in the industry, our team combines technical expertise with artistic sensibility to deliver exceptional audio experiences. From recording and mixing to mastering and post-production, we handle every aspect of your audio needs with precision and care.
          </p>
          <p className="text-white/80 leading-relaxed">
            Our state-of-the-art studio is equipped with industry-leading technology and acoustically optimized to ensure the highest quality results. Whether you're an artist, filmmaker, or content creator, we're here to help you achieve your sonic goals.
          </p>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Our Services</h2>
            <ul className="space-y-2 text-white/80">
              <li>• Audio Recording & Production</li>
              <li>• Mixing & Mastering</li>
              <li>• Sound Design</li>
              <li>• Audio Post-Production</li>
              <li>• Custom Audio Branding</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MenuItem>
      <div className="text-center">
        <div className="text-4xl mb-4">🎵</div>
        <h3 className="text-white text-xl font-bold mb-2">About</h3>
        <p className="text-white/80 text-sm">
          Professional audio production and mixing services
        </p>
      </div>
    </MenuItem>
  );
}
