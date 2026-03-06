import { NextRequest, NextResponse } from "next/server";
import { getWalletActivityBatch } from "@/lib/services/onchain-activity";
import { fetchMemberWalletCountrySnapshot } from "@/lib/services/member-roster";
import {
  buildCountryIntelligence,
  fetchLiveGrants,
  fetchLiveOpportunities,
} from "@/lib/services/superteam-live";

export const revalidate = 300;

interface CachePayload {
  expiresAt: number;
  data: unknown;
}

const globalCache = globalThis as unknown as {
  countryIntelligenceCache?: CachePayload;
};

function getSampleWalletsByCountry(
  members: Array<{ country: string; wallet: string }>,
  sampleSize = 6
): string[] {
  const grouped = new Map<string, string[]>();

  for (const member of members) {
    if (!grouped.has(member.country)) {
      grouped.set(member.country, []);
    }

    const wallets = grouped.get(member.country)!;
    if (wallets.length < sampleSize) {
      wallets.push(member.wallet);
    }
  }

  return Array.from(grouped.values()).flat();
}

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get("refresh") === "true";
  const now = Date.now();

  if (!refresh && globalCache.countryIntelligenceCache && globalCache.countryIntelligenceCache.expiresAt > now) {
    return NextResponse.json(globalCache.countryIntelligenceCache.data);
  }

  try {
    const [membersSnapshot, opportunitiesPayload, grantsPayload] = await Promise.all([
      fetchMemberWalletCountrySnapshot(),
      fetchLiveOpportunities().catch((error) => {
        console.error("Failed to fetch live opportunities for intelligence:", error);
        return {
          opportunities: [],
          meta: {
            source: "fallback-opportunities",
            fetchedAt: new Date().toISOString(),
            cacheTtlSeconds: 60,
          },
        };
      }),
      fetchLiveGrants().catch((error) => {
        console.error("Failed to fetch live grants for intelligence:", error);
        return {
          grants: [],
          meta: {
            source: "fallback-grants",
            fetchedAt: new Date().toISOString(),
            cacheTtlSeconds: 60,
          },
        };
      }),
    ]);

    const sampleWallets = getSampleWalletsByCountry(membersSnapshot.members);
    const onchainByWallet = await getWalletActivityBatch(sampleWallets, { concurrency: 4 });

    const countries = buildCountryIntelligence({
      members: membersSnapshot.members,
      opportunities: opportunitiesPayload.opportunities,
      grants: grantsPayload.grants,
      onchainByWallet,
    });

    const payload = {
      meta: {
        fetchedAt: new Date().toISOString(),
        cacheTtlSeconds: 300,
        sources: [
          opportunitiesPayload.meta.source,
          grantsPayload.meta.source,
          "solana-rpc",
          membersSnapshot.source === "prisma" ? "prisma-member-db" : "csv-member-roster",
        ],
        memberFallbackReason: membersSnapshot.fallbackReason || null,
      },
      totals: {
        countries: countries.length,
        builders: membersSnapshot.members.length,
        opportunities: opportunitiesPayload.opportunities.length,
        grants: grantsPayload.grants.length,
      },
      countries,
    };

    globalCache.countryIntelligenceCache = {
      data: payload,
      expiresAt: now + 300_000,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to build country intelligence:", error);
    return NextResponse.json({
      meta: {
        fetchedAt: new Date().toISOString(),
        cacheTtlSeconds: 60,
        sources: ["fallback"],
      },
      countries: [],
      totals: {
        countries: 0,
        builders: 0,
        opportunities: 0,
        grants: 0,
      },
      error: "Failed to build country intelligence",
    });
  }
}
