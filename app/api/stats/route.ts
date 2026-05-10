import { NextResponse } from 'next/server';
import { getCountryStats } from '@/lib/mock-data';
import { fetchMemberRoster } from '@/lib/services/member-roster';

export async function GET() {
  try {
    const roster = await fetchMemberRoster({});
    const countries = getCountryStats(roster.members);
    const total = countries.reduce((sum, item) => sum + item.count, 0);

    return NextResponse.json({
      countries,
      total,
      meta: {
        source: roster.source,
        fallbackReason: roster.fallbackReason || null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      {
        countries: [],
        total: 0,
        meta: {
          source: 'error',
          fallbackReason: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
