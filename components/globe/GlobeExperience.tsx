'use client';

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlobeMethods } from 'react-globe.gl';
import { Toaster, toast } from 'sonner';
import { type Member } from '@/lib/mock-data';
import { BuilderOnboardingDialog } from '@/components/onboarding/BuilderOnboardingDialog';
import { MembersDrawer } from '@/components/dashboard/MembersDrawer';
import { CommandSearch } from '@/components/dashboard/CommandSearch';
import { CountrySidebar } from '@/components/dashboard/CountrySidebar';
import { SuperteamLogo } from '@/components/ui/SuperteamLogo';
import { GlobeLaunchLoader } from '@/components/ui/globe-launch-loader';
import { ControlBar } from '@/components/dashboard/ControlBar';
import {
  fetchCountryIntelligence,
  type CountryIntelligence,
  type Opportunity,
} from '@/lib/services/superteam-earn';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/components/dashboard/ModeSwitcher';
import { normalizeCountry } from '@/lib/country-normalization';
import { type ProfileStatus } from '@/lib/onboarding';

const BuilderGlobe = dynamic(() => import('@/components/globe/BuilderGlobe'), {
  ssr: false,
  loading: () => null,
});

interface CountryStat {
  country: string;
  count: number;
  flag: string;
}

interface GlobeExperienceProps {
  initialMembers: Member[];
  initialCountryStats: CountryStat[];
  initialOpportunities: Opportunity[];
}

const PROFILE_PROMPT_TOAST_ID = 'globe-profile-prompt';

