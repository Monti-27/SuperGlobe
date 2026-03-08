'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SuperteamLogo } from '@/components/ui/SuperteamLogo';

interface NavbarProps {
  onEnterGlobe?: () => void;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Community', href: '#community' },
];

/**
 * Sticky glass navbar with scroll-aware background.
 */
export function Navbar({ onEnterGlobe }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'py-3' : 'py-5',
      )}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <nav
          className={cn(
            'flex items-center justify-between rounded-2xl px-5 py-2.5 transition-all duration-500',
            scrolled
              ? 'glass border border-white/[0.06] shadow-2xl'
              : 'bg-transparent',
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <SuperteamLogo className="h-5 w-5 text-[#E2A336]" />
            </div>
            <span className="text-sm font-serif tracking-tight text-white">
              SuperGlobe
            </span>
          </div>

          {/* Links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-1.5 text-[13px] text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onEnterGlobe}
            className="px-4 py-2 text-xs font-semibold text-[#09090B] bg-[#E4E4E7] rounded-xl hover:bg-white transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Launch Globe
          </button>
        </nav>
      </div>
    </header>
  );
}
