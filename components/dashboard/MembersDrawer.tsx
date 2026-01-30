'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateWallet } from '@/lib/mock-data';
import {
    Drawer,
    DrawerContent,
} from '@/components/ui/drawer';
import { CountryHeader } from './CountryHeader';
import { MemberCard } from './MemberCard';
import { SearchInput } from './SearchInput';
import { DrawerSkeleton } from './MemberCardSkeleton';
import { Bounty } from '@/lib/services/superteam-earn';
import { cn } from '@/lib/utils';

interface Member {
    id: string;
    name: string;
    wallet: string;
    country: string;
    lat: number;
    lng: number;
}

interface MembersDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    country: string | null;
    mode?: 'builders' | 'bounties';
    bounties?: Bounty[];
}

export function MembersDrawer({ open, onOpenChange, country, mode = 'builders', bounties = [] }: MembersDrawerProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch members
    const fetchMembers = useCallback(async (pageNum: number, append = false) => {
        if (!country) return;

        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await fetch(`/api/members?country=${encodeURIComponent(country)}&page=${pageNum}&limit=30`);
            const data = await res.json();

            if (data.error || !data.members) {
                console.error('API error:', data.error);
                return;
            }

            setMembers(prev => append ? [...prev, ...data.members] : data.members);
            // setFilteredMembers is handled by the useEffect on [members] change

            setHasMore(data.pagination?.hasMore ?? false);
            if (data.pagination?.total) {
                setTotal(data.pagination.total);
            }
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [country]);

    // Reset and fetch when country changes
    useEffect(() => {
        if (open && country && mode === 'builders') {
            setMembers([]);
            setFilteredMembers([]);
            setPage(1);
            setHasMore(true);
            setSearchQuery('');
            fetchMembers(1);
        }
    }, [open, country, mode, fetchMembers]);

    // Filter members when search changes
    useEffect(() => {
        if (!searchQuery) {
            setFilteredMembers(members);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredMembers(
                members.filter(m =>
                    m.name.toLowerCase().includes(query) ||
                    m.wallet.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, members]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (!scrollRef.current || loadingMore || !hasMore || searchQuery) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        if (scrollHeight - scrollTop - clientHeight < 100) {
            fetchMembers(page + 1, true);
        }
    }, [loadingMore, hasMore, page, fetchMembers, searchQuery]);

    // Calculate Bounty Stats
    const visibleBounties = bounties; // Use all bounties for now regardless of country, or filter? 
    // Usually "Opportunities" are global or remote, so showing all is better unless specific country filter requested.
    // However, the Globe shows beams on specific locations.
    // If user clicks a country, maybe show bounties *for that region*?
    // Our mock data has lat/lng.
    // Let's rely on global list for "Opportunities Mode" generally, but if `country` is selected, maybe filter?
    // Let's show ALL for now to ensure visibility as per plan "Display real-time Bounties".

    // Actually, if I click a country with bounty beams, I expect to see THOSE bounties.
    // But currently `bounties` mock data has random coords.
    // Let's show all bounties to be safe and populate the list.
    const totalPrize = visibleBounties.reduce((sum, b) => sum + b.tokenAmount, 0);

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="glass-strong border-t border-white/[0.06] max-h-[75vh]">
                <div className="mx-auto w-full max-w-4xl p-6">
                    {mode === 'builders' ? (
                        <>
                            {/* Header */}
                            <CountryHeader
                                country={country || ''}
                                memberCount={total}
                                isLoading={loading}
                            />

                            {/* Search */}
                            {!loading && members.length > 0 && (
                                <div className="mt-4">
                                    <SearchInput
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        placeholder={`Search ${total} members...`}
                                    />
                                </div>
                            )}

                            {/* Member List */}
                            <motion.div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="mt-4 overflow-y-auto max-h-[50vh] pr-2 -mr-2"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                                }}
                            >
                                {/* Loading State */}
                                {loading && <DrawerSkeleton />}

                                {/* Members */}
                                <AnimatePresence mode="popLayout">
                                    {!loading && (
                                        <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
                                            {filteredMembers.map((member, index) => (
                                                <MemberCard
                                                    key={member.id}
                                                    member={member}
                                                    index={index}
                                                />
                                            ))}

                                            {/* Loading More */}
                                            {loadingMore && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center justify-center py-4"
                                                >
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                            className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                                                        />
                                                        <span className="text-xs font-data">Loading more...</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* End of List */}
                                            {!hasMore && filteredMembers.length > 0 && !searchQuery && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-4"
                                                >
                                                    <span className="text-xs text-muted-foreground/50">
                                                        You've reached the end
                                                    </span>
                                                </motion.div>
                                            )}

                                            {/* No Results */}
                                            {!loading && filteredMembers.length === 0 && searchQuery && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center py-12"
                                                >
                                                    <p className="text-muted-foreground">
                                                        No members found for "{searchQuery}"
                                                    </p>
                                                </motion.div>
                                            )}

                                            {/* Empty State */}
                                            {!loading && members.length === 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-center py-12"
                                                >
                                                    <p className="text-muted-foreground">
                                                        No members in this region yet
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-white">
                            {/* Bounty Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-serif text-[#FFD700] tracking-tight">Active Opportunities</h2>
                                    <p className="text-sm text-muted-foreground font-data mt-1">
                                        Total Value: <span className="text-white font-medium">${totalPrize.toLocaleString()} available</span>
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full animate-pulse">
                                    <span className="text-xs text-[#FFD700] font-data font-bold tracking-wider">LIVE</span>
                                </div>
                            </div>

                            {/* Bounty List */}
                            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 -mr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,215,0,0.2) transparent' }}>
                                {visibleBounties.map((bounty, i) => (
                                    <motion.div
                                        key={bounty.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#FFD700]/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs text-muted-foreground overflow-hidden font-bold">
                                                {/* Placeholder Sponsor Logo */}
                                                {bounty.sponsor.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white/90 group-hover:text-[#FFD700] transition-colors">{bounty.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">{bounty.sponsor}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5 uppercase tracking-wide">{bounty.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-sm font-data text-[#FFD700] font-bold">{bounty.prize}</div>
                                                <div className="text-[10px] text-muted-foreground">Due {bounty.deadline}</div>
                                            </div>
                                            <a
                                                href={bounty.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-5 py-2 rounded-lg bg-[#FFD700] text-black text-xs font-bold font-data hover:bg-[#FFD700]/90 transition-colors shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
                                            >
                                                APPLY
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
