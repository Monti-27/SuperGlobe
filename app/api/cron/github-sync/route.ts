import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectGithubProfile } from '@/lib/services/profile-onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connections = await prisma.gitHubConnection.findMany({
    select: {
      userId: true,
      username: true,
    },
    take: 100,
  });

  const results = await Promise.allSettled(
    connections.map((connection) => connectGithubProfile(connection.userId, connection.username))
  );

  return NextResponse.json({
    ok: true,
    total: connections.length,
    refreshed: results.filter((result) => result.status === 'fulfilled').length,
  });
}
