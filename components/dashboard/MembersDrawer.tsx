'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { CountryHeader } from './CountryHeader';
import { SearchInput } from './SearchInput';
import { DrawerSkeleton, MemberCardSkeleton } from './MemberCardSkeleton';
import { FreelancerProfileCard } from '@/components/ui/freelancer-profile-card';
import { getMemberSkills } from '@/lib/utils';
import { CountryIntelligence, Opportunity } from '@/lib/services/superteam-earn';

interface Member {
  id: string;
  name: string;
  wallet: string;
  country: string;
  lat: number;
  lng: number;
  activity?: {
    score: number;
  } | null;
}

interface MembersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string | null;
  mode?: 'builders' | 'bounties';
  opportunities?: Opportunity[];
  countryIntelligence?: CountryIntelligence | null;
}

const COUNTRY_CACHE_LIMIT = 30;

function getWalletBanner(wallet: string): string {
  const palette = [
    ['#1d1731', '#2d4c7d'],
    ['#1f2a38', '#205767'],
    ['#2e1a3e', '#823c79'],
    ['#1a2e2c', '#237c66'],
    ['#2d1b1b', '#915744'],
  ];

  let hash = 0;
  for (let i = 0; i < wallet.length; i++) {
    hash = (hash << 5) - hash + wallet.charCodeAt(i);
    hash |= 0;
  }

  const [from, to] = palette[Math.abs(hash) % palette.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect fill='url(#g)' width='1200' height='400'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function urgencyLabel(opportunity: Opportunity): string {
  if (opportunity.urgency === 'critical') {
    return 'Closing Soon';
  }

  if (opportunity.urgency === 'soon') {
    return 'This Week';
  }

  if (opportunity.urgency === 'expired') {
    return 'Closed';
  }

  return 'Open';
}

export function MembersDrawer({
  open,
  onOpenChange,
  country,
  mode = 'builders',
  opportunities = [],
  countryIntelligence = null,
}: MembersDrawerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [opportunityType, setOpportunityType] = useState<'all' | 'bounty' | 'project'>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [agentAllowedOnly, setAgentAllowedOnly] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const membersByCountryCache = useRef(new Map<string, Member[]>());
  const scrollByCountry = useRef(new Map<string, number>());

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) => member.name.toLowerCase().includes(query) || member.wallet.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const fetchMembers = useCallback(async (countryName: string, pageNum: number, append: boolean) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(
        `/api/members?country=${encodeURIComponent(countryName)}&page=${pageNum}&limit=${COUNTRY_CACHE_LIMIT}&withActivity=true&sort=activity`
      );
      const data = await res.json();

      if (!Array.isArray(data.members) || data.error) {
        return;
      }

      const currentForCountry = append ? membersByCountryCache.current.get(countryName) || [] : [];
      const deduped = new Map<string, Member>();
      for (const member of [...currentForCountry, ...data.members]) {
        deduped.set(member.id, member);
      }
      const nextMembers = Array.from(deduped.values());

      setMembers(nextMembers);
      membersByCountryCache.current.set(countryName, nextMembers);

      setHasMore(Boolean(data.pagination?.hasMore));
      setTotal(Number(data.pagination?.total || nextMembers.length));
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !country || mode !== 'builders') {
      return;
    }

    const cached = membersByCountryCache.current.get(country);
    setExpandedId(null);
    setSearchQuery('');

    if (cached && cached.length > 0) {
      setMembers(cached);
      setLoading(false);
      setTotal(cached.length);
      setHasMore(true);
      setPage(1);

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollByCountry.current.get(country) || 0;
        }
      });

      fetchMembers(country, 1, false);
      return;
    }

    setMembers([]);
    setHasMore(true);
    setPage(1);
    fetchMembers(country, 1, false);
  }, [open, country, mode, fetchMembers]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !country || loadingMore || !hasMore || searchQuery) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    scrollByCountry.current.set(country, scrollTop);

    if (scrollHeight - scrollTop - clientHeight < 80) {
      fetchMembers(country, page + 1, true);
    }
  }, [country, loadingMore, hasMore, searchQuery, page, fetchMembers]);

  const visibleOpportunities = useMemo(() => {
    let list = opportunities;

    if (country) {
      list = list.filter((item) => item.country === country);
    }

    if (opportunityType !== 'all') {
      list = list.filter((item) => item.type === opportunityType);
    }

    if (urgentOnly) {
      list = list.filter((item) => item.urgency === 'critical' || item.urgency === 'soon');
    }

    if (verifiedOnly) {
      list = list.filter((item) => item.sponsorVerified);
    }

    if (agentAllowedOnly) {
      list = list.filter((item) => item.agentAccess === 'AGENT_ALLOWED');
    }

    return list;
  }, [opportunities, country, opportunityType, urgentOnly, verifiedOnly, agentAllowedOnly]);

  const totalOpportunityValue = visibleOpportunities.reduce((sum, item) => sum + item.rewardAmount, 0);

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && country && scrollRef.current) {
          scrollByCountry.current.set(country, scrollRef.current.scrollTop);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DrawerContent className="glass-strong border-t border-white/[0.08] max-h-[78vh]">
        <div className="mx-auto w-full max-w-5xl p-5 md:p-6">
          {mode === 'builders' ? (
            <>
              <CountryHeader country={country || 'Global'} memberCount={total} isLoading={loading} />

              {!loading && (
                <div className="mt-4">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={`Search ${total.toLocaleString()} builders...`}
                  />
                </div>
              )}

              {countryIntelligence && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Activity Index</p>
                    <p className="text-lg font-data text-secondary mt-1">{countryIntelligence.activityIndex}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Opps</p>
                    <p className="text-lg font-data text-[#FFD700] mt-1">{countryIntelligence.openOpportunities}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reward Pool</p>
                    <p className="text-lg font-data text-white mt-1">
                      ${Math.round(countryIntelligence.opportunityValueUsd).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Updated</p>
                    <p className="text-xs font-data text-muted-foreground mt-2">
                      {new Date(countryIntelligence.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="mt-4 overflow-y-auto max-h-[52vh] pr-2 -mr-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}
              >
                {loading && <DrawerSkeleton />}

                {!loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredMembers.map((member) => (
                      <FreelancerProfileCard
                        key={member.id}
                        name={member.name}
                        title={`${getMemberSkills(member.wallet)[0]} Builder`}
                        avatarSrc={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(member.name)}`}
                        bannerSrc={getWalletBanner(member.wallet)}
                        rating={Math.max(3.8, Math.min(5, (member.activity?.score || 0) / 20))}
                        duration={`${member.country}`}
                        rate={`Activity ${member.activity?.score || 0}`}
                        wallet={member.wallet}
                        tools={getMemberSkills(member.wallet).slice(0, 3).map((skill) => (
                          <div key={skill} className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/85">
                            {skill}
                          </div>
                        ))}
                        isExpanded={expandedId === member.id}
                        onClick={() => setExpandedId((prev) => (prev === member.id ? null : member.id))}
                        className="w-full"
                      />
                    ))}

                    {loadingMore && (
                      <>
                        <MemberCardSkeleton />
                        <MemberCardSkeleton />
                      </>
                    )}
                  </div>
                )}

                {!loading && filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? `No members found for "${searchQuery}"` : 'No members found in this country.'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h2 className="text-2xl font-serif text-[#FFD700] tracking-tight">Live Opportunities</h2>
                  <p className="text-sm text-muted-foreground font-data mt-1">
                    ${Math.round(totalOpportunityValue).toLocaleString()} total value • {visibleOpportunities.length}{' '}
                    active
                  </p>
                </div>

                <div className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700]">
                  Live from Superteam API
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setOpportunityType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    opportunityType === 'all'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setOpportunityType('bounty')}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    opportunityType === 'bounty'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  Bounties
                </button>
                <button
                  onClick={() => setOpportunityType('project')}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    opportunityType === 'project'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setUrgentOnly((value) => !value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    urgentOnly ? 'border-white/30 bg-white/12 text-white' : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setVerifiedOnly((value) => !value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    verifiedOnly ? 'border-white/30 bg-white/12 text-white' : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  Verified Sponsors
                </button>
                <button
                  onClick={() => setAgentAllowedOnly((value) => !value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    agentAllowedOnly ? 'border-white/30 bg-white/12 text-white' : 'border-white/10 text-muted-foreground'
                  }`}
                >
                  Agent Allowed
                </button>
              </div>

              <div
                className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 -mr-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,215,0,0.2) transparent' }}
              >
                {visibleOpportunities.map((opportunity) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-[#FFD700]/35 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#FFD700]/80 mb-1">
                          {opportunity.type}
                        </p>
                        <h3 className="font-medium text-white group-hover:text-[#FFD700] transition-colors">
                          {opportunity.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {opportunity.sponsorName} • {opportunity.country} • {urgencyLabel(opportunity)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {opportunity.sponsorVerified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/30">
                              Verified
                            </span>
                          )}
                          {opportunity.agentAccess === 'AGENT_ALLOWED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9945FF]/15 text-[#caa4ff] border border-[#9945FF]/30">
                              Agent Allowed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-data text-[#FFD700] font-bold">{opportunity.rewardLabel}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Due {new Date(opportunity.deadline).toLocaleDateString()}
                        </p>
                        <a
                          href={opportunity.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-[#FFD700] text-black text-xs font-bold hover:bg-[#FFD700]/90"
                        >
                          APPLY
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {visibleOpportunities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No opportunities match your selected filters.
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
