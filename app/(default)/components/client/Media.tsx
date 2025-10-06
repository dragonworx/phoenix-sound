import YouTubeEmbed from "./YouTubeEmbed";

interface MediaProps {
  title: string;
  date: string;
  location: string;
  youtubeId: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  shouldHide?: boolean;
}

export default function Media({
  title,
  date,
  location,
  youtubeId,
  isPlaying = false,
  onPlay,
  onStop,
  shouldHide = false,
}: MediaProps) {
  if (shouldHide) {
    return null;
  }

  if (isPlaying) {
    return (
      <div className="bg-white/5 p-6 rounded-lg border border-white/10 col-span-full">
        <YouTubeEmbed videoId={youtubeId} />
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-6 rounded-lg border border-white/10 relative">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/80 text-sm mb-2">{date}</p>
      <p className="text-white/80 text-sm mb-4">{location}</p>

      <div className="relative mt-4 group cursor-pointer" onClick={onPlay}>
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
          alt={`${title} thumbnail`}
          className="w-full rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-black/50 group-hover:bg-black/70 rounded-full transition-colors">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white ml-1"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
