import { NextRequest, NextResponse } from "next/server";
import { fetchLiveGrants } from "@/lib/services/superteam-live";

export const revalidate = 180;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const sponsorSlug = searchParams.get("sponsorSlug");
  const take = Number(searchParams.get("take") || "0");

  try {
    const { grants, meta } = await fetchLiveGrants();

    let filtered = grants;

    if (country) {
      filtered = filtered.filter((grant) => grant.country === country);
    }

    if (sponsorSlug) {
      filtered = filtered.filter((grant) => grant.sponsorSlug === sponsorSlug);
    }

    if (take > 0) {
      filtered = filtered.slice(0, take);
    }

    return NextResponse.json({
      meta,
      totals: {
        count: filtered.length,
        approvedUsd: filtered.reduce((sum, grant) => sum + grant.totalApproved, 0),
        maxRewardUsd: filtered.reduce((sum, grant) => sum + grant.maxReward, 0),
      },
      grants: filtered,
    });
  } catch (error) {
    console.error("Failed to fetch live grants:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live grants",
        grants: [],
        totals: {
          count: 0,
          approvedUsd: 0,
          maxRewardUsd: 0,
        },
      },
      { status: 500 }
    );
  }
}

