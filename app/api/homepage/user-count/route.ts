import { NextResponse } from "next/server";

export const revalidate = 180;

export async function GET() {
  try {
    const res = await fetch("https://superteam.fun/api/homepage/user-count", {
      next: { revalidate: 180 },
    });

    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    const payload = (await res.json()) as { totalUsers: number };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch homepage user-count:", error);
    return NextResponse.json({ totalUsers: 0 }, { status: 500 });
  }
}

