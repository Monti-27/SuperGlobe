import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/auth-session';
import {
  getOnboardingPayload,
  setOnboardingState,
  updateUserEmail,
  upsertProfileIdentity,
  upsertProfileIntents,
  upsertProfileSkills,
  upsertProfileSocials,
} from '@/lib/services/profile-onboarding';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getOnboardingPayload(user.id);
  return NextResponse.json(payload);
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.auth?.email) {
    await updateUserEmail(user.id, body.auth.email);
  }

  if (body.identity) {
    await upsertProfileIdentity(user.id, body.identity);
  }

  if (body.socials) {
    await upsertProfileSocials(user.id, body.socials);
  }

  if (body.skills) {
    await upsertProfileSkills(user.id, {
      skillSlugs: body.skills.selected,
      customSkills: body.skills.custom,
    });
  }

  if (body.intents) {
    await upsertProfileIntents(user.id, {
      intents: body.intents.values,
      visibility: body.intents.visibility,
    });
  }

  await setOnboardingState(user.id, {
    step: body.step,
    direction: body.direction,
    skip: body.skip,
    draft: body.draft,
  });

  const payload = await getOnboardingPayload(user.id);
  return NextResponse.json(payload);
}
