'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

// Superteam logo mapping
const COUNTRY_LOGOS: Record<string, string> = {
    'Nigeria': '/superteam-logos/nigeria.jpg',
    'India': '/superteam-logos/india.jpg',
    'Germany': '/superteam-logos/germant.jpg',
    'United Kingdom': '/superteam-logos/uk.jpg',
    'Brazil': '/superteam-logos/brasil.jpg',
    'Japan': '/superteam-logos/japan.jpg',
    'South Korea': '/superteam-logos/korea.png',
    'Singapore': '/superteam-logos/singapore.jpg',
    'Malaysia': '/superteam-logos/malysia.jpg',
    'UAE': '/superteam-logos/uae.jpg',
    'Canada': '/superteam-logos/canada.jpg',
    'Balkans': '/superteam-logos/balkan.jpg',
    'Turkey': '/superteam-logos/SUPERTEAM.jpg',
    'Vietnam': '/superteam-logos/SUPERTEAM.jpg',
    'Philippines': '/superteam-logos/SUPERTEAM.jpg',
    'France': '/superteam-logos/SUPERTEAM.jpg',
};

interface CountryStat {
    country: string;
    count: number;
    flag: string;
}

interface CountrySidebarProps {
    stats: CountryStat[];
    selectedCountry: string | null;
    focusedCountry?: string | null;
    onCountryClick: (country: string) => void;
    isLoaded: boolean;
}

export function CountrySidebar({
    stats,
    selectedCountry,
    focusedCountry,
    onCountryClick,
    isLoaded
}: CountrySidebarProps) {
    if (!isLoaded) {
        return (
            <div className="glass rounded-xl p-4 w-64">
                <Skeleton className="mb-4 h-3 w-20" />
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-3 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass rounded-xl p-4 w-64"
        >
            <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Superteam Hubs
            </h2>

            <div className="space-y-1">
                {stats.slice(0, 10).map((stat, index) => {
                    const logoPath = COUNTRY_LOGOS[stat.country] || '/superteam-logos/SUPERTEAM.jpg';
                    const isSelected = selectedCountry === stat.country;
                    const isFocused = focusedCountry === stat.country;

                    return (
                        <motion.button
                            key={stat.country}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onCountryClick(stat.country)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${isSelected
                                ? 'bg-primary/15 border border-primary/30'
                                : isFocused
                                    ? 'bg-white/[0.05] border border-white/20'
                                    : 'hover:bg-white/[0.04] border border-transparent'
                                }`}
                        >
                            {/* Logo */}
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/[0.08] flex-shrink-0">
                                <Image
                                    src={logoPath}
                                    alt={stat.country}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            </div>

                            {/* Country Name */}
                            <span className={`text-base font-serif flex-1 truncate transition-colors ${isSelected ? 'text-white' : 'text-foreground/70 group-hover:text-foreground'
                                }`}>
                                {stat.country}
                            </span>

                            {/* Count */}
                            <motion.span
                                className={`text-xs font-data tabular-nums ${isSelected ? 'text-primary' : 'text-secondary'
                                    }`}
                                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                            >
                                {stat.count}
                            </motion.span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}
