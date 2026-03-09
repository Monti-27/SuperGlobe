import { SuperteamLogo } from '@/components/ui/SuperteamLogo';

/**
 * Minimal footer with branding and links.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] px-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 py-8">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <SuperteamLogo className="h-4 w-4 text-[#F4A60B]" />
          <span className="text-xs text-white/30 font-data">
            SuperGlobe · Superteam Ecosystem Visualizer
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://superteam.fun"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/25 hover:text-white/60 transition-colors"
          >
            Superteam
          </a>
          <a
            href="https://solana.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/25 hover:text-white/60 transition-colors"
          >
            Solana
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/25 hover:text-white/60 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
