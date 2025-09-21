'use client';

import React from 'react';

interface CloseButtonProps {
  onClose: () => void;
  className?: string;
}

export default function CloseButton({ onClose, className = '' }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className={`absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-50 ${className}`}
      aria-label="Close"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L4 12M4 4L12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}