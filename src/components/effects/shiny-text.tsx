'use client';

import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  text,
  className = '',
  shimmerColor = 'rgba(229, 181, 104, 0.8)', // Patan Patola Brass Gold
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,currentColor_35%,var(--shimmer-color)_50%,currentColor_65%)] bg-[length:250%_100%] animate-shimmer bg-clip-text ${className}`}
      style={{ '--shimmer-color': shimmerColor } as React.CSSProperties}
    >
      {text}
    </span>
  );
}
