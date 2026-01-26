"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ViewMode = 'builders' | 'bounties';

interface ModeSwitcherProps {
    mode: ViewMode;
    setMode: (mode: ViewMode) => void;
}

export function ModeSwitcher({ mode, setMode }: ModeSwitcherProps) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl">
                <button
                    onClick={() => setMode('builders')}
                    className={cn(
                        "relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-300",
                        mode === 'builders' ? "text-white" : "text-gray-400 hover:text-white"
                    )}
                >
                    {mode === 'builders' && (
                        <motion.div
                            layoutId="mode-highlight"
                            className="absolute inset-0 bg-blue-600 rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">Builders</span>
                </button>

                <button
                    onClick={() => setMode('bounties')}
                    className={cn(
                        "relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-300",
                        mode === 'bounties' ? "text-[#FFD700]" : "text-gray-400 hover:text-[#FFD700]"
                    )}
                >
                    {mode === 'bounties' && (
                        <motion.div
                            layoutId="mode-highlight"
                            className="absolute inset-0 bg-[#FFD700]/20 border border-[#FFD700]/50 rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                        Opportunities
                        {mode === 'builders' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}
