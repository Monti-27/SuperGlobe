'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Keep main landing page on native scroll to avoid scroll-engine contention
  // with heavy sections (parallax/testimonials/globe prewarm path).
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.1,
        smoothWheel: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      }}
    >
      {children}
    </ReactLenis>
  );
}