export function GlobeExperience({
  initialMembers,
  initialCountryStats,
  initialOpportunities,
}: GlobeExperienceProps) {
  const router = useRouter();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const profilePromptShownRef = useRef(false);

  const [mode, setMode] = useState<ViewMode>('builders');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [focusedCountry, setFocusedCountry] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [showReadyOverlay] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const shouldSkipOverlay = sessionStorage.getItem('skip-globe-ready-overlay') === '1';
    if (shouldSkipOverlay) {
      sessionStorage.removeItem('skip-globe-ready-overlay');
      return false;
    }

    return true;
  });
  const [countryIntelligence, setCountryIntelligence] = useState<CountryIntelligence[]>([]);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('unauthenticated');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const members = initialMembers;
  const countryStats = initialCountryStats;
  const opportunities = initialOpportunities;

  useEffect(() => {
    let cancelled = false;

    fetchCountryIntelligence()
      .then((payload) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setCountryIntelligence(payload.countries);
        });
      })
      .catch((error) => {
        console.error('Failed to hydrate country intelligence:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/me/status', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setProfileStatus(payload.status as ProfileStatus);
        }
      })
      .catch((error) => {
        console.error('Failed to hydrate profile status inside globe:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('open-globe-search') !== '1') {
      return;
    }

    sessionStorage.removeItem('open-globe-search');

    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('open-command-search'));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleGlobeReady = useCallback(() => {
    setIsGlobeReady(true);
  }, []);

  const countryIntelligenceMap = useMemo(() => {
    return new Map(countryIntelligence.map((item) => [item.country, item]));
  }, [countryIntelligence]);

  const selectedCountryIntel = selectedCountry ? countryIntelligenceMap.get(selectedCountry) || null : null;

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

  const handleDrawerOpenChange = useCallback((nextOpen: boolean) => {
    setDrawerOpen(nextOpen);
    if (!nextOpen) {
      setSelectedCountry(null);
      setFocusedCountry(null);
      setHoveredCountry(null);
    }
  }, []);

  const visibleCountryList = useMemo(() => countryStats.map((item) => item.country), [countryStats]);

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
        const nextIndex =
          currentIndex < 0
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

  const builderCountByCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of members) {
      const canonicalCountry = normalizeCountry(member.country);
      if (!canonicalCountry) {
        continue;
      }

      map.set(canonicalCountry, (map.get(canonicalCountry) || 0) + 1);
    }
    return map;
  }, [members]);

  const opportunityMetricsByCountry = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const opportunity of opportunities) {
      const canonicalCountry = normalizeCountry(opportunity.country);
      if (!canonicalCountry) {
        continue;
      }

      const current = map.get(canonicalCountry) || { count: 0, value: 0 };
      current.count += 1;
      current.value += opportunity.rewardAmount;
      map.set(canonicalCountry, current);
    }
    return map;
  }, [opportunities]);

  const selectedBuilderCount = selectedCountry
    ? builderCountByCountry.get(selectedCountry) || 0
    : members.length;

  const selectedOpportunityMetrics = selectedCountry
    ? opportunityMetricsByCountry.get(selectedCountry) || { count: 0, value: 0 }
    : {
      count: opportunities.length,
      value: opportunities.reduce((sum, item) => sum + item.rewardAmount, 0),
    };

  const handleOpenSearch = useCallback(() => {
    window.dispatchEvent(new Event('open-command-search'));
  }, []);

  const showProfilePrompt =
    profileStatus !== 'authenticated_completed_public' && profileStatus !== 'authenticated_completed_private';

  useEffect(() => {
    if (onboardingOpen) {
      toast.dismiss(PROFILE_PROMPT_TOAST_ID);
    }
  }, [onboardingOpen]);

  useEffect(() => {
    if (!showProfilePrompt || profilePromptShownRef.current) {
      if (!showProfilePrompt) {
        toast.dismiss(PROFILE_PROMPT_TOAST_ID);
      }
      return;
    }

    const timer = window.setTimeout(() => {
      toast('Finish your builder profile', {
        id: PROFILE_PROMPT_TOAST_ID,
        description: 'Publish to appear on the globe and unlock discovery.',
        duration: 14000,
        action: {
          label: 'Complete profile',
          onClick: () => {
            toast.dismiss(PROFILE_PROMPT_TOAST_ID);
            setOnboardingOpen(true);
          },
        },
        cancel: {
          label: 'Back home',
          onClick: () => {
            toast.dismiss(PROFILE_PROMPT_TOAST_ID);
            router.push('/');
          },
        },
      });
    }, 3500);

    profilePromptShownRef.current = true;

    return () => {
      window.clearTimeout(timer);
    };
  }, [router, showProfilePrompt]);

  return (
    <main className="relative h-screen overflow-hidden bg-[#09090B] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0F0F12_0%,#09090B_58%,#09090B_100%)]" />
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,rgba(226,163,54,0.08),transparent_38%),radial-gradient(circle_at_82%_78%,rgba(111,216,255,0.08),transparent_30%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative h-screen w-full z-10"
      >
        <BuilderGlobe
          members={members}
          onCountryClick={handleCountryClick}
          onCountryHover={setHoveredCountry}
          onGlobeReady={handleGlobeReady}
          selectedCountry={selectedCountry}
          globeRef={globeRef}
          activeFilter={activeFilter}
          mode={mode}
          opportunities={opportunities}
        />

        {showReadyOverlay && !isGlobeReady && <GlobeLaunchLoader />}

        <div className="fixed inset-x-0 top-24 z-40 px-4 pointer-events-none md:top-6 md:px-6">
          <div className="pointer-events-auto relative mx-auto w-full">
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
          <div className="flex items-center justify-between gap-4 pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl glass shadow-2xl">
                <SuperteamLogo className="w-6 h-6 text-[#F4A60B]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-serif tracking-tight text-white leading-none">Superteam Globe</h1>
                  <Link
                    href="/"
                    className="hidden md:inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-white"
                  >
                    Back
                  </Link>
                </div>
                <p className="text-[10px] text-muted-foreground font-data mt-1 uppercase tracking-widest opacity-70">
                  {`${mode === 'builders' ? members.length.toLocaleString() : opportunities.length.toLocaleString()} Global ${mode === 'builders' ? 'Builders' : 'Opportunities'}`}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] transition-colors hover:bg-white/[0.05]"
              >
                <span className="text-xs text-muted-foreground">Search</span>
                <kbd className="text-[10px] font-data text-muted-foreground px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08]">
                  ⌘K / /
                </kbd>
              </button>
            </div>
          </div>
        </header>

        <aside className="absolute top-24 left-6 z-20 hidden md:block">
          <CountrySidebar
            stats={countryStats}
            selectedCountry={selectedCountry}
            focusedCountry={focusedCountry}
            onCountryClick={handleCountryClick}
            isLoaded={members.length > 0}
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
              {mode === 'builders' ? selectedBuilderCount : selectedOpportunityMetrics.count}
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
                    {selectedBuilderCount.toLocaleString()} builders • {selectedOpportunityMetrics.count.toLocaleString()} opportunities
                  </p>
                  <p className="text-xs text-[#E2A336] font-data mt-1">
                    ${Math.round(selectedOpportunityMetrics.value).toLocaleString()} open value
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
        />
      </motion.div>

      <BuilderOnboardingDialog
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onFinished={({ status }) => {
          setProfileStatus(status);
          router.refresh();
        }}
      />
      <Toaster
        theme="dark"
        position="bottom-right"
        expand={false}
        visibleToasts={1}
        closeButton={false}
        offset={{ right: '20px', bottom: '20px' }}
        mobileOffset={{ left: '12px', right: '12px', bottom: '12px' }}
      />
    </main>
  );
}
