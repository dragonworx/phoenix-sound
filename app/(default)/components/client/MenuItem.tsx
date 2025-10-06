"use client";

import React, { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  className?: string;
  imageIndex?: number; // Index to select galaxy image (1, 3, 4, 5)
}

const gradient = `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(4, 41, 84, 0.1))`;
const hoverGradient = `linear-gradient(to bottom, rgba(4, 4, 4, 0.5), rgba(0, 0, 0, 0.1))`;

// Available galaxy images
export const GALAXY_IMAGES = [
  "/img/stars/galaxy-1.png",
  "/img/stars/galaxy-3.png",
  "/img/stars/galaxy-4.png",
  "/img/stars/galaxy-5.png",
];

export default function MenuItem({
  children,
  className = "",
  imageIndex = 0,
}: MenuItemProps) {
  const galaxyImage = GALAXY_IMAGES[imageIndex % GALAXY_IMAGES.length];

  const getBackground = (isHover: boolean) => {
    const gradientLayer = isHover ? hoverGradient : gradient;
    return `${gradientLayer}, url(${galaxyImage})`;
  };

  return (
    <div
      className={`backdrop-blur-md  border border-white/20 rounded-lg p-6 shadow-lg hover:shadow-2xl hover:border-white/40 active:scale-95 pointer-events-auto ${className}`}
      style={{
        width: "250px",
        height: "180px",
        willChange: "transform", // Optimize for animations
        backgroundImage: getBackground(false),
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        textShadow: "0px 2px 3px black",
        transform: "scale(1)",
        transition:
          "transform 1s ease-in-out, box-shadow 1s ease-in-out, border-color 1s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundImage = getBackground(true);
        e.currentTarget.style.transform = "scale(1.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundImage = getBackground(false);
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </div>
  );
}
