"use client";

import React, { useRef, useEffect, useState, ReactNode } from "react";

interface MenuCarrouselProps {
  children: ReactNode[];
  fan?: number;
  tilt?: number;
  autoSpin?: boolean;
  autoSpinSpeed?: number;
  className?: string;
  onItemClick?: (index: number) => void;
}

export default function MenuCarrousel({
  children,
  fan = 60,
  tilt = 15,
  autoSpin = false,
  autoSpinSpeed = 0.5,
  className = "",
  onItemClick,
}: MenuCarrouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => {
        let newRotation = prev;

        if (autoSpin) {
          newRotation += autoSpinSpeed;
        }

        return newRotation % 360;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoSpin, autoSpinSpeed]);

  const itemCount = React.Children.count(children);
  const angleStep = 360 / itemCount;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{
        perspective: "1000px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        className="relative w-full h-full preserve-3d"
        style={{
          transform: `translateZ(-100px) rotateX(${tilt}deg) rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {React.Children.map(children, (child, index) => {
          const angle = index * angleStep;
          const radians = (angle * Math.PI) / 180;
          const radius = 300;
          const x = Math.sin(radians) * radius;
          const z = Math.cos(radians) * radius;

          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${-rotation}deg)`,
                zIndex: Math.round((z + radius) * 10),
              }}
              onClick={() => onItemClick?.(index)}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}
