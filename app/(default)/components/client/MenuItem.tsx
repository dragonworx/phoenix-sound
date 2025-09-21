'use client';

import React, { ReactNode } from 'react';

interface MenuItemProps {
  children: ReactNode;
  className?: string;
}

export default function MenuItem({ children, className = '' }: MenuItemProps) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 shadow-lg hover:bg-white/20 transition-all duration-300 pointer-events-auto ${className}`}
      style={{
        minWidth: '200px',
        maxWidth: '300px'
      }}
    >
      {children}
    </div>
  );
}