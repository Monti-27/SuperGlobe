'use client';

import { motion } from 'framer-motion';
import { TECH_COLORS } from '@/lib/skills';

interface TechFiltersProps {
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

export function TechFilters({ activeFilter, onFilterChange }: TechFiltersProps) {
    // Show only first 5 main filters for the quick bar
    const mainFilters = ['Rust', 'Solidity', 'Next.js', 'Design', 'Mobile'];

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 p-1.5 rounded-full glass-strong border border-white/[0.08]"
            >
                <FilterPill
                    label="All"
                    isActive={activeFilter === null}
                    onClick={() => onFilterChange(null)}
                />

                {mainFilters.map(tech => (
                    <FilterPill
                        key={tech}
                        label={tech}
                        isActive={activeFilter === tech}
                        onClick={() => onFilterChange(activeFilter === tech ? null : tech)}
                        color={TECH_COLORS[tech]}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function FilterPill({ label, isActive, onClick, color }: { label: string, isActive: boolean, onClick: () => void, color?: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${isActive ? 'text-white' : 'text-muted-foreground hover:text-white'}
            `}
            style={{
                backgroundColor: isActive ? (color ? `${color}40` : 'rgba(255, 255, 255, 0.15)') : 'transparent',
            }}
        >
            {isActive && (
                <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: color || 'rgba(255, 255, 255, 0.4)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
                {color && (
                    <span
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: color,
                            boxShadow: isActive ? `0 0 8px ${color}` : 'none'
                        }}
                    />
                )}
                {label}
            </span>
        </button>
    );
}
