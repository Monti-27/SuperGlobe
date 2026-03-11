'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GlobeMethods } from 'react-globe.gl';
import { getCountryStats, type Member } from '@/lib/mock-data';
import { GlobeLoadingSkeleton } from '@/components/dashboard/Skeletons';
import { MembersDrawer } from '@/components/dashboard/MembersDrawer';
import { CommandSearch } from '@/components/dashboard/CommandSearch';
import { CountrySidebar } from '@/components/dashboard/CountrySidebar';
import { SuperteamLogo } from '@/components/ui/SuperteamLogo';
import { ControlBar } from '@/components/dashboard/ControlBar';
import {
  fetchCountryIntelligence,
  fetchGrants,
  fetchHomepageStats,
  fetchOpportunities,
  type CountryIntelligence,
  type Opportunity,
} from '@/lib/services/superteam-earn';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/components/dashboard/ModeSwitcher';
import { normalizeCountry } from '@/lib/country-normalization';

// Landing page components
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { StatsBar } from '@/components/landing/stats-bar';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { EcosystemStrip } from '@/components/landing/ecosystem-strip';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { ParallaxTestimonials } from '@/components/landing/parallax-testimonials';
import { Skiper17 } from '@/components/ui/skiper-ui/skiper17';

const BuilderGlobe = dynamic(() => import('@/components/globe/BuilderGlobe'), {
  ssr: false,
  loading: () => <GlobeLoadingSkeleton />,
});

type BootState = 'shell' | 'data-ready' | 'globe-ready';

