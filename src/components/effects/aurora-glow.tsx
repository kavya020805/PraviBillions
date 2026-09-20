'use client';

import React from 'react';

interface AuroraGlowProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}

export function AuroraGlow({
  className = '',
  intensity = 'subtle',
}: AuroraGlowProps) {
  const opacity = intensity === 'subtle' ? '0.12' : intensity === 'medium' ? '0.22' : '0.35';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute -top-[30%] -left-[10%] w-[60%] h-[140%] rounded-full blur-3xl mix-blend-multiply animate-aurora-slow"
        style={{
          background: 'radial-gradient(circle, rgba(19, 59, 66, 0.45) 0%, rgba(245, 240, 232, 0) 70%)',
          opacity,
        }}
      />
      <div
        className="absolute -top-[20%] -right-[15%] w-[55%] h-[130%] rounded-full blur-3xl mix-blend-multiply animate-aurora-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(212, 110, 56, 0.35) 0%, rgba(245, 240, 232, 0) 70%)',
          opacity,
        }}
      />
      <div
        className="absolute top-[40%] left-[25%] w-[50%] h-[100%] rounded-full blur-3xl mix-blend-multiply animate-aurora-slow"
        style={{
          background: 'radial-gradient(circle, rgba(40, 96, 74, 0.30) 0%, rgba(245, 240, 232, 0) 70%)',
          opacity,
        }}
      />
    </div>
  );
}
