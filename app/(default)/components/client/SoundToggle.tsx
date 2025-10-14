"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { SeamlessAudioLoop } from "@/lib/SeamlessAudioLoop";

export interface SoundToggleRef {
  stop: () => void;
  toggle: () => void;
  setPlaying: (playing: boolean) => void;
  isPlaying: () => boolean;
}

interface SoundToggleProps {
  onToggle?: (isPlaying: boolean) => void;
}

const SoundToggle = forwardRef<SoundToggleRef, SoundToggleProps>(
  ({ onToggle }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioLoopRef = useRef<SeamlessAudioLoop | null>(null);

  useEffect(() => {
    // Initialize seamless audio loop on mount
    audioLoopRef.current = new SeamlessAudioLoop({
      url: "/loop.mp3",
      volume: 1.0,
      onError: (error) => {
        console.error("Error with audio loop:", error);
      },
    });

    // Cleanup on unmount
    return () => {
      if (audioLoopRef.current) {
        audioLoopRef.current.dispose();
        audioLoopRef.current = null;
      }
    };
  }, []);

  const toggleSound = async () => {
    if (!audioLoopRef.current) return;

    try {
      const newPlayingState = await audioLoopRef.current.toggle();
      setIsPlaying(newPlayingState);
      onToggle?.(newPlayingState);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    stop: () => {
      if (audioLoopRef.current && isPlaying) {
        audioLoopRef.current.stop();
        setIsPlaying(false);
        onToggle?.(false);
      }
    },
    toggle: () => {
      toggleSound();
    },
    setPlaying: async (playing: boolean) => {
      if (!audioLoopRef.current) return;

      try {
        if (playing && !isPlaying) {
          await audioLoopRef.current.play();
          setIsPlaying(true);
          onToggle?.(true);
        } else if (!playing && isPlaying) {
          audioLoopRef.current.stop();
          setIsPlaying(false);
          onToggle?.(false);
        }
      } catch (error) {
        console.error("Error setting playing state:", error);
      }
    },
    isPlaying: () => {
      return isPlaying;
    },
  }), [isPlaying, onToggle]);

  return (
    <button
      onClick={toggleSound}
      className="text-white hover:text-gray-300 transition-colors"
      aria-label={isPlaying ? "Mute sound" : "Play sound"}
    >
      {isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      )}
    </button>
  );
}
);

SoundToggle.displayName = "SoundToggle";

export default SoundToggle;
