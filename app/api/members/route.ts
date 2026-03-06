import { NextRequest, NextResponse } from 'next/server';
import { getWalletActivityBatch } from '@/lib/services/onchain-activity';
import type { OnchainActivity } from '@/lib/services/onchain-activity';
import { fetchMemberRoster } from '@/lib/services/member-roster';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const country = searchParams.get('country');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const search = searchParams.get('search');
  const withActivity = searchParams.get('withActivity') === 'true';
  const sort = searchParams.get('sort') || 'name';
  const skip = (page - 1) * limit;

  try {
    const roster = await fetchMemberRoster({
      country,
      search,
      skip,
      take: limit,
    });

    let enrichedMembers: Array<typeof roster.members[number] & { activity?: OnchainActivity | null }> = [
      ...roster.members,
    ];

    if (withActivity) {
      const walletActivity = await getWalletActivityBatch(
        roster.members.map((member) => member.wallet),
        { concurrency: 4 }
      );

      enrichedMembers = roster.members.map((member) => ({
        ...member,
        activity: walletActivity.get(member.wallet) ?? null,
      }));

      if (sort === 'activity') {
        enrichedMembers.sort((a, b) => {
          const scoreA = a.activity?.score || 0;
          const scoreB = b.activity?.score || 0;

          if (scoreA === scoreB) {
            return a.name.localeCompare(b.name);
          }

          return scoreB - scoreA;
        });
      }
    }

    return NextResponse.json({
      members: enrichedMembers,
      pagination: {
        page,
        limit,
        total: roster.total,
        totalPages: Math.ceil(roster.total / limit),
        hasMore: skip + roster.members.length < roster.total,
      },
      meta: {
        source: roster.source,
        fallbackReason: roster.fallbackReason || null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      {
        members: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        meta: {
          source: 'error',
          fallbackReason: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 200 }
    );
  }
}
