"use client";

import React, { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  className?: string;
}

export default function MenuItem({ children, className = "" }: MenuItemProps) {
  return (
    <div
      className={`bg-black/30 border border-white/20 rounded-lg p-6 shadow-lg hover:bg-white/20 hover:shadow-2xl hover:border-white/40 hover:scale-105 active:scale-95 pointer-events-auto ${className}`}
      style={{
        width: "300px",
        height: "200px",
        willChange: "transform", // Optimize for animations
      }}
    >
      {children}
    </div>
  );
}
