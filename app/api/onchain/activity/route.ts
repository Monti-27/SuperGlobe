import { NextRequest, NextResponse } from "next/server";
import { getWalletActivity } from "@/lib/services/onchain-activity";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet query parameter" }, { status: 400 });
  }

  try {
    const activity = await getWalletActivity(wallet);
    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Failed to fetch on-chain activity:", error);
    return NextResponse.json({ error: "Failed to fetch on-chain activity" }, { status: 500 });
  }
}

