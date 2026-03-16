'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { GlobeLaunchLoader } from '@/components/ui/globe-launch-loader';
import { fetchGrants, fetchHomepageStats, fetchOpportunities } from '@/lib/services/superteam-earn';

const MIN_GLOBE_LAUNCH_MS = 2500;

async function warmGlobeRoute() {
  await Promise.allSettled([
    import('@/components/globe/GlobeExperience'),
    import('@/components/globe/BuilderGlobe'),
    fetch('/data/world.geojson', { cache: 'force-cache' }),
    fetch('/textures/earth-night.jpg', { cache: 'force-cache' }),
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

  const handleEnterGlobe = useCallback(async () => {
    if (isLaunchingGlobe) {
      return;
    }

    setIsLaunchingGlobe(true);
    router.prefetch('/globe');
    sessionStorage.setItem('skip-globe-ready-overlay', '1');
    await Promise.all([warmGlobeRoute(), delay(MIN_GLOBE_LAUNCH_MS)]);
    window.requestAnimationFrame(() => {
      router.push('/globe');
    });
  }, [isLaunchingGlobe, router]);

  const handleOpenSearch = useCallback(async () => {
    if (isLaunchingGlobe) {
      return;
    }

    setIsLaunchingGlobe(true);
    router.prefetch('/globe');
    sessionStorage.setItem('skip-globe-ready-overlay', '1');
    sessionStorage.setItem('open-globe-search', '1');
    await Promise.all([warmGlobeRoute(), delay(MIN_GLOBE_LAUNCH_MS)]);
    window.requestAnimationFrame(() => {
      router.push('/globe');
    });
  }, [isLaunchingGlobe, router]);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#09090B] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0F0F12_0%,#09090B_60%,#09090B_100%)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(226,163,54,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(196,149,106,0.08),transparent_35%)]" />
      </div>

      <div className="relative z-10">
        <Navbar onEnterGlobe={handleEnterGlobe} isLaunching={isLaunchingGlobe} />

        <Hero
          onEnterGlobe={handleEnterGlobe}
          onOpenSearch={handleOpenSearch}
          isLoading={isDataLoading}
          isLaunching={isLaunchingGlobe}
        />

        <StatsBar
          stats={[
            { label: 'Open Opportunities', value: opportunityCount, color: 'text-[#E2A336]' },
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

        <CTASection onEnterGlobe={handleEnterGlobe} isLoading={isDataLoading} isLaunching={isLaunchingGlobe} />

        <Footer />
      </div>

      {isLaunchingGlobe && <GlobeLaunchLoader />}
    </main>
  );
}
