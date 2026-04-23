'use client';

import { useCallback, useState } from 'react';
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
    loading: () => <div className="aspect-[2.5/1] w-full bg-transparent" />,
  }
);

interface HeroProps {
  onEnterGlobe: () => void;
  onOpenSearch: () => void;
  isLoading: boolean;
  isLaunching?: boolean;
  entryLayoutId?: string;
}

export function Hero({
  onEnterGlobe,
  isLoading,
  isLaunching = false,
  entryLayoutId,
}: HeroProps) {
  const [mapReady, setMapReady] = useState(false);
  const [textAnimationDone, setTextAnimationDone] = useState(false);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const handleTextComplete = useCallback(() => {
    setTextAnimationDone(true);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full flex-col bg-[#09090B]">
      <div className="h-16 shrink-0 md:h-20" />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <motion.div
          className="relative mx-auto w-[90vw] max-w-[1100px]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: textAnimationDone ? 1 : mapReady ? 0.15 : 0,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <InteractiveWorldMap onReady={handleMapReady} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-[#09090B] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-[#09090B] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#09090B]/60 to-transparent" />
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{
          opacity: textAnimationDone ? 0 : mapReady ? 1 : 0,
        }}
        transition={{
          opacity: { duration: textAnimationDone ? 0.8 : 0.5 },
        }}
      >
        <div className="max-w-3xl text-center">
          {mapReady ? (
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
          ) : null}
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 -mt-24 shrink-0 pb-10 sm:-mt-28 md:-mt-32 md:pb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: textAnimationDone ? 1 : 0,
          y: textAnimationDone ? 0 : 30,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <Section>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-[clamp(1.75rem,4.8vw,3.5rem)] font-serif leading-[1.05] tracking-tight text-white">
              Talent is everywhere.
              <br />
              <span className="text-white/40">We make it </span>
              <span className="text-gradient">visible</span>
              <span className="text-white/40">.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/30">
              20+ countries. Thousands of builders. One real-time interface to discover, connect, and fund the Solana
              ecosystem.
            </p>

            <div className="mt-9 flex justify-center">
              <motion.button
                layoutId={entryLayoutId}
                onClick={onEnterGlobe}
                disabled={isLoading || isLaunching}
                className="rounded-xl bg-[#E4E4E7] px-7 py-3 text-sm font-semibold text-[#09090B] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:opacity-50"
              >
                {isLaunching ? 'Launching…' : isLoading ? 'Syncing…' : 'Enter Globe Experience'}
              </motion.button>
            </div>
          </div>
        </Section>
      </motion.div>
    </section>
  );
}
