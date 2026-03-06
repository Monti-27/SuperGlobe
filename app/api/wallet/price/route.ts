import { NextRequest, NextResponse } from "next/server";

export const revalidate = 180;

const DEFAULT_MINT = "So11111111111111111111111111111111111111112";

export async function GET(request: NextRequest) {
  const mintAddress = request.nextUrl.searchParams.get("mintAddress") || DEFAULT_MINT;

  try {
    const res = await fetch(
      `https://superteam.fun/api/wallet/price?mintAddress=${encodeURIComponent(mintAddress)}`,
      { next: { revalidate: 180 } }
    );

    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    const payload = (await res.json()) as { price: number };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch wallet price:", error);
    return NextResponse.json({ price: null }, { status: 500 });
  }
}

