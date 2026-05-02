'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { SearchBar } from '@/components/ui/search-bar';
import { CountryHeader } from './CountryHeader';
import { DrawerSkeleton, MemberCardSkeleton } from './MemberCardSkeleton';
import { FreelancerProfileCard } from '@/components/ui/freelancer-profile-card';
import { type Member } from '@/lib/mock-data';
import { formatIntentLabel, getMemberSkills } from '@/lib/utils';
import { Opportunity } from '@/lib/services/superteam-earn';

type DrawerMember = Member & {
  isSuperteam?: boolean;
  activity?: {
    score: number;
  } | null;
};

interface MembersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string | null;
  mode?: 'builders' | 'bounties';
  opportunities?: Opportunity[];
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

function primaryMemberTitle(member: DrawerMember) {
  const skills = getMemberSkills(member);
  if (skills.length > 0) {
    return `${skills[0]} Builder`;
  }

  return 'Web3 Builder';
}

function primaryMemberStatus(member: DrawerMember) {
  if (member.intents?.length) {
    return formatIntentLabel(member.intents[0]);
  }

  return `Activity ${member.activity?.score || 0}`;
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
}: MembersDrawerProps) {
  const [members, setMembers] = useState<DrawerMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [opportunityType, setOpportunityType] = useState<'all' | 'bounty' | 'project'>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [agentAllowedOnly, setAgentAllowedOnly] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<DrawerMember[]>([]);
  const membersByCountryCache = useRef(new Map<string, DrawerMember[]>());
  const scrollByCountry = useRef(new Map<string, number>());

  const handleScrollAreaWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const nextScrollTop = scrollTop + event.deltaY;
    const maxScrollTop = scrollHeight - clientHeight;
    const canScroll = maxScrollTop > 0;

    if (!canScroll) {
      return;
    }

    event.stopPropagation();

    if (nextScrollTop <= 0 || nextScrollTop >= maxScrollTop) {
      element.scrollTop = Math.max(0, Math.min(maxScrollTop, nextScrollTop));
      event.preventDefault();
      return;
    }

    element.scrollTop = nextScrollTop;
    event.preventDefault();
  }, []);

  const filteredMembers = members;

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  const fetchMembers = useCallback(
    async (
      countryName: string,
      pageNum: number,
      append: boolean,
      searchTerm = '',
      options?: { preserveShell?: boolean }
    ) => {
      const normalizedSearch = searchTerm.trim();
      const preserveShell = options?.preserveShell ?? false;

      if (pageNum === 1) {
        if (preserveShell) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          country: countryName,
          page: String(pageNum),
          limit: String(COUNTRY_CACHE_LIMIT),
          withActivity: normalizedSearch ? 'false' : 'true',
          sort: normalizedSearch ? 'name' : 'activity',
        });

        if (normalizedSearch) {
          params.set('search', normalizedSearch);
        }

        const res = await fetch(`/api/members?${params.toString()}`);
        const data = await res.json();

        if (!Array.isArray(data.members) || data.error) {
          return;
        }

        const currentForCountry =
          append && !normalizedSearch
            ? membersByCountryCache.current.get(countryName) || []
            : append
              ? membersRef.current
              : [];
        const deduped = new Map<string, Member>();
        for (const member of [...currentForCountry, ...data.members]) {
          deduped.set(member.id, member);
        }
        const nextMembers = Array.from(deduped.values());

        setMembers(nextMembers);
        if (!normalizedSearch) {
          membersByCountryCache.current.set(countryName, nextMembers);
        }

        setHasMore(Boolean(data.pagination?.hasMore));
        setTotal(Number(data.pagination?.total || nextMembers.length));
        setPage(pageNum);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoading(false);
        setSearchLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 220);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

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

      fetchMembers(country, 1, false, '', { preserveShell: true });
      return;
    }

    setMembers([]);
    setHasMore(true);
    setPage(1);
    fetchMembers(country, 1, false, '');
  }, [open, country, mode, fetchMembers]);

  useEffect(() => {
    if (!open || !country || mode !== 'builders') {
      return;
    }

    setHasMore(true);
    setPage(1);
    fetchMembers(country, 1, false, debouncedSearchQuery, { preserveShell: true });
  }, [open, country, mode, debouncedSearchQuery, fetchMembers]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !country || loadingMore || !hasMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    scrollByCountry.current.set(country, scrollTop);

    if (scrollHeight - scrollTop - clientHeight < 80) {
      fetchMembers(country, page + 1, true, debouncedSearchQuery);
    }
  }, [country, loadingMore, hasMore, page, fetchMembers, debouncedSearchQuery]);

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
      <DrawerContent className="max-h-[84vh] bg-zinc-950">
        <div className="mx-auto w-full max-w-6xl p-5 md:p-6">
          {mode === 'builders' ? (
            <>
              <CountryHeader country={country || 'Global'} memberCount={total} isLoading={loading} />

              <div className="mt-4">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={setSearchQuery}
                  placeholder={`Search ${total.toLocaleString()} builders...`}
                />
              </div>

              <div
                ref={scrollRef}
                onScroll={handleScroll}
                onWheelCapture={handleScrollAreaWheel}
                className="mt-4 overflow-y-auto max-h-[52vh] pr-2 -mr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(82,82,91,0.9) transparent',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {loading && <DrawerSkeleton />}

                {!loading && searchLoading && <DrawerSkeleton />}

                {!loading && !searchLoading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredMembers.map((member) => (
                      <FreelancerProfileCard
                        key={member.id}
                        name={member.name}
                        title={primaryMemberTitle(member)}
                        avatarSrc={
                          member.avatarUrl ||
                          `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(member.name)}`
                        }
                        bannerSrc={getWalletBanner(member.wallet)}
                        rating={Math.max(3.8, Math.min(5, (member.activity?.score || 0) / 20))}
                        duration={[member.city, member.country].filter(Boolean).join(', ') || member.country}
                        rate={primaryMemberStatus(member)}
                        wallet={member.wallet}
                        bio={member.bio}
                        socials={member.socials}
                        github={member.github}
                        tools={getMemberSkills(member).slice(0, 3).map((skill) => (
                          <div key={skill} className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/85">
                            {skill}
                          </div>
                        ))}
                        isExpanded={expandedId === member.id}
                        isSuperteam={member.isSuperteam}
                        onClick={() => setExpandedId((prev) => (prev === member.id ? null : member.id))}
                        className="w-full"
                        profileUrl={`/user/profile/${encodeURIComponent(member.id)}`}
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

                {!loading && !searchLoading && filteredMembers.length === 0 && (
                  <div className="py-12 text-center text-zinc-500">
                    {searchQuery ? `No members found for "${searchQuery}"` : 'No members found in this country.'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif text-[#FFD700] tracking-tight">Live Opportunities</h2>
                  <p className="mt-1 text-sm font-data text-zinc-400">
                    ${Math.round(totalOpportunityValue).toLocaleString()} total value • {visibleOpportunities.length}{' '}
                    active
                  </p>
                </div>

                <div className="rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-[10px] uppercase tracking-wider text-[#FFD700]">
                  Live from Superteam API
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setOpportunityType('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    opportunityType === 'all'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setOpportunityType('bounty')}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    opportunityType === 'bounty'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Bounties
                </button>
                <button
                  onClick={() => setOpportunityType('project')}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    opportunityType === 'project'
                      ? 'border-[#FFD700]/40 bg-[#FFD700]/12 text-[#FFD700]'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setUrgentOnly((value) => !value)}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    urgentOnly ? 'border-white/20 bg-zinc-800 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setVerifiedOnly((value) => !value)}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    verifiedOnly ? 'border-white/20 bg-zinc-800 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Verified Sponsors
                </button>
                <button
                  onClick={() => setAgentAllowedOnly((value) => !value)}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    agentAllowedOnly ? 'border-white/20 bg-zinc-800 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Agent Allowed
                </button>
              </div>

              <div
                onWheelCapture={handleScrollAreaWheel}
                className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 -mr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(82,82,91,0.9) transparent',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {visibleOpportunities.map((opportunity) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-[#FFD700]/30 hover:bg-zinc-900/95"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#FFD700]/80 mb-1">
                          {opportunity.type}
                        </p>
                        <h3 className="font-medium text-white group-hover:text-[#FFD700] transition-colors">
                          {opportunity.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">
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
                        <p className="mt-1 text-[10px] text-zinc-500">
                          Due {new Date(opportunity.deadline).toLocaleDateString()}
                        </p>
                        <a
                          href={opportunity.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block rounded-xl bg-[#FFD700] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#FFD700]/90"
                        >
                          APPLY
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {visibleOpportunities.length === 0 && (
                <div className="py-12 text-center text-zinc-500">
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
