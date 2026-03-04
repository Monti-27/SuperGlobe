import type {
  CountryIntelligence,
  DataFreshnessMeta,
  LiveGrant,
  Opportunity,
} from "@/lib/services/superteam-live";
import type { OnchainActivity } from "@/lib/services/onchain-activity";

export type { Opportunity, LiveGrant, CountryIntelligence, DataFreshnessMeta, OnchainActivity };

export interface OpportunitiesResponse {
  meta: DataFreshnessMeta;
  totals: {
    count: number;
    rewardUsd: number;
    featuredCount: number;
    agentAllowedCount: number;
  };
  opportunities: Opportunity[];
}

export interface GrantsResponse {
  meta: DataFreshnessMeta;
  totals: {
    count: number;
    approvedUsd: number;
    maxRewardUsd: number;
  };
  grants: LiveGrant[];
}

export interface CountryIntelligenceResponse {
  meta: {
    fetchedAt: string;
    cacheTtlSeconds: number;
    sources: string[];
    memberFallbackReason?: string | null;
  };
  totals: {
    countries: number;
    builders: number;
    opportunities: number;
    grants: number;
  };
  countries: CountryIntelligence[];
}

export interface HomepageStatsResponse {
  totalUsers: number;
  totalSponsors: number;
  solPriceUsd: number | null;
  meta: DataFreshnessMeta;
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchOpportunities(params?: {
  country?: string;
  type?: "bounty" | "project";
  urgentOnly?: boolean;
  agentAllowedOnly?: boolean;
  take?: number;
}): Promise<OpportunitiesResponse> {
  const query = new URLSearchParams();
  if (params?.country) query.set("country", params.country);
  if (params?.type) query.set("type", params.type);
  if (params?.urgentOnly) query.set("urgentOnly", "true");
  if (params?.agentAllowedOnly) query.set("agentAllowedOnly", "true");
  if (params?.take) query.set("take", String(params.take));

  const data = await safeFetchJson<OpportunitiesResponse>(
    `/api/opportunities/live${query.toString() ? `?${query.toString()}` : ""}`
  );

  return (
    data || {
      meta: {
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        cacheTtlSeconds: 60,
      },
      totals: {
        count: 0,
        rewardUsd: 0,
        featuredCount: 0,
        agentAllowedCount: 0,
      },
      opportunities: [],
    }
  );
}

export async function fetchGrants(params?: { country?: string; take?: number }): Promise<GrantsResponse> {
  const query = new URLSearchParams();
  if (params?.country) query.set("country", params.country);
  if (params?.take) query.set("take", String(params.take));

  const data = await safeFetchJson<GrantsResponse>(
    `/api/grants/live${query.toString() ? `?${query.toString()}` : ""}`
  );

  return (
    data || {
      meta: {
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        cacheTtlSeconds: 60,
      },
      totals: {
        count: 0,
        approvedUsd: 0,
        maxRewardUsd: 0,
      },
      grants: [],
    }
  );
}

export async function fetchCountryIntelligence(refresh = false): Promise<CountryIntelligenceResponse> {
  const data = await safeFetchJson<CountryIntelligenceResponse>(
    `/api/countries/intelligence${refresh ? "?refresh=true" : ""}`
  );

  return (
    data || {
      meta: {
        fetchedAt: new Date().toISOString(),
        cacheTtlSeconds: 60,
        sources: ["fallback"],
      },
      totals: {
        countries: 0,
        builders: 0,
        opportunities: 0,
        grants: 0,
      },
      countries: [],
    }
  );
}

export async function fetchOnchainActivity(wallet: string): Promise<OnchainActivity | null> {
  if (!wallet) {
    return null;
  }

  const data = await safeFetchJson<{ activity: OnchainActivity }>(
    `/api/onchain/activity?wallet=${encodeURIComponent(wallet)}`
  );

  return data?.activity || null;
}

export async function fetchHomepageStats(): Promise<HomepageStatsResponse> {
  const [usersData, sponsorsData, priceData] = await Promise.all([
    safeFetchJson<{ totalUsers: number }>("/api/homepage/user-count"),
    safeFetchJson<{ totalSponsors: number }>("/api/homepage/sponsor-count"),
    safeFetchJson<{ price: number }>("/api/wallet/price?mintAddress=So11111111111111111111111111111111111111112"),
  ]);

  return {
    totalUsers: usersData?.totalUsers || 0,
    totalSponsors: sponsorsData?.totalSponsors || 0,
    solPriceUsd: typeof priceData?.price === "number" ? priceData.price : null,
    meta: {
      source: "superteam-homepage",
      fetchedAt: new Date().toISOString(),
      cacheTtlSeconds: 180,
    },
  };
}
