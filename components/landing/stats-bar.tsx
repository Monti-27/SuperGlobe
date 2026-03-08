'use client';

import { Section } from './section';
import { AnimatedCounter } from './animated-counter';
import { FadeIn } from './fade-in';

interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

interface StatsBarProps {
  stats: StatItem[];
}

/**
 * Horizontal stats ribbon with animated counters.
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <Section className="py-12">
      <FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative flex flex-col items-center justify-center px-6 py-8 bg-[#09090B]/60"
            >
              {/* Separator lines between cells */}
              {i > 0 && (
                <div className="absolute left-0 top-[20%] bottom-[20%] w-px bg-white/[0.04] hidden md:block" />
              )}
              <AnimatedCounter
                target={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className={`text-3xl md:text-4xl font-bold ${stat.color || 'text-white/90'}`}
              />
              <span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/25">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}
