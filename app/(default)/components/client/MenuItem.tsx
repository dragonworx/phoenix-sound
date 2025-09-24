"use client";

import React, { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  className?: string;
}

const gradient = `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(4, 41, 84, 0.5))`;
const hoverGradient = `linear-gradient(to bottom, rgba(4, 4, 4, 0.5), rgba(0, 0, 0, 0.5))`;

export default function MenuItem({ children, className = "" }: MenuItemProps) {
  return (
    <div
      className={`border border-white/20 rounded-lg p-6 shadow-lg hover:shadow-2xl hover:border-white/40 hover:scale-105 active:scale-95 pointer-events-auto ${className}`}
      style={{
        width: "250px",
        height: "180px",
        willChange: "transform", // Optimize for animations
        background: gradient,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverGradient;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = gradient;
      }}
    >
      {children}
    </div>
  );
}
