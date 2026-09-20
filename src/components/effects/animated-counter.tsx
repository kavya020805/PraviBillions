'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 1.2,
  separator = ',',
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(from);
  const prevToRef = useRef(from);

  useEffect(() => {
    const start = prevToRef.current;
    const end = to;
    prevToRef.current = to;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Smooth ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (end - start) * easeProgress);

      setCurrent(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setCurrent(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [to, duration]);

  const formatted = current.toLocaleString('en-IN').replace(/,/g, separator);

  return (
    <span className={`inline-block font-mono tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
