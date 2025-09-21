'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface MenuCarrouselProps {
  children: ReactNode[];
  fan?: number;
  tilt?: number;
  autoSpin?: boolean;
  autoSpinSpeed?: number;
  inertia?: number;
  className?: string;
}

export default function MenuCarrousel({
  children,
  fan = 60,
  tilt = 15,
  autoSpin = false,
  autoSpinSpeed = 0.5,
  inertia = 0.95,
  className = ''
}: MenuCarrouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setRotation(prev => {
        let newRotation = prev;

        if (autoSpin && !isDragging) {
          newRotation += autoSpinSpeed;
        }

        if (!isDragging && Math.abs(velocity) > 0.01) {
          newRotation += velocity;
          setVelocity(v => v * inertia);
        } else if (!isDragging && !autoSpin) {
          setVelocity(0);
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
  }, [autoSpin, autoSpinSpeed, isDragging, velocity, inertia]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouseX(e.clientX);
    setVelocity(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    const rotationDelta = deltaX * 0.5;

    setRotation(prev => prev + rotationDelta);
    setVelocity(rotationDelta);
    setLastMouseX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const itemCount = React.Children.count(children);
  const angleStep = 360 / itemCount;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        perspectiveOrigin: '50% 50%'
      }}
    >
      <div
        className="relative w-full h-full preserve-3d"
        style={{
          transform: `translateZ(-100px) rotateX(${tilt}deg) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d'
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
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${-angle}deg)`,
                zIndex: Math.round((z + radius) * 10)
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}