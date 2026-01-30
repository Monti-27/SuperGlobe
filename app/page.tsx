'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getCountryStats, type Member } from '@/lib/mock-data';
import { GlobeLoadingSkeleton } from '@/components/dashboard/Skeletons';
import { MembersDrawer } from '@/components/dashboard/MembersDrawer';
import { CommandSearch } from '@/components/dashboard/CommandSearch';
import { CountrySidebar } from '@/components/dashboard/CountrySidebar';
import { Navbar } from '@/components/ui/mini-navbar';
import { SuperteamLogo } from '@/components/ui/SuperteamLogo';
import { WaveLoader } from '@/components/ui/wave-loader';
import { GlobeMethods } from 'react-globe.gl';
import { ControlBar } from '@/components/dashboard/ControlBar';
import { fetchBounties, type Bounty } from '@/lib/services/superteam-earn';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/components/dashboard/ModeSwitcher';

// Lazy load the globe
const BuilderGlobe = dynamic(
  () => import('@/components/globe/BuilderGlobe'),
  {
    ssr: false,
    loading: () => <GlobeLoadingSkeleton />
  }
);

export default function Home() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('builders');
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [countryStats, setCountryStats] = useState<{ country: string; count: number; flag: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Fetch Bounties
  useEffect(() => {
    fetchBounties().then(setBounties);
  }, []);

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 4000); // 4 seconds splash duration

    return () => clearTimeout(timer);
  }, []);

  const handleMembersLoaded = useCallback((loadedMembers: Member[]) => {
    setMembers(loadedMembers);
    setCountryStats(getCountryStats(loadedMembers));
    setIsLoaded(true);
  }, []);

  const handleCountryClick = (countryName: string) => {
    const newCountry = selectedCountry === countryName ? null : countryName;
    setSelectedCountry(newCountry);
    if (newCountry) {
      setDrawerOpen(true);
    }
  };

  const filteredCount = selectedCountry
    ? (mode === 'builders' ? members.filter(m => m.country === selectedCountry).length : bounties.length) // Simplified logic for bounties count
    : (mode === 'builders' ? members.length : bounties.length);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Splash Screen */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center gap-6">
              <SuperteamLogo className="w-16 h-16 text-white animate-pulse" />
              <WaveLoader message="Initializing Globe..." className="bg-[#F4A60B]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (reveals after loader) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoader ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen w-full"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover grayscale opacity-60 pointer-events-none"
            src="https://cdn.pixabay.com/photo/2016/06/05/07/59/stars-1436950_1280.jpg"
            alt="Background Stars"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>

        {/* Globe Background */}
        <BuilderGlobe
          onCountryClick={handleCountryClick}
          onMembersLoaded={handleMembersLoaded}
          selectedCountry={selectedCountry}
          globeRef={globeRef}
          activeFilter={activeFilter}
          mode={mode}
          bounties={bounties}
        />

        {/* Unified Control Bar (Top Center) */}
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

        {/* Command Search (Cmd+K) */}
        <CommandSearch
          members={members}
          globeRef={globeRef}
          onCountrySelect={handleCountryClick}
        />

        {/* Header (Restored) */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl glass shadow-2xl">
                <SuperteamLogo className="w-6 h-6 text-[#F4A60B]" />
              </div>
              <div>
                <h1 className="text-3xl font-serif tracking-tight text-white leading-none">
                  Superteam
                </h1>
                <p className="text-[10px] text-muted-foreground font-data mt-1 uppercase tracking-widest opacity-60">
                  {isLoaded ? `${mode === 'builders' ? members.length.toLocaleString() : bounties.length} Global ${mode === 'builders' ? 'Builders' : 'Opportunities'}` : 'Syncing...'}
                </p>
              </div>
            </motion.div>

            {/* Search Hint */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <span className="text-xs text-muted-foreground">Search</span>
              <kbd className="text-[10px] font-data text-muted-foreground px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                ⌘K
              </kbd>
            </motion.div>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="absolute top-24 left-6 z-10 hidden md:block">
          <CountrySidebar
            stats={countryStats}
            selectedCountry={selectedCountry}
            onCountryClick={handleCountryClick}
            isLoaded={isLoaded}
          />
        </aside>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4"
        >
          <div className="hidden md:block glass px-4 py-2 rounded-full">
            <span className="text-xs text-muted-foreground">
              <span className="text-secondary">Hover</span> to preview •
              <span className="text-primary ml-1">Click</span> to explore
            </span>
          </div>
        </motion.div>

        {/* Live Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="absolute bottom-6 right-6 z-10"
        >
          <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn("w-1.5 h-1.5 rounded-full", mode === 'bounties' ? "bg-[#FFD700]" : "bg-secondary")}
            />
            <span className={cn("text-xs font-data", mode === 'bounties' ? "text-[#FFD700]" : "text-secondary")}>
              {mode === 'builders' ? filteredCount : bounties.length}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {mode === 'builders' && selectedCountry ? 'filtered' : 'active'}
            </span>
          </div>
        </motion.div>

        {/* Selected Country Pill */}
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-24 right-6 z-10"
          >
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Viewing</span>
              <span className="text-sm font-medium text-foreground">{selectedCountry}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedCountry(null);
                  setDrawerOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Members Drawer */}
        <MembersDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          country={selectedCountry}
          mode={mode}
          bounties={bounties}
        />
      </motion.div>
    </main>
  );
}
