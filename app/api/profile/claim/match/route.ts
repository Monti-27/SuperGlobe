import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SocialLinkType } from '@prisma/client';
import { authOptions } from '@/lib/twitter-auth';
import { getCurrentUserContext } from '@/lib/auth-session';
import { findRosterClaimByHandle } from '@/lib/services/member-roster';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizeHandle(value: string | null | undefined) {
  return (value || '')
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const handle = session?.user?.twitterHandle || null;

  if (!handle) {
    return NextResponse.json({
      authenticated: false,
      handle: null,
      match: null,
      localUser: null,
    });
  }

  const [match, localUser] = await Promise.all([
    findRosterClaimByHandle(handle),
    getCurrentUserContext(),
  ]);

  const localXSocial = localUser?.profile
    ? await prisma.socialLink.findFirst({
        where: {
          profileId: localUser.profile.id,
          type: SocialLinkType.X,
        },
        select: {
          url: true,
        },
      })
    : null;

  const normalizedHandle = normalizeHandle(handle);
  const localXHandle = normalizeHandle(localXSocial?.url);
  const shouldClearLocalSession = Boolean(
    localUser &&
      normalizedHandle &&
      localXHandle !== normalizedHandle &&
      (!match || localUser.wallet !== match.wallet)
  );

  return NextResponse.json({
    authenticated: true,
    handle,
    match,
    shouldClearLocalSession,
    localUser: localUser
      ? {
          id: localUser.id,
          wallet: localUser.wallet,
          xHandle: localXHandle || null,
        }
      : null,
  });
}
