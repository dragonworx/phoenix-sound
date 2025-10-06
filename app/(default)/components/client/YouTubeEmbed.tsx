import React from "react";

// A reusable component for embedding YouTube videos responsively.
// It takes a videoId and an optional title as props.
export default function YouTubeEmbed({
  videoId,
  title = "YouTube video player",
}: {
  videoId: string;
  title?: string;
}) {
  if (!videoId) {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <p className="text-white">Invalid YouTube Video ID</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <iframe
      className="absolute top-0 left-0 w-full h-full"
      src={embedUrl}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  );
}
