'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScale = 'normal' | 'large' | 'larger';

interface AccessibilityContextType {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  increaseFont: () => void;
  resetFont: () => void;
  decreaseFont: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>('normal');

  const applyFontScale = (scale: FontScale) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (scale === 'large') {
      root.style.fontSize = '18px'; // ~112.5% standard GIGW larger scale
    } else if (scale === 'larger') {
      root.style.fontSize = '20px'; // ~125%
    } else {
      root.style.fontSize = '16px'; // 100% normal standard scale
    }
    root.setAttribute('data-font-scale', scale);
  };

  useEffect(() => {
    // Read saved preference from localStorage on mount
    try {
      const saved = localStorage.getItem('gujarat_font_scale') as FontScale | null;
      if (saved && (saved === 'normal' || saved === 'large' || saved === 'larger')) {
        setFontScaleState(saved);
        applyFontScale(saved);
      } else {
        applyFontScale('normal');
      }
    } catch {
      // Graceful fallback for non-storage environments
      applyFontScale('normal');
    }
  }, []);

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
    try {
      localStorage.setItem('gujarat_font_scale', scale);
    } catch {
      // storage unavailable
    }
    applyFontScale(scale);
  };

  const increaseFont = () => {
    if (fontScale === 'normal') setFontScale('large');
    else if (fontScale === 'large') setFontScale('larger');
  };

  const resetFont = () => {
    setFontScale('normal');
  };

  const decreaseFont = () => {
    if (fontScale === 'larger') setFontScale('large');
    else if (fontScale === 'large') setFontScale('normal');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        increaseFont,
        resetFont,
        decreaseFont,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
