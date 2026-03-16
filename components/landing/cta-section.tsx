'use client';

import { Section } from './section';
import { FadeIn } from './fade-in';
import { SuperteamLogo } from '@/components/ui/SuperteamLogo';

interface CTASectionProps {
  onEnterGlobe: () => void;
  isLoading: boolean;
  isLaunching?: boolean;
}

/**
 * Final call-to-action section.
 */
export function CTASection({ onEnterGlobe, isLoading, isLaunching = false }: CTASectionProps) {
  return (
    <Section className="py-28">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015]">
          {/* Background glow — warm */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-[#E2A336]/[0.04] blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-[200px] w-[300px] rounded-full bg-[#C4956A]/[0.03] blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-8 py-20 md:py-24">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <SuperteamLogo className="h-8 w-8 text-[#E2A336]" />
            </div>

            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-white leading-[1.1]">
              Ready to explore the
              <br />
              <span className="text-gradient">global builder network?</span>
            </h2>

            <p className="mt-5 max-w-md text-sm text-white/30 leading-relaxed">
              Dive into the interactive 3D globe experience. Discover builders,
              opportunities, and ecosystem intelligence across 20+ countries.
            </p>

            <button
              onClick={onEnterGlobe}
              disabled={isLoading || isLaunching}
              className="mt-10 px-8 py-4 rounded-xl bg-[#E4E4E7] text-[#09090B] font-semibold text-sm transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLaunching ? 'Launching…' : isLoading ? 'Loading…' : 'Enter Globe Experience →'}
            </button>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
