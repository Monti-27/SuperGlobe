import { COUNTRY_COORDS } from "@/lib/mock-data";
import type { OnchainActivity } from "@/lib/services/onchain-activity";
import { normalizeCountry } from "@/lib/country-normalization";

const SUPERTEAM_BASE_URL = "https://superteam.fun";
const REQUEST_TIMEOUT_MS = 9000;

export interface DataFreshnessMeta {
  source: string;
  fetchedAt: string;
  cacheTtlSeconds: number;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  type: "bounty" | "project";
  rewardAmount: number;
  rewardToken: string;
  rewardLabel: string;
  sponsorName: string;
  sponsorSlug: string | null;
  sponsorVerified: boolean;
  sponsorChapterId: string | null;
  status: string;
  agentAccess: string;
  isFeatured: boolean;
  isPro: boolean;
  deadline: string;
  urgency: "critical" | "soon" | "normal" | "expired";
  submissions: number;
  comments: number;
  country: string;
  coordinates: { lat: number; lng: number };
  link: string;
}

export interface LiveGrant {
  slug: string;
  title: string;
  minReward: number;
  maxReward: number;
  token: string;
  sponsorName: string;
  sponsorSlug: string | null;
  sponsorVerified: boolean;
  totalApplications: number;
  totalApproved: number;
  totalPaid: number;
  country: string;
  coordinates: { lat: number; lng: number };
  link: string;
}

export interface CountryIntelligence {
  country: string;
  coordinates: { lat: number; lng: number };
  builderCount: number;
  openOpportunities: number;
  openGrants: number;
  opportunityValueUsd: number;
  grantValueUsd: number;
  activityIndex: number;
  lastUpdated: string;
}

interface SuperteamListing {
  id: string;
  slug: string;
  title: string;
  type: "bounty" | "project";
  rewardAmount: number;
  token: string;
  deadline: string;
  isFeatured: boolean;
  isPro: boolean;
  status: string;
  agentAccess: string;
  _count?: {
    Submission?: number;
    Comments?: number;
  };
  sponsor?: {
    name?: string;
    slug?: string;
    isVerified?: boolean;
    chapter?: {
      id?: string;
    } | null;
  } | null;
}

interface SuperteamGrant {
  slug: string;
  title: string;
  minReward: number;
  maxReward: number;
  token: string;
  totalApplications?: number;
  totalApproved?: number;
  totalPaid?: number;
  sponsor?: {
    name?: string;
    slug?: string;
    isVerified?: boolean;
  } | null;
}

