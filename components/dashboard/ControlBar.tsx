'use client';

import { motion } from 'framer-motion';
import {
  Blocks,
  BriefcaseBusiness,
  Brush,
  Code2,
  Component,
  Layers3,
  Rocket,
  Smartphone,
} from 'lucide-react';
import { FluidDropdown } from '@/components/ui/fluid-dropdown';
import { cn } from '@/lib/utils';
import { type ViewMode } from './ModeSwitcher';

import Image from 'next/image';

const SvgIcon = (src: string, alt: string, invert: boolean = false) => {
  const Icon = ({ className }: { className?: string }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className={cn("object-contain", invert && "invert")} 
      />
    </div>
  );
  Icon.displayName = alt;
  return Icon;
};

const RustLogo = SvgIcon('/tech-stack/Rust.svg', 'Rust', true);
const SolidityLogo = SvgIcon('/tech-stack/Solidity.svg', 'Solidity', true);
const NextJsLogo = SvgIcon('/tech-stack/Next.js.svg', 'Next.js', true);
const ReactLogo = SvgIcon('/tech-stack/React.svg', 'React', false);

export const TECH_FILTERS = ['Rust', 'Solidity', 'Next.js', 'React', 'Mobile', 'Design', 'Full Stack'] as const;

const FILTER_ITEMS = [
  { id: 'all', label: 'All builders', value: null, icon: Layers3, color: '#a1a1aa' },
  { id: 'Rust', label: 'Rust', value: 'Rust', icon: RustLogo, color: '#DEA584' },
  { id: 'Solidity', label: 'Solidity', value: 'Solidity', icon: SolidityLogo, color: '#8b8b8b' },
  { id: 'Next.js', label: 'Next.js', value: 'Next.js', icon: NextJsLogo, color: '#f5f5f5' },
  { id: 'React', label: 'React', value: 'React', icon: ReactLogo, color: '#61dafb' },
  { id: 'Mobile', label: 'Mobile', value: 'Mobile', icon: Smartphone, color: '#a4c639' },
  { id: 'Design', label: 'Design', value: 'Design', icon: Brush, color: '#ff69b4' },
  { id: 'Full Stack', label: 'Full Stack', value: 'Full Stack', icon: BriefcaseBusiness, color: '#e2a336' },
] as const;

interface ControlBarProps {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function ControlBar({ mode, setMode, activeFilter, onFilterChange }: ControlBarProps) {
  const selectedFilter = FILTER_ITEMS.find((item) => item.value === activeFilter) || FILTER_ITEMS[0];

  return (
    <div className="relative flex w-full items-start justify-center">
      <div className="origin-top scale-90 rounded-full border border-white/10 bg-black/40 p-1 shadow-2xl backdrop-blur-xl md:scale-100">
        <div className="flex items-center">
          <button
            onClick={() => setMode('builders')}
            className={cn(
              'relative overflow-hidden rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 md:px-6 md:text-sm',
              mode === 'builders' ? 'text-black' : 'text-muted-foreground hover:text-white'
            )}
          >
            {mode === 'builders' && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 bg-[#14F195]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-data tracking-wide">BUILDERS</span>
          </button>

          <button
            onClick={() => setMode('bounties')}
            className={cn(
              'relative overflow-hidden rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 md:px-6 md:text-sm',
              mode === 'bounties' ? 'text-black' : 'text-muted-foreground hover:text-white'
            )}
          >
            {mode === 'bounties' && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 bg-[#FFD700]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 font-data tracking-wide">OPPORTUNITIES</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: mode === 'builders' ? 1 : 0,
          y: mode === 'builders' ? 0 : -10,
          pointerEvents: mode === 'builders' ? 'auto' : 'none',
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute right-0 top-0 hidden md:block"
      >
        <FluidDropdown
          items={FILTER_ITEMS.map(({ id, label, icon, color }) => ({ id, label, icon, color }))}
          selectedId={selectedFilter.id}
          onSelect={(item) => {
            const nextFilter = FILTER_ITEMS.find((filter) => filter.id === item.id);
            onFilterChange(nextFilter?.value ?? null);
          }}
          align="right"
          className="w-[220px]"
        />
      </motion.div>
    </div>
  );
}
