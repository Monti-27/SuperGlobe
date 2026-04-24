'use client';

import { Section } from './section';
import { FadeIn } from './fade-in';
import { HeroDitheringCard } from '@/components/ui/hero-dithering-card';

interface CTASectionProps {
  onEnterGlobe: () => void;
  isLoading: boolean;
  isLaunching?: boolean;
}

export function CTASection({ onEnterGlobe, isLoading, isLaunching = false }: CTASectionProps) {
  return (
    <Section className="py-28">
      <FadeIn>
        <HeroDitheringCard
          onEnterGlobe={onEnterGlobe}
          isLoading={isLoading}
          isLaunching={isLaunching}
        />
      </FadeIn>
    </Section>
  );
}