const COUNTRY_COORDS_EXTENDED: Record<string, { lat: number; lng: number }> = {
  ...Object.fromEntries(Object.entries(COUNTRY_COORDS).map(([, coords]) => [coords.displayName, { lat: coords.lat, lng: coords.lng }])),
  Balkans: { lat: 42.0, lng: 21.0 },
  Indonesia: { lat: -0.7893, lng: 113.9213 },
  Ireland: { lat: 53.1424, lng: -7.6921 },
  Kazakhstan: { lat: 48.0196, lng: 66.9237 },
  Netherlands: { lat: 52.1326, lng: 5.2913 },
  Poland: { lat: 51.9194, lng: 19.1451 },
  Georgia: { lat: 42.3154, lng: 43.3569 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  Ukraine: { lat: 48.3794, lng: 31.1656 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  USA: { lat: 37.0902, lng: -95.7129 },
  Global: { lat: 10, lng: 5 },
};

const SPONSOR_SLUG_COUNTRY_MAP: Record<string, string> = {
  superteambr: "Brazil",
  superteamnigeria: "Nigeria",
  superteamin: "India",
  "superteam-germany": "Germany",
  superteamuk: "United Kingdom",
  superteamcanada: "Canada",
  superteammalaysia: "Malaysia",
  superteamindo: "Indonesia",
  superteamnetherlands: "Netherlands",
  superteamie: "Ireland",
  superteamkazakhstan: "Kazakhstan",
  "superteam-poland": "Poland",
  superteamkorea: "South Korea",
  superteamae: "UAE",
  superteamblkn: "Balkans",
  superteamgeo: "Georgia",
  suptereamsg: "Singapore",
  lafamilia: "Spain",
  kumekateam: "Ukraine",
};

function normalizeCountryName(country: string | null | undefined): string {
  return normalizeCountry(country) || "Global";
}

function getCountryCoordinates(country: string): { lat: number; lng: number } {
  return COUNTRY_COORDS_EXTENDED[country] || COUNTRY_COORDS_EXTENDED.Global;
}

function inferCountryFromSponsor(sponsorName: string | null | undefined, sponsorSlug: string | null | undefined): string {
  const normalizedSlug = (sponsorSlug || "").trim().toLowerCase();
  if (normalizedSlug && SPONSOR_SLUG_COUNTRY_MAP[normalizedSlug]) {
    return SPONSOR_SLUG_COUNTRY_MAP[normalizedSlug];
  }

  const normalizedName = (sponsorName || "").trim().toLowerCase();
  const keywordMap: Array<{ keyword: string; country: string }> = [
    { keyword: "superteam brazil", country: "Brazil" },
    { keyword: "superteam nigeria", country: "Nigeria" },
    { keyword: "superteam india", country: "India" },
    { keyword: "superteam germany", country: "Germany" },
    { keyword: "superteam uk", country: "United Kingdom" },
    { keyword: "superteam canada", country: "Canada" },
    { keyword: "superteam malaysia", country: "Malaysia" },
    { keyword: "superteam indonesia", country: "Indonesia" },
    { keyword: "superteam netherlands", country: "Netherlands" },
    { keyword: "superteam ireland", country: "Ireland" },
    { keyword: "superteam kazakhstan", country: "Kazakhstan" },
    { keyword: "superteam poland", country: "Poland" },
    { keyword: "superteam korea", country: "South Korea" },
    { keyword: "superteam uae", country: "UAE" },
    { keyword: "superteam balkan", country: "Balkans" },
    { keyword: "superteam georgia", country: "Georgia" },
    { keyword: "superteam singapore", country: "Singapore" },
    { keyword: "la familia", country: "Spain" },
    { keyword: "kumeka", country: "Ukraine" },
  ];

  const matched = keywordMap.find((entry) => normalizedName.includes(entry.keyword));
  return matched ? matched.country : "Global";
}

function toRewardLabel(amount: number, token: string): string {
  return `$${amount.toLocaleString()} ${token}`;
}

function getUrgency(deadlineIso: string): "critical" | "soon" | "normal" | "expired" {
  const now = Date.now();
  const deadline = new Date(deadlineIso).getTime();
  const diffDays = (deadline - now) / (24 * 60 * 60 * 1000);

  if (!Number.isFinite(diffDays) || diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 3) {
    return "critical";
  }

  if (diffDays <= 7) {
    return "soon";
  }

  return "normal";
}

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${SUPERTEAM_BASE_URL}${path}`, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: 180,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${path} (${res.status})`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLiveOpportunities(options?: {
  status?: "open" | "review" | "completed" | "all";
  take?: number;
}): Promise<{ opportunities: Opportunity[]; meta: DataFreshnessMeta }> {
  const status = options?.status ?? "open";
  const listings = await fetchJson<SuperteamListing[]>(`/api/listings?status=${status}`);

  const normalized = listings.map((listing) => {
    const country = normalizeCountryName(
      inferCountryFromSponsor(listing.sponsor?.name || null, listing.sponsor?.slug || null)
    );
    const coordinates = getCountryCoordinates(country);

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      type: listing.type,
      rewardAmount: Number(listing.rewardAmount || 0),
      rewardToken: listing.token || "USDC",
      rewardLabel: toRewardLabel(Number(listing.rewardAmount || 0), listing.token || "USDC"),
      sponsorName: listing.sponsor?.name || "Unknown Sponsor",
      sponsorSlug: listing.sponsor?.slug || null,
      sponsorVerified: Boolean(listing.sponsor?.isVerified),
      sponsorChapterId: listing.sponsor?.chapter?.id || null,
      status: listing.status || "OPEN",
      agentAccess: listing.agentAccess || "HUMAN_ONLY",
      isFeatured: Boolean(listing.isFeatured),
      isPro: Boolean(listing.isPro),
      deadline: listing.deadline,
      urgency: getUrgency(listing.deadline),
      submissions: listing._count?.Submission || 0,
      comments: listing._count?.Comments || 0,
      country,
      coordinates,
      link: `${SUPERTEAM_BASE_URL}/earn/listing/${listing.slug}`,
    } satisfies Opportunity;
  });

  normalized.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const opportunities = typeof options?.take === "number" ? normalized.slice(0, options.take) : normalized;

  return {
    opportunities,
    meta: {
      source: `${SUPERTEAM_BASE_URL}/api/listings`,
      fetchedAt: new Date().toISOString(),
      cacheTtlSeconds: 180,
    },
  };
}

export async function fetchLiveGrants(options?: {
  take?: number;
}): Promise<{ grants: LiveGrant[]; meta: DataFreshnessMeta }> {
  const grants = await fetchJson<SuperteamGrant[]>("/api/grants");

  const normalized = grants.map((grant) => {
    const country = normalizeCountryName(
      inferCountryFromSponsor(grant.sponsor?.name || null, grant.sponsor?.slug || null)
    );

    return {
      slug: grant.slug,
      title: grant.title,
      minReward: Number(grant.minReward || 0),
      maxReward: Number(grant.maxReward || 0),
      token: grant.token || "USDC",
      sponsorName: grant.sponsor?.name || "Unknown Sponsor",
      sponsorSlug: grant.sponsor?.slug || null,
      sponsorVerified: Boolean(grant.sponsor?.isVerified),
      totalApplications: Number(grant.totalApplications || 0),
      totalApproved: Number(grant.totalApproved || 0),
      totalPaid: Number(grant.totalPaid || 0),
      country,
      coordinates: getCountryCoordinates(country),
      link: `${SUPERTEAM_BASE_URL}/earn/grants/${grant.slug}`,
    } satisfies LiveGrant;
  });

  normalized.sort((a, b) => b.maxReward - a.maxReward);
  const sliced = typeof options?.take === "number" ? normalized.slice(0, options.take) : normalized;

  return {
    grants: sliced,
    meta: {
      source: `${SUPERTEAM_BASE_URL}/api/grants`,
      fetchedAt: new Date().toISOString(),
      cacheTtlSeconds: 180,
    },
  };
}

export async function fetchLiveHomepageStats(): Promise<{
  totalUsers: number;
  totalSponsors: number;
  solPriceUsd: number | null;
  meta: DataFreshnessMeta;
}> {
  const [usersData, sponsorsData, solData] = await Promise.all([
    fetchJson<{ totalUsers: number }>("/api/homepage/user-count"),
    fetchJson<{ totalSponsors: number }>("/api/homepage/sponsor-count"),
    fetchJson<{ price: number }>("/api/wallet/price?mintAddress=So11111111111111111111111111111111111111112").catch(
      () => ({ price: null as unknown as number })
    ),
  ]);

  return {
    totalUsers: Number(usersData.totalUsers || 0),
    totalSponsors: Number(sponsorsData.totalSponsors || 0),
    solPriceUsd: typeof solData.price === "number" ? solData.price : null,
    meta: {
      source: `${SUPERTEAM_BASE_URL}/api/homepage/*`,
      fetchedAt: new Date().toISOString(),
      cacheTtlSeconds: 180,
    },
  };
}

export function buildCountryIntelligence(params: {
  members: Array<{ country: string; wallet: string }>;
  opportunities: Opportunity[];
  grants: LiveGrant[];
  onchainByWallet: Map<string, OnchainActivity>;
}): CountryIntelligence[] {
  const byCountry = new Map<string, CountryIntelligence>();

  const ensureCountry = (country: string) => {
    if (!byCountry.has(country)) {
      byCountry.set(country, {
        country,
        coordinates: getCountryCoordinates(country),
        builderCount: 0,
        openOpportunities: 0,
        openGrants: 0,
        opportunityValueUsd: 0,
        grantValueUsd: 0,
        activityIndex: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    return byCountry.get(country)!;
  };

  const memberActivitySums = new Map<string, { sum: number; count: number }>();

  for (const member of params.members) {
    const country = normalizeCountryName(member.country);
    const item = ensureCountry(country);
    item.builderCount += 1;

    const walletActivity = params.onchainByWallet.get(member.wallet);
    if (walletActivity) {
      const current = memberActivitySums.get(country) || { sum: 0, count: 0 };
      current.sum += walletActivity.score;
      current.count += 1;
      memberActivitySums.set(country, current);
    }
  }

  for (const opportunity of params.opportunities) {
    const item = ensureCountry(opportunity.country);
    item.openOpportunities += 1;
    item.opportunityValueUsd += opportunity.rewardAmount;
  }

  for (const grant of params.grants) {
    const item = ensureCountry(grant.country);
    item.openGrants += 1;
    item.grantValueUsd += grant.maxReward;
  }

  for (const [country, stats] of memberActivitySums.entries()) {
    const item = ensureCountry(country);
    item.activityIndex = stats.count > 0 ? Math.round(stats.sum / stats.count) : 0;
  }

  return Array.from(byCountry.values()).sort((a, b) => {
    const scoreA = a.openOpportunities * 4 + a.builderCount + a.activityIndex;
    const scoreB = b.openOpportunities * 4 + b.builderCount + b.activityIndex;
    return scoreB - scoreA;
  });
}
