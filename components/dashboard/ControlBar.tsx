'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type ViewMode } from './ModeSwitcher';

export const TECH_FILTERS = ['Rust', 'Solidity', 'Next.js', 'React', 'Mobile', 'Design', 'Full Stack'];

interface ControlBarProps {
    mode: ViewMode;
    setMode: (mode: ViewMode) => void;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

export function ControlBar({ mode, setMode, activeFilter, onFilterChange }: ControlBarProps) {
    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-[90vw] md:max-w-none">
            {/* Row 1: Segmented Control - Mode Switcher */}
            <div className="flex items-center p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl scale-90 md:scale-100 origin-top">
                <button
                    onClick={() => setMode('builders')}
                    className={cn(
                        "relative px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 overflow-hidden",
                        mode === 'builders' ? "text-black" : "text-muted-foreground hover:text-white"
                    )}
                >
                    {mode === 'builders' && (
                        <motion.div
                            layoutId="mode-pill"
                            className="absolute inset-0 bg-[#14F195]"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 font-data tracking-wide">BUILDERS</span>
                </button>

                <button
                    onClick={() => setMode('bounties')}
                    className={cn(
                        "relative px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 overflow-hidden",
                        mode === 'bounties' ? "text-black" : "text-muted-foreground hover:text-white"
                    )}
                >
                    {mode === 'bounties' && (
                        <motion.div
                            layoutId="mode-pill"
                            className="absolute inset-0 bg-[#FFD700]"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 font-data tracking-wide">OPPORTUNITIES</span>
                </button>
            </div>

            {/* Row 2: Filter Pills - Only observable in Builders mode */}
            <motion.div
                initial={false}
                animate={{
                    height: mode === 'builders' ? 'auto' : 0,
                    opacity: mode === 'builders' ? 1 : 0,
                    marginTop: mode === 'builders' ? 0 : -10
                }}
                className="overflow-hidden w-full flex justify-center"
            >
                <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-x-auto max-w-full no-scrollbar md:justify-center justify-start snap-x">
                    <button
                        onClick={() => onFilterChange(null)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-medium transition-all font-data shrink-0 snap-center",
                            activeFilter === null
                                ? "bg-white/10 text-white shadow-inner"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        ALL
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1 shrink-0" />
                    {TECH_FILTERS.map((tech) => (
                        <button
                            key={tech}
                            onClick={() => onFilterChange(activeFilter === tech ? null : tech)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all font-data border border-transparent shrink-0 snap-center",
                                activeFilter === tech
                                    ? "bg-[#14F195]/20 text-[#14F195] border-[#14F195]/50 shadow-[0_0_15px_rgba(20,241,149,0.3)]"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tech}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
