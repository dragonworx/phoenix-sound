"use client";

import { ReactElement, useEffect, useState, useRef, cloneElement } from "react";

export interface GlowWrapperProps {
  children: ReactElement;
  delay: number;
  frequency: number;
  repeat: number;
}

const GlowWrapper = ({
  children,
  delay,
  frequency,
  repeat,
}: GlowWrapperProps) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start the glow effect after the initial delay
    const delayTimer = setTimeout(() => {
      setIsGlowing(true);
      setCurrentRepeat(0);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delay]);

  useEffect(() => {
    if (!isGlowing || currentRepeat >= repeat) {
      if (currentRepeat >= repeat) {
        setIsGlowing(false);
      }
      return;
    }

    // Calculate the duration of one complete cycle (bright to faded and back)
    const cycleDuration = (1 / frequency) * 1000;

    timerRef.current = setTimeout(() => {
      setCurrentRepeat((prev) => prev + 1);
    }, cycleDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isGlowing, currentRepeat, repeat, frequency]);

  const animationDuration = `${1 / frequency}s`;

  return (
    <div
      className="inline-block relative"
      style={{
        animation:
          isGlowing && currentRepeat < repeat
            ? `glow ${animationDuration} ease-in-out infinite`
            : "none",
      }}
    >
      {children}
      <style jsx>{`
        @keyframes glow {
          0%,
          100% {
            filter: drop-shadow(2px 2px 1px rgba(255, 255, 255, 0.3))
              drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.3))
              drop-shadow(2px 2px 4px rgba(255, 255, 255, 0.2));
          }
          50% {
            filter: drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.8))
              drop-shadow(2px 2px 4px rgba(255, 255, 255, 0.6))
              drop-shadow(2px 2px 16px rgba(255, 255, 255, 0.4));
          }
        }
      `}</style>
    </div>
  );
};

export default GlowWrapper;