export default function Home() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const [mode, setMode] = useState<ViewMode>('builders');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [focusedCountry, setFocusedCountry] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [bootState, setBootState] = useState<BootState>('shell');

  const [members, setMembers] = useState<Member[]>([]);
  const [countryStats, setCountryStats] = useState<{ country: string; count: number; flag: string }[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [countryIntelligence, setCountryIntelligence] = useState<CountryIntelligence[]>([]);
  const [totalGrants, setTotalGrants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSponsors, setTotalSponsors] = useState(0);
  const [solPrice, setSolPrice] = useState<number | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isMembersLoaded, setIsMembersLoaded] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      setIsDataLoading(true);

      const [opportunitiesPayload, grantsPayload, intelligencePayload, homepageStats] = await Promise.all([
        fetchOpportunities(),
        fetchGrants({ take: 120 }),
        fetchCountryIntelligence(),
        fetchHomepageStats(),
      ]);

      if (!isMounted) {
        return;
      }

      setOpportunities(opportunitiesPayload.opportunities);
      setTotalGrants(grantsPayload.totals.count);
      setCountryIntelligence(intelligencePayload.countries);
      setTotalUsers(homepageStats.totalUsers);
      setTotalSponsors(homepageStats.totalSponsors);
      setSolPrice(homepageStats.solPriceUsd);
      setLastUpdatedAt(opportunitiesPayload.meta.fetchedAt);
      setBootState('data-ready');
      setIsDataLoading(false);
    }

    loadLiveData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!exploreMode || bootState === 'globe-ready') {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBootState('globe-ready');
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [bootState, exploreMode]);

  const countryIntelligenceMap = useMemo(() => {
    return new Map(countryIntelligence.map((item) => [item.country, item]));
  }, [countryIntelligence]);

  const selectedCountryIntel = selectedCountry ? countryIntelligenceMap.get(selectedCountry) || null : null;

  const handleMembersLoaded = useCallback((loadedMembers: Member[]) => {
    setMembers(loadedMembers);
    setCountryStats(getCountryStats(loadedMembers));
    setIsMembersLoaded(true);
  }, []);

  const handleCountryClick = useCallback((countryName: string) => {
    const canonicalCountry = normalizeCountry(countryName) || countryName;

    setSelectedCountry((prev) => {
      const next = prev === canonicalCountry ? null : canonicalCountry;
      setFocusedCountry(next);
      setDrawerOpen(Boolean(next));
      return next;
    });
  }, []);

  const clearCountrySelection = useCallback(() => {
    setSelectedCountry(null);
    setFocusedCountry(null);
    setHoveredCountry(null);
    setDrawerOpen(false);
  }, []);

  const handleDrawerOpenChange = useCallback(
    (nextOpen: boolean) => {
      setDrawerOpen(nextOpen);
      if (!nextOpen) {
        setSelectedCountry(null);
        setFocusedCountry(null);
        setHoveredCountry(null);
      }
    },
    []
  );

  const visibleCountryList = useMemo(() => countryStats.slice(0, 10).map((item) => item.country), [countryStats]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.getAttribute('contenteditable') === 'true';

      if (isEditableTarget) {
        return;
      }

      if (event.key === 'Escape') {
        clearCountrySelection();
        return;
      }

      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && visibleCountryList.length > 0) {
        event.preventDefault();

        const currentIndex = focusedCountry ? visibleCountryList.indexOf(focusedCountry) : -1;
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = currentIndex < 0
          ? 0
          : (currentIndex + delta + visibleCountryList.length) % visibleCountryList.length;

        setFocusedCountry(visibleCountryList[nextIndex]);
      }

      if (event.key === 'Enter' && focusedCountry) {
        handleCountryClick(focusedCountry);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [clearCountrySelection, focusedCountry, handleCountryClick, visibleCountryList]);

  const selectedBuilderCount = selectedCountry
    ? members.filter((member) => member.country === selectedCountry).length
    : members.length;

  const selectedOpportunityCount = selectedCountry
    ? opportunities.filter((item) => item.country === selectedCountry).length
    : opportunities.length;

  const selectedOpportunityValue = selectedCountry
    ? opportunities
      .filter((item) => item.country === selectedCountry)
      .reduce((sum, item) => sum + item.rewardAmount, 0)
    : opportunities.reduce((sum, item) => sum + item.rewardAmount, 0);

  const handleEnterGlobe = useCallback(() => {
    setExploreMode(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleOpenSearch = useCallback(() => {
    window.dispatchEvent(new Event('open-command-search'));
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#09090B] text-white">
      {/* Background gradients — always present */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0F0F12_0%,#09090B_60%,#09090B_100%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(226,163,54,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(196,149,106,0.08),transparent_35%)]" />
      </div>

      {/* ── Landing Page ── */}
      {!exploreMode && (
        <div className="relative z-10">
          <Navbar onEnterGlobe={handleEnterGlobe} />

          <Hero
            onEnterGlobe={handleEnterGlobe}
            onOpenSearch={handleOpenSearch}
            isLoading={isDataLoading}
            solPrice={solPrice}
            lastUpdatedAt={lastUpdatedAt}
          />

          <StatsBar
            stats={[
              { label: 'Open Opportunities', value: opportunities.length, color: 'text-[#E2A336]' },
              { label: 'Live Grants', value: totalGrants, color: 'text-white' },
              { label: 'Talent Profiles', value: totalUsers, color: 'text-[#C4956A]' },
              { label: 'Sponsors', value: totalSponsors, color: 'text-white' },
            ]}
          />

          <FeaturesGrid />

          <Skiper17 />

          <HowItWorks />

          <ParallaxTestimonials />

          <EcosystemStrip />

          <CTASection onEnterGlobe={handleEnterGlobe} isLoading={isDataLoading} />

          <Footer />
        </div>
      )}

      {/* ── Globe Experience ── */}
      {exploreMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="relative h-screen w-full z-10"
        >
          <BuilderGlobe
            onCountryClick={handleCountryClick}
            onCountryHover={setHoveredCountry}
            onMembersLoaded={handleMembersLoaded}
            onGlobeReady={() => setBootState('globe-ready')}
            selectedCountry={selectedCountry}
            globeRef={globeRef}
            activeFilter={activeFilter}
            mode={mode}
            opportunities={opportunities}
          />

          {bootState !== 'globe-ready' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="glass px-5 py-3 rounded-xl text-sm font-data text-muted-foreground">
                Rendering Globe...
              </div>
            </div>
          )}

          <div className="fixed top-24 md:top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none flex justify-center">
            <div className="pointer-events-auto w-full flex justify-center">
              <ControlBar
                mode={mode}
                setMode={setMode}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          </div>

          <CommandSearch members={members} globeRef={globeRef} onCountrySelect={handleCountryClick} />

          <header className="absolute top-0 left-0 right-0 z-20 p-6 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl glass shadow-2xl">
                  <SuperteamLogo className="w-6 h-6 text-[#F4A60B]" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif tracking-tight text-white leading-none">Superteam Globe</h1>
                  <p className="text-[10px] text-muted-foreground font-data mt-1 uppercase tracking-widest opacity-70">
                    {isMembersLoaded
                      ? `${mode === 'builders' ? members.length.toLocaleString() : opportunities.length.toLocaleString()} Global ${mode === 'builders' ? 'Builders' : 'Opportunities'
                      }`
                      : 'Loading Builder Graph...'}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-muted-foreground">Search</span>
                <kbd className="text-[10px] font-data text-muted-foreground px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                  ⌘K / /
                </kbd>
              </div>
            </div>
          </header>

          <aside className="absolute top-24 left-6 z-20 hidden md:block">
            <CountrySidebar
              stats={countryStats}
              selectedCountry={selectedCountry}
              focusedCountry={focusedCountry}
              onCountryClick={handleCountryClick}
              isLoaded={isMembersLoaded}
            />
          </aside>

          <div className="absolute bottom-6 right-6 z-20">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={cn('w-1.5 h-1.5 rounded-full', mode === 'bounties' ? 'bg-[#FFD700]' : 'bg-secondary')}
              />
              <span className={cn('text-xs font-data', mode === 'bounties' ? 'text-[#E2A336]' : 'text-secondary')}>
                {mode === 'builders' ? selectedBuilderCount : selectedOpportunityCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {selectedCountry ? `${selectedCountry}` : hoveredCountry ? `Hover ${hoveredCountry}` : 'Global'}
              </span>
            </div>
          </div>

          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-24 right-6 z-20"
            >
              <div className="glass px-4 py-3 rounded-2xl border border-white/10 min-w-[220px]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected Country</p>
                    <p className="text-lg font-serif mt-1">{selectedCountry}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedBuilderCount.toLocaleString()} builders • {selectedOpportunityCount.toLocaleString()} opportunities
                    </p>
                    <p className="text-xs text-[#E2A336] font-data mt-1">
                      ${Math.round(selectedOpportunityValue).toLocaleString()} open value
                    </p>
                    {selectedCountryIntel && (
                      <p className="text-xs text-secondary font-data mt-1">
                        Activity Index {selectedCountryIntel.activityIndex}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearCountrySelection}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear country selection"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <MembersDrawer
            open={drawerOpen}
            onOpenChange={handleDrawerOpenChange}
            country={selectedCountry}
            mode={mode}
            opportunities={opportunities}
            countryIntelligence={selectedCountryIntel}
          />
        </motion.div>
      )}
    </main>
  );
}
