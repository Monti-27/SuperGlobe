'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Section } from './section';
import { TextEffect } from '@/components/ui/text-effect';

const InteractiveWorldMap = dynamic(
  () =>
    import('./interactive-world-map').then((mod) => ({
      default: mod.InteractiveWorldMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[2.5/1] bg-transparent" />
    ),
  }
);

interface HeroProps {
  onEnterGlobe: () => void;
  onOpenSearch: () => void;
  isLoading: boolean;
  isLaunching?: boolean;
}

export function Hero({
  onEnterGlobe,
  isLoading,
  isLaunching = false,
}: HeroProps) {
  // Phase 1: map loads → map fades in at low opacity + text starts animating
  // Phase 2: text animation done → overlay fades out, map goes full opacity, CTA slides in
  const [mapReady, setMapReady] = useState(false);
  const [textAnimationDone, setTextAnimationDone] = useState(false);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const handleTextComplete = useCallback(() => {
    setTextAnimationDone(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col bg-[#09090B]">
      {/* ── Top spacer for navbar ── */}
      <div className="h-16 md:h-20 shrink-0" />

      {/* ── Map region — takes up available space, vertically centered ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* World map — always present, opacity transitions from dim to full */}
        <motion.div
          className="relative w-[90vw] max-w-[1100px] mx-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: textAnimationDone ? 1 : mapReady ? 0.15 : 0,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <InteractiveWorldMap onReady={handleMapReady} />

          {/* ── Vignette layers ── */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-[#09090B] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-[#09090B] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#09090B]/60 to-transparent" />
        </motion.div>

        {/* ── Text overlay — centered on top of map ── */}
        {/* Shows only after map is ready; fades out once text animation completes */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: textAnimationDone ? 0 : mapReady ? 1 : 0,
          }}
          transition={{
            opacity: { duration: textAnimationDone ? 0.8 : 0.5 },
          }}
        >
          <div className="text-center max-w-3xl px-6">
            {mapReady && (
              <TextEffect
                per="word"
                as="h1"
                delay={0.5}
                onAnimationComplete={handleTextComplete}
                className="text-[clamp(2rem,5.5vw,4.5rem)] font-serif leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                variants={{
                  container: {
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.12 },
                    },
                  },
                  item: {
                    hidden: { opacity: 0, filter: 'blur(12px)', y: 8 },
                    visible: {
                      opacity: 1,
                      filter: 'blur(0px)',
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  },
                }}
              >
                Talent is everywhere. We make it visible.
              </TextEffect>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Headline + CTA — slides in after text animation is done ── */}
      <motion.div
        className="relative z-10 -mt-24 sm:-mt-28 md:-mt-32 shrink-0 pb-10 md:pb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: textAnimationDone ? 1 : 0,
          y: textAnimationDone ? 0 : 30,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <Section>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-[clamp(1.75rem,4.8vw,3.5rem)] font-serif leading-[1.05] tracking-tight text-white">
              Talent is everywhere.
              <br />
              <span className="text-white/40">We make it </span>
              <span className="text-gradient">visible</span>
              <span className="text-white/40">.</span>
            </h1>

            <p className="mt-5 max-w-md mx-auto text-[15px] leading-relaxed text-white/30">
              20+ countries. Thousands of builders. One real-time interface
              to discover, connect, and fund the Solana ecosystem.
            </p>

            <div className="mt-9 flex justify-center">
              <button
                onClick={onEnterGlobe}
                disabled={isLoading || isLaunching}
                className="px-7 py-3 rounded-xl bg-[#E4E4E7] text-[#09090B] font-semibold text-sm transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:opacity-50"
              >
                {isLaunching ? 'Launching…' : isLoading ? 'Syncing\u2026' : 'Enter Globe Experience'}
              </button>
            </div>
          </div>
        </Section>
      </motion.div>
    </section>
  );
}
