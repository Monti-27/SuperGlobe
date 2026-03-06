import { NextRequest, NextResponse } from "next/server";
import { fetchLiveOpportunities } from "@/lib/services/superteam-live";

export const revalidate = 180;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get("country");
  const type = searchParams.get("type");
  const urgentOnly = searchParams.get("urgentOnly") === "true";
  const agentAllowedOnly = searchParams.get("agentAllowedOnly") === "true";
  const take = Number(searchParams.get("take") || "0");

  try {
    const { opportunities, meta } = await fetchLiveOpportunities();

    let filtered = opportunities;

    if (country) {
      filtered = filtered.filter((item) => item.country === country);
    }

    if (type === "bounty" || type === "project") {
      filtered = filtered.filter((item) => item.type === type);
    }

    if (urgentOnly) {
      filtered = filtered.filter((item) => item.urgency === "critical" || item.urgency === "soon");
    }

    if (agentAllowedOnly) {
      filtered = filtered.filter((item) => item.agentAccess === "AGENT_ALLOWED");
    }

    if (take > 0) {
      filtered = filtered.slice(0, take);
    }

    const totals = {
      count: filtered.length,
      rewardUsd: filtered.reduce((sum, item) => sum + item.rewardAmount, 0),
      featuredCount: filtered.filter((item) => item.isFeatured).length,
      agentAllowedCount: filtered.filter((item) => item.agentAccess === "AGENT_ALLOWED").length,
    };

    return NextResponse.json({
      meta,
      totals,
      opportunities: filtered,
    });
  } catch (error) {
    console.error("Failed to fetch live opportunities:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch live opportunities",
        opportunities: [],
        totals: {
          count: 0,
          rewardUsd: 0,
          featuredCount: 0,
          agentAllowedCount: 0,
        },
      },
      { status: 500 }
    );
  }
}

