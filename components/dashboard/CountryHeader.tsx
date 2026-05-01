'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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

interface CountryHeaderProps {
    country: string;
    memberCount: number;
    isLoading?: boolean;
}

export function CountryHeader({ country, memberCount, isLoading }: CountryHeaderProps) {
    const logoPath = COUNTRY_LOGOS[country] || '/superteam-logos/SUPERTEAM.jpg';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex items-center pb-6 border-b border-zinc-800"
        >
            <div className="flex items-center gap-5">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="relative w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-zinc-800 shadow-2xl"
                >
                    <Image
                        src={logoPath}
                        alt={`Superteam ${country}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                    />
                </motion.div>

                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="text-3xl font-serif text-white tracking-tight"
                    >
                        {country}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-sm text-muted-foreground font-data mt-0.5"
                    >
                        {isLoading ? (
                            <span className="skeleton inline-block h-4 w-24 rounded-md align-middle" />
                        ) : (
                            <>
                                <span className="text-secondary font-medium">{memberCount}</span>
                                {' '}members
                            </>
                        )}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
