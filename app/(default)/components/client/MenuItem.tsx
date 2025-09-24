"use client";

import React, { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  className?: string;
}

export default function MenuItem({ children, className = "" }: MenuItemProps) {
  return (
    <div
      className={`border border-white/20 rounded-lg p-6 shadow-lg hover:shadow-2xl hover:border-white/40 hover:scale-105 active:scale-95 pointer-events-auto ${className}`}
      style={{
        width: "300px",
        height: "200px",
        willChange: "transform", // Optimize for animations
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3))",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3))";
      }}
    >
      {children}
    </div>
  );
}
