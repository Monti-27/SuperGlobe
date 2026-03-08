'use client';

import { cn } from '@/lib/utils';

interface TextShineProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  shimmerWidth?: number;
}

/**
 * Animated text with a sweeping shine/shimmer effect.
 * Inspired by LuxeUI Text Shine.
 */
export function TextShine({
  text,
  className,
  as: Tag = 'span',
  shimmerWidth = 120,
}: TextShineProps) {
  return (
    <Tag
      className={cn(
        'bg-clip-text text-transparent bg-[length:250%_100%] animate-[shimmer_3s_ease-in-out_infinite]',
        'bg-gradient-to-r from-white/90 via-white/40 to-white/90',
        className,
      )}
      style={{
        backgroundSize: `${shimmerWidth}% 100%`,
      }}
    >
      {text}
    </Tag>
  );
}
