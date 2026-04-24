'use client';

import { useRef } from 'react';
import { Search, MousePointerClick, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP Plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const NOISE_PATTERN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

/* ─── Step data ─── */
const STEPS = [
  {
    number: '01',
    label: 'Explore',
    Icon: Search,
    title: 'Explore the Globe',
    description:
      'Rotate, zoom, and hover over countries to see real-time builder counts and ecosystem data.',
    // Blue textured mesh
    baseBg: 'bg-[#1e3a8a]',
    radial1: 'bg-[radial-gradient(circle_at_0%_0%,#3b82f6_0%,transparent_70%)]',
    radial2: 'bg-[radial-gradient(circle_at_100%_100%,#1d4ed8_0%,transparent_70%)]',
    shadowClass: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
  },
  {
    number: '02',
    label: 'Select',
    Icon: MousePointerClick,
    title: 'Select a Country',
    description:
      'Click any Superteam hub to open detailed builder profiles, on-chain activity, and live opportunities.',
    // Rose/Pink textured mesh
    baseBg: 'bg-[#881337]',
    radial1: 'bg-[radial-gradient(circle_at_100%_0%,#f43f5e_0%,transparent_70%)]',
    radial2: 'bg-[radial-gradient(circle_at_0%_100%,#be123c_0%,transparent_70%)]',
    shadowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
  },
  {
    number: '03',
    label: 'Action',
    Icon: ArrowUpRight,
    title: 'Take Action',
    description:
      'Apply to bounties, connect with builders, or discover grants — all from a single interface.',
    // Yellow/Amber textured mesh
    baseBg: 'bg-[#78350f]',
    radial1: 'bg-[radial-gradient(circle_at_50%_0%,#f59e0b_0%,transparent_70%)]',
    radial2: 'bg-[radial-gradient(circle_at_50%_100%,#d97706_0%,transparent_70%)]',
    shadowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const middleCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  // GSAP Animation Logic
  useGSAP(() => {
    // Initial Stack Configuration: explicitly set scales and vertical offsets
    // so they look like a nested deck of cards before fanning out!
    gsap.set(leftCardRef.current, { zIndex: 30, xPercent: 0, y: 0, rotation: 0, scale: 1 }); // Top card
    gsap.set(middleCardRef.current, { zIndex: 20, scale: 0.95, y: -15, xPercent: 0, rotation: 0 }); // Middle card peek
    gsap.set(rightCardRef.current, { zIndex: 10, scale: 0.90, y: -30, xPercent: 0, rotation: 0 }); // Bottom card peek

    // Trigger-based animations
    // We use explicit onEnter and onLeaveBack instead of a reversible timeline.
    // Why? Reversing a timeline physically reverses the easing curve (an `ease-out` inverted becomes an `ease-in`).
    // This makes closing the cards start slow and end fast, which feels "laggy" / unresponsive.
    // Explicit calls let us use `ease-out` in BOTH directions so it's always responsive immediately!
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 20%', // Triggers when the section reaches 20% down from viewport top
      onEnter: () => {
        // Animate header out
        gsap.to(headerRef.current, {
          y: -50,
          opacity: 0,
          ease: 'power2.out',
          duration: 0.5
        });

        // Fan Out Logic
        gsap.to(leftCardRef.current, {
          xPercent: -115, y: 20, rotation: -10,
          duration: 0.8, ease: 'expo.out'
        });
        
        gsap.to(rightCardRef.current, {
          xPercent: 115, y: 20, rotation: 10, scale: 1,
          duration: 0.8, ease: 'expo.out'
        });
        
        gsap.to(middleCardRef.current, {
          scale: 1.05, y: 0,
          duration: 0.8, ease: 'expo.out'
        });
      },
      onLeaveBack: () => {
        // Animate header back in
        gsap.to(headerRef.current, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.5
        });

        // Snap Shut Logic
        gsap.to(leftCardRef.current, {
          xPercent: 0, y: 0, rotation: 0,
          duration: 0.6, ease: 'power3.out'
        });
        
        gsap.to(rightCardRef.current, {
          xPercent: 0, y: -30, rotation: 0, scale: 0.90,
          duration: 0.6, ease: 'power3.out'
        });
        
        gsap.to(middleCardRef.current, {
          scale: 0.95, y: -15,
          duration: 0.6, ease: 'power3.out'
        });
      }
    });

  }, { scope: containerRef });

  return (
    // Height reduced because we don't need 300vh for a trigger-based animation
    <div id="how-it-works" ref={containerRef} className="relative w-full h-[150vh]">
      {/* Sticky container that stays on screen while holding scroll */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10">
        
        {/* Header Section */}
        <div ref={headerRef} className="absolute top-[15vh] w-full text-center z-40 px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-zinc-500/50" />
            <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-semibold font-sans">
              How it works
            </p>
            <div className="h-[1px] w-8 bg-zinc-500/50" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif leading-[1.15] tracking-tight text-white mb-2">
            Three steps to <br className="md:hidden" /> global builder intelligence
          </h2>
        </div>

        {/* Cards Container */}
        <div className="relative w-full max-w-[1000px] flex items-center justify-center min-h-[450px] z-20 mt-[10vh]">
          
          {/* Card 3: Right (Action) */}
          <div
            ref={rightCardRef}
            className={`absolute w-[280px] md:w-[320px] aspect-[3/4] rounded-3xl p-7 flex flex-col text-white origin-bottom-left ring-1 ring-white/10 overflow-hidden ${STEPS[2].shadowClass}`}
          >
            {/* Texture & Mesh Background */}
            <div className={`absolute inset-0 z-0 ${STEPS[2].baseBg}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[2].radial1}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[2].radial2}`} />
            <div className="absolute inset-0 z-0 opacity-[0.65] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

            <div className="flex justify-between items-center mb-auto relative z-10 w-full pt-1 px-1">
              <span className="font-sans text-[11px] font-semibold opacity-90 tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full shadow-inner">{STEPS[2].number}</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                {(() => { const Icon = STEPS[2].Icon; return <Icon className="w-5 h-5 text-white" />; })()}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[28px] font-serif mb-2 leading-tight tracking-tight">{STEPS[2].title}</h3>
              <p className="text-white/70 text-[13.5px] font-sans leading-snug">
                {STEPS[2].description}
              </p>
            </div>
          </div>

          {/* Card 2: Center (Select) */}
          <div
            ref={middleCardRef}
            className={`absolute w-[280px] md:w-[320px] aspect-[3/4] rounded-3xl p-7 flex flex-col text-white origin-bottom ring-1 ring-white/10 overflow-hidden ${STEPS[1].shadowClass}`}
          >
            {/* Texture & Mesh Background */}
            <div className={`absolute inset-0 z-0 ${STEPS[1].baseBg}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[1].radial1}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[1].radial2}`} />
            <div className="absolute inset-0 z-0 opacity-[0.65] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

            <div className="flex justify-between items-center mb-auto relative z-10 w-full pt-1 px-1">
              <span className="font-sans text-[11px] font-semibold opacity-90 tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full shadow-inner">{STEPS[1].number}</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                {(() => { const Icon = STEPS[1].Icon; return <Icon className="w-5 h-5 text-white" />; })()}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[28px] font-serif mb-2 leading-tight tracking-tight">{STEPS[1].title}</h3>
              <p className="text-white/70 text-[13.5px] font-sans leading-snug">
                {STEPS[1].description}
              </p>
            </div>
          </div>

          {/* Card 1: Left (Explore) */}
          <div
            ref={leftCardRef}
            className={`absolute w-[280px] md:w-[320px] aspect-[3/4] rounded-3xl p-7 flex flex-col text-white origin-bottom-right ring-1 ring-white/10 overflow-hidden ${STEPS[0].shadowClass}`}
          >
            {/* Texture & Mesh Background */}
            <div className={`absolute inset-0 z-0 ${STEPS[0].baseBg}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[0].radial1}`} />
            <div className={`absolute inset-0 z-0 opacity-100 ${STEPS[0].radial2}`} />
            <div className="absolute inset-0 z-0 opacity-[0.65] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

            <div className="flex justify-between items-center mb-auto relative z-10 w-full pt-1 px-1">
              <span className="font-sans text-[11px] font-semibold opacity-90 tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full shadow-inner">{STEPS[0].number}</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                {(() => { const Icon = STEPS[0].Icon; return <Icon className="w-5 h-5 text-white" />; })()}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[28px] font-serif mb-2 leading-tight tracking-tight">{STEPS[0].title}</h3>
              <p className="text-white/70 text-[13.5px] font-sans leading-snug">
                {STEPS[0].description}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
