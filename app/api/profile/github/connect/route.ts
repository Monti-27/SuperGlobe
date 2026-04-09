import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth-session';
import { connectGithubProfile, getOnboardingPayload } from '@/lib/services/profile-onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const username = String(body.username || '').trim();

    if (!username) {
      return NextResponse.json({ error: 'GitHub username is required.' }, { status: 400 });
    }

    await connectGithubProfile(user.id, username);

    return NextResponse.json(await getOnboardingPayload(user.id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'GitHub connect failed.' },
      { status: 400 }
    );
  }
}
