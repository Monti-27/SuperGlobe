'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateWallet } from '@/lib/mock-data';

interface Member {
    id: string;
    name: string;
    wallet: string;
    country: string;
    lat: number;
    lng: number;
}

import { getMemberSkills } from '@/lib/utils';
// Mock for now, or from utils if I move TECH_COLORS there. 
// Actually I defined TECH_COlORS in BuilderGlobe locally? No I replaced it with SKILL_COLORS.
// Wait, MemberCard needs TECH_COLORS.
// I will define TECH_COLORS in lib/utils as well or locally in MemberCard.
// For now, let's keep it simple. ActiveFilter names match colors.
const TECH_COLORS: Record<string, string> = {
    'Rust': '#dea584',
    'Solidity': '#363636',
    'Next.js': '#000000',
    'React': '#61dafb',
    'Mobile': '#a4c639',
    'Design': '#ff61f6',
    'Full Stack': '#FFD700'
};

interface MemberCardProps {
    member: Member;
    index: number;
}

export function MemberCard({ member, index }: MemberCardProps) {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const skills = getMemberSkills(member.wallet);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(member.wallet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Generate avatar gradient from name
    const getAvatarGradient = (name: string) => {
        const colors = [
            ['#9945FF', '#14F195'],
            ['#14F195', '#00D1FF'],
            ['#FF6B6B', '#FFE66D'],
            ['#4ECDC4', '#556270'],
            ['#667EEA', '#764BA2'],
            ['#F093FB', '#F5576C'],
        ];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const gradient = getAvatarGradient(member.name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.03,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative group flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/5"
        >
            {/* Hover glow effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-tr from-primary/[0.05] via-transparent to-secondary/[0.05] pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    {/* Updated styling for Avatar */}
                    <div
                        className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-inner ring-1 ring-white/10"
                        style={{
                            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
                        }}
                    >
                        {member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                        <p className="text-base font-serif text-white truncate max-w-[140px] leading-tight transition-colors group-hover:text-primary">
                            {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {member.country}
                        </p>
                    </div>
                </div>

                <span className="text-[10px] font-data text-white/20">
                    #{String(index + 1).padStart(3, '0')}
                </span>
            </div>

            {/* Skills Row */}
            <div className="flex flex-wrap gap-1.5 mb-4 relative z-10 min-h-[24px]">
                {skills.slice(0, 4).map(skill => (
                    <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-full border bg-white/[0.02] font-medium"
                        style={{
                            color: TECH_COLORS[skill] || '#ccc',
                            borderColor: `${TECH_COLORS[skill]}30` || 'rgba(255,255,255,0.1)'
                        }}
                    >
                        {skill}
                    </span>
                ))}
                {skills.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{skills.length - 4}</span>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06] relative z-10">
                <motion.code
                    className="text-[10px] font-data px-2 py-1 rounded bg-black/20 text-muted-foreground"
                    animate={copied ? { color: '#14F195' } : {}}
                >
                    {truncateWallet(member.wallet)}
                </motion.code>

                <div className="flex items-center gap-2">
                    {/* View Profile Button (Mock) */}
                    <motion.button
                        className="text-[10px] font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1 group/btn"
                    >
                        Profile
                        <svg className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>

                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                        whileHover={{ scale: 1.1, color: '#14F195' }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-muted-foreground transition-all"
                    >
                        <AnimatePresence mode="wait">
                            {copied ? (
                                <motion.span
                                    key="copied"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                >
                                    ✓
                                </motion.span>
                            ) : (
                                <motion.svg
                                    key="copy"
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </motion.svg>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
