import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth-session';
import { computeProfileStatus, publishProfile } from '@/lib/services/profile-onboarding';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await publishProfile(user.id);
    revalidatePath('/');
    revalidatePath('/globe');

    return NextResponse.json({
      ok: true,
      status: computeProfileStatus({
        profile: {
          visibility: payload.profile.visibility,
          isPublished: payload.profile.isPublished,
        },
        onboardingState: {
          completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
        },
      }),
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to publish profile.' },
      { status: 400 }
    );
  }
}
