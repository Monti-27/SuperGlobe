import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth-session';
import { getOnboardingPayload, upsertProfileIntents } from '@/lib/services/profile-onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  await upsertProfileIntents(user.id, {
    intents: body.values || [],
    visibility: body.visibility,
  });

  return NextResponse.json(await getOnboardingPayload(user.id));
}
