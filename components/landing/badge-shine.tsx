'use client';

import { cn } from '@/lib/utils';

interface BadgeShineProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Pill badge with animated shimmer border.
 * Inspired by LuxeUI Badge Shine + 21st.dev Hero Pill.
 */
export function BadgeShine({ children, className }: BadgeShineProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5',
        'text-xs font-data uppercase tracking-[0.14em]',
        'border border-white/[0.08] bg-white/[0.03]',
        'relative overflow-hidden',
        className,
      )}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </div>
  );
}
