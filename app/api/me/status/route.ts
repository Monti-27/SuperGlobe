import { NextResponse } from 'next/server';
import { getCurrentUserStatusContext } from '@/lib/auth-session';
import { computeProfileStatus } from '@/lib/services/profile-onboarding';
import { findRosterClaimByWallet } from '@/lib/services/member-roster';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUserStatusContext();
  const status = computeProfileStatus(user);
  const claim = user?.wallet ? await findRosterClaimByWallet(user.wallet) : null;

  return NextResponse.json({
    status,
    claim,
    user: user
      ? {
          id: user.id,
          email: user.email,
          wallet: user.wallet,
          profile: user.profile
            ? {
                displayName: user.profile.displayName,
                country: user.profile.country,
                city: user.profile.city,
                visibility: user.profile.visibility,
                isPublished: user.profile.isPublished,
              }
            : null,
          onboarding: user.onboardingState
            ? {
                currentStep: user.onboardingState.currentStep,
                skippedAt: user.onboardingState.skippedAt,
                completedAt: user.onboardingState.completedAt,
              }
            : null,
        }
      : null,
  });
}
