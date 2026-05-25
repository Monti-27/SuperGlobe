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

const MIN_GLOBE_LAUNCH_MS = 350;

async function warmGlobeRoute() {
  await Promise.allSettled([
    import('@/components/globe/GlobeExperience'),
    import('@/components/globe/BuilderGlobe'),
  ]);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function Home() {
  const router = useRouter();
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

      void warmGlobeRoute();
      await delay(MIN_GLOBE_LAUNCH_MS);

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
    router.prefetch('/globe');
  }, [router]);

  const handleGlobeIntent = useCallback(
    async (mode: 'default' | 'search') => {
      if (isLaunchingGlobe) {
        return;
      }

      setIsLaunchingGlobe(true);

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

      setIsLaunchingGlobe(false);
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
          isLoading={false}
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

        <CTASection onEnterGlobe={handleEnterGlobe} isLoading={false} isLaunching={isLaunchingGlobe} />

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
