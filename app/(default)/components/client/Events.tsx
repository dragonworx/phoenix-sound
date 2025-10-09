"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import MenuItem, { GALAXY_IMAGES } from "./MenuItem";
import Media from "./Media";
import Event from "./Event";
import eventsData from "../../data.json";

// UPCOMING EVENTS CONFIGURATION
// Set to true to show upcoming events, false to hide them
const SHOW_UPCOMING_EVENTS = true;

interface AudioProps {
  focused?: boolean;
  onVideoStateChange?: (hasPlayingVideo: boolean) => void;
  onVideoPlay?: () => void;
}

export interface AudioRef {
  stopVideo: () => void;
}

const Audio = forwardRef<AudioRef, AudioProps>(
  ({ focused = false, onVideoStateChange, onVideoPlay }, ref) => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    const handlePlayVideo = (index: number) => {
      setPlayingIndex(index);
      onVideoStateChange?.(true);
      onVideoPlay?.();
    };

    const handleStopVideo = () => {
      setPlayingIndex(null);
      onVideoStateChange?.(false);
    };

    useImperativeHandle(ref, () => ({
      stopVideo: handleStopVideo,
    }));

    if (focused) {
      const galaxyImage = GALAXY_IMAGES[2];
      const upcoming = eventsData.upcoming;

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
            <div className="text-6xl mb-6">📅</div>
            <h1 className="text-4xl font-bold mb-4">Events</h1>
          </div>

          {/* Upcoming Events Section */}
          <div className="max-w-2xl mx-auto space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-white/90">
              Upcoming Events:
            </h2>
            {SHOW_UPCOMING_EVENTS ? (
              <Event
                title={upcoming.title}
                date={upcoming.date}
                location={upcoming.location}
                isUpcoming={true}
              />
            ) : (
              <div className="bg-white/5 p-8 rounded-lg border border-white/10 text-center">
                <p className="text-lg text-white/70">
                  No upcoming events scheduled at this time. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* Recordings Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white/90">Recordings:</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Hear our recordings from past events.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {eventsData.events.map((event, index) => (
                <Media
                  key={index}
                  title={event.title}
                  date={event.date}
                  location={event.location}
                  youtubeId={event.youtubeId}
                  isPlaying={playingIndex === index}
                  onPlay={() => handlePlayVideo(index)}
                  onStop={handleStopVideo}
                  shouldHide={playingIndex !== null && playingIndex !== index}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <MenuItem imageIndex={3}>
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-2">Events / Sounds</h3>
          <p className="text-white/80 text-sm">
            Upcoming events and past recordings...
          </p>
        </div>
      </MenuItem>
    );
  }
);

Audio.displayName = "Audio";

export default Audio;
