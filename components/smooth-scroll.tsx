'use client';

import { ReactLenis } from 'lenis/react';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 2.5,
        smoothWheel: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo.easeOut
      }}
    >
      {children}
    </ReactLenis>
  );
}
