'use client';

import { ArrowRight } from 'lucide-react';
import { Suspense, lazy, useState } from 'react';

const Dithering = lazy(() =>
  import('@paper-design/shaders-react').then((mod) => ({ default: mod.Dithering }))
);

interface HeroDitheringCardProps {
  onEnterGlobe: () => void;
  isLoading?: boolean;
  isLaunching?: boolean;
}

export function HeroDitheringCard({
  onEnterGlobe,
  isLoading = false,
  isLaunching = false,
}: HeroDitheringCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="flex w-full items-center justify-center px-4 py-12 md:px-6">
      <div
        className="relative w-full max-w-7xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-[40px] border border-white/[0.07] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.04),transparent_42%),linear-gradient(180deg,rgba(20,18,16,0.98),rgba(10,10,12,0.96))] shadow-[0_30px_120px_rgba(0,0,0,0.4)] duration-500">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/10" />}>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-35 mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#B9965B"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.55 : 0.18}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-1/2 top-[22%] h-[260px] w-[520px] -translate-x-1/2 rounded-full bg-[#B9965B]/10 blur-[120px]" />
            <div className="absolute bottom-[-8%] left-[14%] h-[220px] w-[320px] rounded-full bg-[#74624A]/10 blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <h2 className="mb-6 max-w-4xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-zinc-50 md:text-7xl lg:text-8xl">
              Explore web3
              <br />
              <span className="text-[#D7C19A]">builders worldwide.</span>
            </h2>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              Discover active builders, real opportunities, and the strongest hubs in one live globe.
            </p>

            <button
              onClick={onEnterGlobe}
              disabled={isLoading || isLaunching}
              className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-[#E7DDD0] px-10 text-base font-medium text-[#111111] transition-all duration-300 hover:scale-[1.03] hover:bg-[#F2E8DA] hover:ring-4 hover:ring-[#D7C19A]/15 active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10">{isLaunching ? 'Launching…' : isLoading ? 'Loading…' : 'Enter Globe'}</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
