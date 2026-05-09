'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuilderOnboardingDialog } from '@/components/onboarding/BuilderOnboardingDialog';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { CinematicText } from '@/components/landing/cinematic-text';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { EcosystemStrip } from '@/components/landing/ecosystem-strip';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { ParallaxTestimonials } from '@/components/landing/parallax-testimonials';
import { Skiper17 } from '@/components/ui/skiper-ui/skiper17';
import { GlobeLaunchLoader } from '@/components/ui/globe-launch-loader';
import { type ProfileStatus } from '@/lib/onboarding';
import { fetchGrants, fetchHomepageStats, fetchOpportunities } from '@/lib/services/superteam-earn';

const MIN_GLOBE_LAUNCH_MS = 2500;

async function warmGlobeRoute() {
  await Promise.allSettled([
    import('@/components/globe/GlobeExperience'),
    import('@/components/globe/BuilderGlobe'),
    fetch('/data/custom.geo.json', { cache: 'force-cache' }),
    fetch('/textures/earth-blue-marble.jpg', { cache: 'force-cache' }),
    fetch('/textures/earth-topology.png', { cache: 'force-cache' }),
    fetch('/textures/night-sky.png', { cache: 'force-cache' }),
    fetch('/api/countries/intelligence', { cache: 'force-cache' }),
  ]);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function Home() {
  const router = useRouter();
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [totalGrants, setTotalGrants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSponsors, setTotalSponsors] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLaunchingGlobe, setIsLaunchingGlobe] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [pendingLaunchMode, setPendingLaunchMode] = useState<'default' | 'search'>('default');

  const launchGlobe = useCallback(
    async (mode: 'default' | 'search') => {
      if (isLaunchingGlobe) {
        return;
      }

      setIsLaunchingGlobe(true);
      router.prefetch('/globe');
      sessionStorage.setItem('skip-globe-ready-overlay', '1');

      if (mode === 'search') {
        sessionStorage.setItem('open-globe-search', '1');
      }

      await Promise.all([warmGlobeRoute(), delay(MIN_GLOBE_LAUNCH_MS)]);
      window.requestAnimationFrame(() => {
        router.push('/globe');
      });
    },
    [isLaunchingGlobe, router]
  );

  const fetchProfileStatus = useCallback(async (): Promise<ProfileStatus> => {
    const response = await fetch('/api/me/status', { cache: 'no-store' });
    const payload = await response.json();
    return payload.status as ProfileStatus;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLandingData() {
      setIsDataLoading(true);

      const [opportunitiesPayload, grantsPayload, homepageStats] = await Promise.all([
        fetchOpportunities(),
        fetchGrants({ take: 120 }),
        fetchHomepageStats(),
      ]);

      if (!isMounted) {
        return;
      }

      setOpportunityCount(opportunitiesPayload.opportunities.length);
      setTotalGrants(grantsPayload.totals.count);
      setTotalUsers(homepageStats.totalUsers);
      setTotalSponsors(homepageStats.totalSponsors);
      setIsDataLoading(false);
    }

    loadLandingData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    router.prefetch('/globe');

    const scheduleWarmup = () => {
      void warmGlobeRoute();
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(scheduleWarmup, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeout = globalThis.setTimeout(scheduleWarmup, 900);
    return () => globalThis.clearTimeout(timeout);
  }, [router]);

  const handleGlobeIntent = useCallback(
    async (mode: 'default' | 'search') => {
      if (isLaunchingGlobe) {
        return;
      }

      try {
        const status = await fetchProfileStatus();

        if (
          status === 'authenticated_completed_public' ||
          status === 'authenticated_completed_private'
        ) {
          await launchGlobe(mode);
          return;
        }
      } catch (error) {
        console.error('Failed to resolve profile status for globe entry:', error);
      }

      setPendingLaunchMode(mode);
      setIsOnboardingOpen(true);
    },
    [fetchProfileStatus, isLaunchingGlobe, launchGlobe]
  );

  const handleEnterGlobe = useCallback(() => {
    void handleGlobeIntent('default');
  }, [handleGlobeIntent]);

  const handleOpenSearch = useCallback(() => {
    void handleGlobeIntent('search');
  }, [handleGlobeIntent]);

  const handleWalletClaim = useCallback((result: { status: ProfileStatus; user?: { wallet?: string } }) => {
    if (result.status === 'authenticated_incomplete') {
      setPendingLaunchMode('default');
      setIsOnboardingOpen(true);
    } else if (result.status.startsWith('authenticated_completed')) {
      if (result.user?.wallet) {
        router.push(`/user/profile/${result.user.wallet}`);
      }
    }
  }, [router]);

  const handleOnboardingFinished = useCallback(
    ({ reason, status, wallet }: { reason: 'published' | 'skip'; status: ProfileStatus; wallet?: string }) => {
      setIsOnboardingOpen(false);

      if (reason === 'published' && wallet) {
        router.push(`/user/profile/${wallet}`);
        return;
      }

      if (reason === 'skip' || status.startsWith('authenticated_completed')) {
        void launchGlobe(pendingLaunchMode);
      }
    },
    [launchGlobe, pendingLaunchMode, router]
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#09090B] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0F0F12_0%,#09090B_60%,#09090B_100%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(226,163,54,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(196,149,106,0.08),transparent_35%)]" />
      </div>

      <div className="relative z-10">
        <Navbar
          onEnterGlobe={handleEnterGlobe}
          isLaunching={isLaunchingGlobe}
          onWalletClaim={handleWalletClaim}
        />

        <Hero
          onEnterGlobe={handleEnterGlobe}
          onOpenSearch={handleOpenSearch}
          isLoading={isDataLoading}
          isLaunching={isLaunchingGlobe}
          entryLayoutId="globe-entry-cta"
        />

        <CinematicText 
          tagline1="The world's talent,"
          tagline2="mapped in real-time."
        />

        <FeaturesGrid />

        <Skiper17 />

        <HowItWorks />

        <ParallaxTestimonials />

        <EcosystemStrip />

        <CTASection onEnterGlobe={handleEnterGlobe} isLoading={isDataLoading} isLaunching={isLaunchingGlobe} />

        <Footer />
      </div>

      {isLaunchingGlobe && <GlobeLaunchLoader />}
      <BuilderOnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={setIsOnboardingOpen}
        onFinished={handleOnboardingFinished}
      />
    </main>
  );
}
