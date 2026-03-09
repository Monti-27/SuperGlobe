'use client';

import dynamic from 'next/dynamic';
import { Globe, BarChart3, Users, Shield, Layers } from 'lucide-react';
import { Section } from './section';
import { FadeIn } from './fade-in';
import { LiveOpportunitiesCard } from './live-opportunities-card';

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

/**
 * Premium features grid — Row 1: full-width map, Row 2: two cards, Row 3: three cards.
 */
export function FeaturesGrid() {
  return (
    <Section id="features" className="py-24 md:py-32 overflow-visible relative z-10">
      <FadeIn>
        <header className="mb-20 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-primary/40" />
            <span className="text-[10px] tracking-[0.3em] font-semibold text-primary uppercase">
              Features
            </span>
          </div>
          <h2 className="text-5xl md:text-[64px] leading-[1.05] tracking-tight">
            <span className="font-serif text-zinc-100 block mb-2">
              Everything you need to
            </span>
            <span className="font-serif text-zinc-500 italic font-light block">
              understand the ecosystem
            </span>
          </h2>
        </header>
      </FadeIn>

      {/* Grid: Row 1 = full-width map, Row 2 = 2 cards, Row 3 = 3 cards */}
      <div className="flex flex-col gap-5 relative z-10">

        {/* ─── Row 1: Interactive World Map (full width, compact) ─── */}
        <FadeIn delay={0}>
          <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-3xl group transition-all duration-500 relative overflow-hidden h-[340px]">
            {/* Text overlay */}
            <div className="absolute top-0 left-0 p-8 z-30">
              <FeatureIcon>
                <Globe className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </FeatureIcon>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight">
                Interactive World Map
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm font-light">
                Explore the Superteam builder network across 20+ countries.
                Click any region to see its local ecosystem.
              </p>
            </div>

            {/* World Map filling the card */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-[115%] max-w-none group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                <InteractiveWorldMap />
              </div>
            </div>

            {/* Vignette overlays */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#0c0c0c] to-transparent z-20 transition-colors duration-500" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[25%] bg-gradient-to-r from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent z-20 transition-colors duration-500" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-[#0c0c0c] to-transparent z-20 transition-colors duration-500" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0c0c0c]/30 to-transparent z-20" />
          </div>
        </FadeIn>

        {/* ─── Row 2: Live Opportunities + On-Chain Activity ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 2: Live Opportunities */}
          <FadeIn delay={0.08}>
            <LiveOpportunitiesCard />
          </FadeIn>

          {/* Card 3: On-Chain Activity */}
          <FadeIn delay={0.16}>
            <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-3xl flex flex-col group transition-all duration-500 relative overflow-hidden h-[320px]">
              <div className="p-8 pb-4 relative z-20">
                <FeatureIcon>
                  <BarChart3 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </FeatureIcon>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight">
                  On-Chain Activity
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">
                  Wallet-level transaction scoring from Solana mainnet RPC. See
                  who&apos;s actually building.
                </p>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-between w-full h-[120px] px-8 gap-1.5 opacity-80 mt-auto pb-8 z-10 relative">
                <div className="w-full bg-white/5 h-[30%] rounded-t-sm group-hover:bg-white/10 transition-colors duration-300" />
                <div className="w-full bg-white/5 h-[50%] rounded-t-sm group-hover:bg-white/10 transition-colors duration-300" />
                <div className="w-full bg-white/10 h-[40%] rounded-t-sm group-hover:bg-white/20 transition-colors duration-300" />
                <div className="w-full bg-white/5 h-[20%] rounded-t-sm group-hover:bg-white/10 transition-colors duration-300" />
                <div className="w-full bg-primary/40 h-[60%] rounded-t-sm group-hover:bg-primary/60 transition-colors duration-300 group-hover:-translate-y-1" />
                <div className="w-full bg-primary/80 h-[90%] rounded-t-sm group-hover:bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(226,163,54,0.1)] group-hover:shadow-[0_0_20px_rgba(226,163,54,0.3)] group-hover:-translate-y-1 relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Peak
                  </div>
                </div>
                <div className="w-full bg-primary/50 h-[70%] rounded-t-sm group-hover:bg-primary/70 transition-colors duration-300 group-hover:-translate-y-1" />
                <div className="w-full bg-white/10 h-[45%] rounded-t-sm group-hover:bg-white/20 transition-colors duration-300" />
                <div className="w-full bg-white/10 h-[55%] rounded-t-sm group-hover:bg-white/20 transition-colors duration-300" />
                <div className="w-full bg-white/5 h-[35%] rounded-t-sm group-hover:bg-white/10 transition-colors duration-300" />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ─── Row 3: Builder Profiles + Country Intelligence + Dual View ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 4: Builder Profiles */}
          <FadeIn delay={0.24}>
            <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-3xl flex flex-col group transition-all duration-500 relative overflow-hidden h-[320px]">
              <div className="p-7 pb-3 relative z-20">
                <FeatureIcon>
                  <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </FeatureIcon>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
                  Builder Profiles
                </h3>
                <p className="text-zinc-400 text-[13px] leading-relaxed font-light">
                  Profile cards with tech stacks, activity scores, and wallet
                  addresses.
                </p>
              </div>

              {/* Stacked Cards */}
              <div className="flex-1 flex items-center justify-center relative pb-4">
                <div className="relative w-full max-w-[200px] h-[100px] group-hover:scale-105 transition-transform duration-500">
                  {/* Back Card */}
                  <div className="absolute top-0 right-4 w-36 h-16 bg-[#1a1a1a] border border-white/5 rounded-xl shadow-lg rotate-[8deg] opacity-30 p-3 flex items-center gap-3 transition-transform duration-500 group-hover:rotate-[12deg] group-hover:translate-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 bg-white/20 w-1/2 rounded-full" />
                      <div className="h-1 bg-white/10 w-1/3 rounded-full" />
                    </div>
                  </div>
                  {/* Middle Card */}
                  <div className="absolute top-2 left-2 w-40 h-16 bg-[#222222] border border-white/10 rounded-xl shadow-xl -rotate-[4deg] opacity-60 p-3 flex items-center gap-3 backdrop-blur-sm transition-transform duration-500 group-hover:-rotate-[8deg] group-hover:-translate-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/5 to-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 bg-white/30 w-2/3 rounded-full" />
                      <div className="h-1 bg-white/20 w-1/2 rounded-full" />
                    </div>
                  </div>
                  {/* Front Card (Active) */}
                  <div className="absolute top-6 left-8 w-44 h-20 bg-[#2a2a2a] border border-primary/30 rounded-xl shadow-2xl p-3 flex items-center gap-3 z-20 backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_-10px_rgba(226,163,54,0.2)]">
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-yellow-200 p-[1.5px]">
                      <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                        <svg className="w-5 h-5 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#2a2a2a] rounded-full" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-primary/90 w-3/4 rounded-full" />
                      <div className="flex gap-1.5">
                        <div className="h-1.5 bg-white/30 w-1/3 rounded-full" />
                        <div className="h-1.5 bg-white/20 w-1/4 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Card 5: Country Intelligence */}
          <FadeIn delay={0.32}>
            <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-3xl flex flex-col group transition-all duration-500 relative overflow-hidden h-[320px]">
              <div className="p-7 pb-3 relative z-20">
                <FeatureIcon>
                  <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </FeatureIcon>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
                  Country Intelligence
                </h3>
                <p className="text-zinc-400 text-[13px] leading-relaxed font-light">
                  Aggregated ecosystem metrics per country, including builder
                  count and open opportunities.
                </p>
              </div>

              {/* Donut Chart + Stats */}
              <div className="mt-auto px-7 pb-7 w-full flex justify-between items-end relative z-10">
                {/* Donut */}
                <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2A336" strokeWidth="6" strokeDasharray="263.89" strokeDashoffset="65" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(226,163,54,0.3)] transition-all duration-1000" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-mono text-zinc-100 tracking-tighter">84</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">Score</span>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="flex flex-col gap-2.5 w-[50%]">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 flex flex-col justify-center group-hover:border-white/10 group-hover:bg-white/[0.04] transition-colors duration-300">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Top Region</span>
                    </div>
                    <span className="text-[13px] text-zinc-200 font-medium truncate">North America</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 flex flex-col justify-center group-hover:border-white/10 group-hover:bg-white/[0.04] transition-colors duration-300">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5">Growth</span>
                    <span className="text-[13px] text-emerald-400 font-mono flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +24.8%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Card 6: Dual View Modes */}
          <FadeIn delay={0.4}>
            <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-3xl flex flex-col group transition-all duration-500 relative overflow-hidden h-[320px]">
              <div className="p-7 pb-3 relative z-20">
                <FeatureIcon>
                  <Layers className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </FeatureIcon>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
                  Dual View Modes
                </h3>
                <p className="text-zinc-400 text-[13px] leading-relaxed font-light">
                  Switch between Builder mode and Opportunities mode. Each view
                  transforms the data layer.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="mt-auto px-7 pb-10 w-full flex justify-center relative z-10">
                <div className="w-full max-w-[200px] h-12 bg-[#050505] rounded-full border border-white/[0.08] p-1.5 flex relative cursor-pointer shadow-inner">
                  {/* Sliding Indicator */}
                  <div className="absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#1e1e1e] border border-white/10 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-full" />

                  {/* Grid Option */}
                  <div className="flex-1 relative z-10 flex items-center justify-center gap-1.5 text-primary transition-colors duration-500 group-hover:text-zinc-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span className="text-[11px] font-medium tracking-wide">Grid</span>
                  </div>

                  {/* List Option */}
                  <div className="flex-1 relative z-10 flex items-center justify-center gap-1.5 text-zinc-500 transition-colors duration-500 group-hover:text-primary">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                    </svg>
                    <span className="text-[11px] font-medium tracking-wide">List</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
}

/**
 * Icon container shared across all feature cards.
 */
function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-5 transition-colors duration-500">
      {children}
    </div>
  );
}
