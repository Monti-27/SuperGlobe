'use client';

import { useRef } from 'react';
import { Search, MousePointerClick, ArrowUpRight, ArrowDown } from 'lucide-react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { useState } from 'react';

/* ─── Step data ─── */
const STEPS = [
  {
    number: '01',
    label: 'Explore',
    Icon: Search,
    title: 'Explore the Globe',
    description:
      'Rotate, zoom, and hover over countries to see real-time builder counts and ecosystem data.',
  },
  {
    number: '02',
    label: 'Select',
    Icon: MousePointerClick,
    title: 'Select a Country',
    description:
      'Click any Superteam hub to open detailed builder profiles, on-chain activity, and live opportunities.',
  },
  {
    number: '03',
    label: 'Action',
    Icon: ArrowUpRight,
    title: 'Take Action',
    description:
      'Apply to bounties, connect with builders, or discover grants — all from a single interface.',
  },
];

const NODE_POSITIONS = [5, 50, 95]; // percent along the progress bar

/* ─── Component ─── */
export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* Framer Motion scroll tracking */
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  /* Map 0→1 scroll progress to 0→100 for the progress bar */
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  /* Derive the active step from scroll progress */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < 0.33) setActiveIndex(0);
    else if (v < 0.66) setActiveIndex(1);
    else setActiveIndex(2);
  });

  /* Smooth scroll prompt opacity — hide once user begins scrolling */
  const promptOpacity = useTransform(scrollYProgress, [0, 0.06], [0.45, 0]);

  return (
    <div id="how-it-works" ref={trackRef} className="relative w-full" style={{ height: '350vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-[1200px] w-full px-8 flex flex-col relative z-10">
          {/* ─── Header ─── */}
          <motion.div
            className="mb-14 w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-8 bg-amber-500/50" />
              <p className="text-[10px] tracking-[0.3em] text-amber-500/90 uppercase font-semibold font-sans">
                How it works
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.15] tracking-tight text-white">
              Three steps to <br />
              <span className="text-zinc-500 font-light italic">
                global builder intelligence
              </span>
            </h2>
          </motion.div>

          {/* ─── Progress bar ─── */}
          <div className="relative w-full h-[2px] bg-white/[0.03] mb-10 rounded-full">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full z-10"
              style={{
                width: progressWidth,
                background: 'linear-gradient(90deg, rgba(245,158,11,0) 0%, #f59e0b 100%)',
                boxShadow: '0 0 20px rgba(245,158,11,0.6)',
              }}
            />
            {/* Node dots */}
            {NODE_POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full z-20 border-[1.5px] border-[#09090B]"
                style={{ left: `${pos}%` }}
                animate={{
                  backgroundColor: i <= activeIndex ? '#f59e0b' : '#27272a',
                  boxShadow:
                    i <= activeIndex
                      ? '0 0 12px rgba(245,158,11,0.9), 0 0 0 4px rgba(245,158,11,0.1)'
                      : '0 0 0 transparent',
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>

          {/* ─── Ambient Glow for Glass Effect ─── */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen -translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen -translate-y-1/2" />

          {/* ─── Cards ─── */}
          <div className="flex h-[380px] gap-4 w-full relative">
            {STEPS.map((step, i) => {
              const isActive = i === activeIndex;

              return (
                <motion.div
                  key={step.number}
                  className="relative rounded-[32px] overflow-hidden cursor-default group backdrop-blur-xl border border-white/5"
                  animate={{
                    flex: isActive ? 1 : 0.12,
                    backgroundColor: isActive ? 'rgba(25, 25, 28, 0.45)' : 'rgba(11, 11, 13, 0.4)',
                    boxShadow: isActive 
                      ? '0 30px 60px -12px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)' 
                      : '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.03)',
                  }}
                  transition={{
                    flex: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    backgroundColor: { duration: 0.6 },
                    boxShadow: { duration: 0.6 },
                  }}
                >
                  {/* Dynamic Gradient Borders (via before/after elements) achieved with box-shadow above and absolute inset below */}
                  <motion.div
                    className="absolute inset-0 rounded-[32px] border transition-colors duration-700 pointer-events-none"
                    animate={{
                      borderColor: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'
                    }}
                  />

                  {/* Radial gradient glow overlay */}
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none"
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* ── Collapsed view (vertical label) ── */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-between py-10 w-full"
                    animate={{
                      opacity: isActive ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isActive ? 0 : 0.25,
                    }}
                  >
                    <span className="text-zinc-500 font-data text-xs tracking-[0.2em] font-medium transition-colors">
                      {step.number}
                    </span>
                    <div className="flex-1 flex items-center justify-center w-full">
                      <span className="text-zinc-400/80 font-sans font-medium text-[15px] uppercase tracking-[0.3em] -rotate-90 whitespace-nowrap transition-colors">
                        {step.label}
                      </span>
                    </div>
                  </motion.div>

                  {/* ── Expanded view ── */}
                  <motion.div
                    className="absolute inset-0 p-10 flex flex-col justify-between min-w-[500px]"
                    animate={{
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: isActive ? 0.3 : 0,
                    }}
                    style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                  >
                    <div className="flex justify-between items-start w-full relative z-10">
                      <motion.div
                        className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -10 }}
                        transition={{ duration: 0.6, delay: isActive ? 0.4 : 0 }}
                      >
                        <span className="text-amber-500 font-data text-xs tracking-[0.2em] font-semibold">
                          STEP {step.number}
                        </span>
                      </motion.div>
                      
                      <motion.div
                        className="w-16 h-16 rounded-[1.25rem] border border-white/20 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-2xl relative"
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.8,
                          rotate: isActive ? 0 : -15
                        }}
                        transition={{ duration: 0.7, delay: isActive ? 0.45 : 0, type: "spring", bounce: 0.4 }}
                      >
                        {/* Glow behind icon */}
                        <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full mix-blend-screen" />
                        <step.Icon className="w-6 h-6 text-amber-300 relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" strokeWidth={2} />
                      </motion.div>
                    </div>

                    <motion.div
                      className="max-w-[420px] relative z-10"
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                      transition={{ duration: 0.7, delay: isActive ? 0.45 : 0 }}
                    >
                      <h3 className="text-3xl font-serif text-white mb-4 tracking-tight drop-shadow-md">
                        {step.title}
                      </h3>
                      <p className="text-zinc-300 text-base leading-relaxed font-sans font-light drop-shadow-sm">
                        {step.description}
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── Scroll prompt ─── */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ opacity: promptOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3 font-sans font-semibold">
            Scroll to explore
          </span>
          <div className="w-8 h-12 border border-white/10 rounded-full flex justify-center py-2 bg-black/20 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <motion.div 
              className="w-1 h-2 bg-amber-500/80 rounded-full"
              animate={{ y: [0, 16, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
