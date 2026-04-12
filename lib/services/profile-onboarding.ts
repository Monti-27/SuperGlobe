import 'server-only';

import {
  AuthIdentityProvider,
  IntentType,
  OnboardingStep,
  Prisma,
  ProfileVisibility,
  SkillStatus,
  SocialLinkType,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { normalizeSocialUrl } from '@/lib/social-links';
import { findRosterClaimByWallet } from '@/lib/services/member-roster';
import {
  CURATED_SKILL_TAGS,
  ONBOARDING_STEPS,
  type OnboardingPayload,
  type OnboardingStep as ClientOnboardingStep,
  type ProfileStatus,
} from '@/lib/onboarding';
import { fetchGitHubSnapshot } from '@/lib/services/github-profile';

function sanitizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeWallet(wallet: string) {
  return wallet.trim();
}

function getNextStep(step: ClientOnboardingStep) {
  const index = ONBOARDING_STEPS.indexOf(step);
  return ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)];
}

function getPreviousStep(step: ClientOnboardingStep) {
  const index = ONBOARDING_STEPS.indexOf(step);
  return ONBOARDING_STEPS[Math.max(index - 1, 0)];
}

async function getProfileId(userId: string) {
  const profile = await prisma.builderProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });

  return profile.id;
}

async function hydrateProfileFromRoster(userId: string, wallet: string) {
  const claim = await findRosterClaimByWallet(wallet).catch(() => null);
  if (!claim) {
    return;
  }

  const profile = await prisma.builderProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      displayName: true,
      country: true,
    },
  });

  if (!profile) {
    return;
  }

  await prisma.builderProfile.update({
    where: { userId },
    data: {
      displayName: profile.displayName || claim.title,
      country: profile.country || claim.country,
    },
  });

}

export async function linkTwitterHandleToUser(userId: string, handle: string) {
  const normalizedHandle = handle.trim().replace(/^@/, '');
  if (!normalizedHandle) {
    return;
  }

  const profileId = await getProfileId(userId);

  await prisma.socialLink.upsert({
    where: {
      profileId_type: {
        profileId,
        type: SocialLinkType.X,
      },
    },
    update: {
      url: normalizeSocialUrl('x', normalizedHandle),
    },
    create: {
      profileId,
      type: SocialLinkType.X,
      url: normalizeSocialUrl('x', normalizedHandle),
    },
  });
}

export async function ensureSkillCatalog() {
  await Promise.all(
    CURATED_SKILL_TAGS.map((tag) =>
      prisma.skillTag.upsert({
        where: { slug: tag.slug },
        update: {
          label: tag.label,
          category: tag.category,
          isCurated: true,
          isActive: true,
        },
        create: {
          slug: tag.slug,
          label: tag.label,
          category: tag.category,
          isCurated: true,
          isActive: true,
        },
      })
    )
  );
}

export async function ensureUserScaffold(userId: string) {
  await Promise.all([
    prisma.builderProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    prisma.onboardingState.upsert({
      where: { userId },
      update: {
        lastVisitedAt: new Date(),
      },
      create: {
        userId,
        currentStep: OnboardingStep.WELCOME,
      },
    }),
  ]);
}

export async function findOrCreateUserFromAuthInput(input: { email?: string; wallet: string }) {
  const email = input.email ? sanitizeEmail(input.email) : '';
  const wallet = sanitizeWallet(input.wallet);

  const [byEmail, byWallet] = await Promise.all([
    email ? prisma.user.findUnique({ where: { email } }) : Promise.resolve(null),
    prisma.user.findUnique({ where: { wallet } }),
  ]);

  if (email && byEmail && byEmail.id !== byWallet?.id) {
    throw new Error('This email and wallet are already connected to different accounts.');
  }

  if (email && byWallet?.email && byWallet.email !== email) {
    throw new Error('This wallet is already connected to a different email.');
  }

  const existingUser = byWallet || byEmail;
  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(email ? { email } : {}),
          wallet,
        },
      })
    : await prisma.user.create({
        data: {
          ...(email ? { email } : {}),
          wallet,
        },
      });

  const identityWrites: Array<Promise<unknown>> = [
    prisma.authIdentity.upsert({
      where: {
        provider_providerAccountId: {
          provider: AuthIdentityProvider.WALLET,
          providerAccountId: wallet,
        },
      },
      update: {
        userId: user.id,
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: AuthIdentityProvider.WALLET,
        providerAccountId: wallet,
        verifiedAt: new Date(),
      },
    }),
  ];

  if (email) {
    identityWrites.push(
      prisma.authIdentity.upsert({
        where: {
          provider_providerAccountId: {
            provider: AuthIdentityProvider.EMAIL,
            providerAccountId: email,
          },
        },
        update: {
          userId: user.id,
          verifiedAt: new Date(),
        },
        create: {
          userId: user.id,
          provider: AuthIdentityProvider.EMAIL,
          providerAccountId: email,
          verifiedAt: new Date(),
        },
      })
    );
  }

  await Promise.all(identityWrites);

  await ensureUserScaffold(user.id);
  await hydrateProfileFromRoster(user.id, wallet);

  return user;
}

export async function updateUserEmail(userId: string, emailInput: string) {
  const email = sanitizeEmail(emailInput);
  if (!email) {
    throw new Error('Email is required.');
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing && existing.id !== userId) {
    throw new Error('This email is already connected to another account.');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email },
  });

  await prisma.authIdentity.upsert({
    where: {
      provider_providerAccountId: {
        provider: AuthIdentityProvider.EMAIL,
        providerAccountId: email,
      },
    },
    update: {
      userId,
      verifiedAt: new Date(),
    },
    create: {
      userId,
      provider: AuthIdentityProvider.EMAIL,
      providerAccountId: email,
      verifiedAt: new Date(),
    },
  });
}

export function computeProfileStatus(user: {
  profile: { visibility: ProfileVisibility; isPublished: boolean } | null;
  onboardingState: { completedAt: Date | null } | null;
} | null): ProfileStatus {
  if (!user) {
    return 'unauthenticated';
  }

  if (!user.onboardingState?.completedAt) {
    return 'authenticated_incomplete';
  }

  if (user.profile?.isPublished && user.profile.visibility === ProfileVisibility.PUBLIC) {
    return 'authenticated_completed_public';
  }

  return 'authenticated_completed_private';
}

export async function computeProfileStatusForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      onboardingState: true,
    },
  });

  return computeProfileStatus(user);
}

export async function getOnboardingPayload(userId: string): Promise<OnboardingPayload> {
  await ensureSkillCatalog();
  await ensureUserScaffold(userId);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: {
        include: {
          socialLinks: true,
          skills: {
            include: {
              skillTag: true,
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
          intents: {
            where: { isActive: true },
          },
        },
      },
      onboardingState: true,
      githubSnapshot: true,
    },
  });

  const catalog = await prisma.skillTag.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { label: 'asc' }],
  });

  const socialLookup = new Map(user.profile?.socialLinks.map((item) => [item.type, item]) || []);
  const currentStep = user.onboardingState?.currentStep === OnboardingStep.COMPLETED
    ? 'REVIEW'
    : ((user.onboardingState?.currentStep || OnboardingStep.WELCOME) as ClientOnboardingStep);

  return {
    currentStep,
    completedAt: user.onboardingState?.completedAt?.toISOString() || null,
    skippedAt: user.onboardingState?.skippedAt?.toISOString() || null,
    auth: {
      email: user.email || '',
      wallet: user.wallet || '',
    },
    profile: {
      displayName: user.profile?.displayName || '',
      bio: user.profile?.bio || '',
      avatarUrl: user.profile?.avatarUrl || '',
      country: user.profile?.country || '',
      city: user.profile?.city || '',
      visibility: (user.profile?.visibility || ProfileVisibility.PRIVATE) as 'PUBLIC' | 'PRIVATE',
      isPublished: user.profile?.isPublished || false,
    },
    socials: {
      x: socialLookup.get(SocialLinkType.X)?.url || '',
      linkedin: socialLookup.get(SocialLinkType.LINKEDIN)?.url || '',
      github: socialLookup.get(SocialLinkType.GITHUB)?.url || '',
      website: socialLookup.get(SocialLinkType.WEBSITE)?.url || '',
    },
    github: user.githubSnapshot
      ? {
          username: user.githubSnapshot.username,
          avatarUrl: user.githubSnapshot.avatarUrl || '',
          profileUrl: user.githubSnapshot.profileUrl || '',
          heatmapUrl: user.githubSnapshot.heatmapUrl || '',
          contributions: ((user.githubSnapshot.raw as Record<string, unknown> | null)?.contributions as
            | Record<string, unknown>
            | null)
            ? {
                totalLastYear: Number(
                  ((user.githubSnapshot.raw as Record<string, unknown>).contributions as Record<string, unknown>)
                    .totalLastYear || 0
                ),
                totalCurrentYear: Number(
                  ((user.githubSnapshot.raw as Record<string, unknown>).contributions as Record<string, unknown>)
                    .totalCurrentYear || 0
                ),
                maxDailyCount: Number(
                  ((user.githubSnapshot.raw as Record<string, unknown>).contributions as Record<string, unknown>)
                    .maxDailyCount || 0
                ),
                days: ((((user.githubSnapshot.raw as Record<string, unknown>).contributions as Record<string, unknown>)
                  .days as Array<Record<string, unknown>> | null) || []).map((day) => ({
                  date: String(day.date || ''),
                  count: Number(day.count || 0),
                  level: Number(day.level || 0),
                })),
              }
            : null,
          topRepos: ((user.githubSnapshot.topRepos as Array<Record<string, unknown>> | null) || []).map((repo) => ({
            name: String(repo.name || ''),
            url: String(repo.url || ''),
            description: String(repo.description || ''),
            stars: Number(repo.stars || 0),
            language: String(repo.language || ''),
          })),
        }
      : null,
    skills: {
      selected: user.profile?.skills
        .filter((item) => item.skillTag?.slug)
        .map((item) => item.skillTag!.slug) || [],
      custom: user.profile?.skills
        .filter((item) => item.customLabel)
        .map((item) => item.customLabel!) || [],
      catalog: catalog.map((item) => ({
        slug: item.slug,
        label: item.label,
        category: item.category,
      })),
    },
    intents: user.profile?.intents.map((item) => item.intent) || [],
  };
}

export async function upsertProfileIdentity(
  userId: string,
  input: {
    displayName?: string;
    bio?: string;
    country?: string;
    city?: string;
    avatarUrl?: string;
  }
) {
  await prisma.builderProfile.upsert({
    where: { userId },
    update: {
      displayName: input.displayName?.trim() || '',
      bio: input.bio?.trim() || '',
      country: input.country?.trim() || '',
      city: input.city?.trim() || '',
      avatarUrl: input.avatarUrl?.trim() || '',
    },
    create: {
      userId,
      displayName: input.displayName?.trim() || '',
      bio: input.bio?.trim() || '',
      country: input.country?.trim() || '',
      city: input.city?.trim() || '',
      avatarUrl: input.avatarUrl?.trim() || '',
    },
  });
}

export async function upsertProfileSocials(
  userId: string,
  input: {
    x?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  }
) {
  const profileId = await getProfileId(userId);
  const items: Array<{ type: SocialLinkType; url: string }> = [
    { type: SocialLinkType.X, url: normalizeSocialUrl('x', input.x || '') },
    { type: SocialLinkType.LINKEDIN, url: normalizeSocialUrl('linkedin', input.linkedin || '') },
    { type: SocialLinkType.GITHUB, url: normalizeSocialUrl('github', input.github || '') },
    { type: SocialLinkType.WEBSITE, url: normalizeSocialUrl('website', input.website || '') },
  ];

  await Promise.all(
    items.map(async (item) => {
      if (!item.url) {
        await prisma.socialLink.deleteMany({
          where: {
            profileId,
            type: item.type,
          },
        });
        return;
      }

      await prisma.socialLink.upsert({
        where: {
          profileId_type: {
            profileId,
            type: item.type,
          },
        },
        update: {
          url: item.url,
        },
        create: {
          profileId,
          type: item.type,
          url: item.url,
        },
      });
    })
  );

  const githubUrl = items.find((item) => item.type === SocialLinkType.GITHUB)?.url;
  if (githubUrl) {
    try {
      const username = githubUrl.replace(/^https?:\/\/github\.com\//i, '').split('/')[0].split('?')[0];
      if (username) {
        await connectGithubProfile(userId, username).catch((error) => {
          console.warn('Failed to auto-connect GitHub profile during onboarding', error);
        });
      }
    } catch (e) {
      console.warn('Error extracting GitHub username for auto-connect', e);
    }
  }
}

export async function upsertProfileSkills(
  userId: string,
  input: {
    skillSlugs?: string[];
    customSkills?: string[];
  }
) {
  await ensureSkillCatalog();
  const profileId = await getProfileId(userId);
  const selectedSkillSlugs = Array.from(new Set((input.skillSlugs || []).map((item) => item.trim()).filter(Boolean)));
  const customSkills = Array.from(new Set((input.customSkills || []).map((item) => item.trim()).filter(Boolean)));
  const tags = await prisma.skillTag.findMany({
    where: {
      slug: {
        in: selectedSkillSlugs,
      },
    },
  });

  await prisma.profileSkill.deleteMany({
    where: { profileId },
  });

  await prisma.profileSkill.createMany({
    data: [
      ...tags.map((tag, index) => ({
        profileId,
        skillTagId: tag.id,
        customLabel: null,
        status: SkillStatus.APPROVED,
        sortOrder: index,
      })),
      ...customSkills.map((skill, index) => ({
        profileId,
        skillTagId: null,
        customLabel: skill,
        status: SkillStatus.PENDING,
        sortOrder: tags.length + index,
      })),
    ],
  });
}

export async function upsertProfileIntents(
  userId: string,
  input: {
    intents?: string[];
    visibility?: 'PUBLIC' | 'PRIVATE';
  }
) {
  const profileId = await getProfileId(userId);
  const intents = Array.from(new Set((input.intents || []).filter(Boolean))) as IntentType[];

  await prisma.profileIntent.deleteMany({
    where: { profileId },
  });

  if (intents.length > 0) {
    await prisma.profileIntent.createMany({
      data: intents.map((intent) => ({
        profileId,
        intent,
        isActive: true,
      })),
    });
  }

  if (input.visibility) {
    await prisma.builderProfile.update({
      where: { userId },
      data: {
        visibility: input.visibility,
      },
    });
  }
}

export async function setOnboardingState(
  userId: string,
  input: {
    step?: ClientOnboardingStep;
    direction?: 'next' | 'back' | 'stay';
    skip?: boolean;
    draft?: Record<string, unknown>;
  }
) {
  const current = await prisma.onboardingState.findUnique({
    where: { userId },
  });

  const currentStep = (current?.currentStep || OnboardingStep.WELCOME) as ClientOnboardingStep;
  const nextStep = input.step
    ? input.step
    : input.direction === 'back'
      ? getPreviousStep(currentStep)
      : input.direction === 'next'
        ? getNextStep(currentStep)
        : currentStep;

  const draftValue = (input.draft ?? current?.draft ?? undefined) as Prisma.InputJsonValue | undefined;

  await prisma.onboardingState.upsert({
    where: { userId },
    update: {
      currentStep: nextStep as OnboardingStep,
      skippedAt: input.skip ? new Date() : current?.skippedAt || null,
      lastVisitedAt: new Date(),
      draft: draftValue,
    },
    create: {
      userId,
      currentStep: nextStep as OnboardingStep,
      skippedAt: input.skip ? new Date() : null,
      lastVisitedAt: new Date(),
      draft: (input.draft ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function connectGithubProfile(userId: string, username: string) {
  const snapshot = await fetchGitHubSnapshot(username);
  const profileId = await getProfileId(userId);
  const topReposValue = snapshot.topRepos as unknown as Prisma.InputJsonValue;
  const pinnedReposValue = snapshot.pinnedRepos as unknown as Prisma.InputJsonValue;
  const rawValue = snapshot.raw as unknown as Prisma.InputJsonValue;

  await prisma.gitHubConnection.upsert({
    where: { userId },
    update: {
      username: snapshot.username,
      avatarUrl: snapshot.avatarUrl,
      profileUrl: snapshot.profileUrl,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      username: snapshot.username,
      avatarUrl: snapshot.avatarUrl,
      profileUrl: snapshot.profileUrl,
      lastSyncedAt: new Date(),
    },
  });

  await prisma.gitHubSnapshot.upsert({
    where: { userId },
    update: {
      username: snapshot.username,
      avatarUrl: snapshot.avatarUrl,
      profileUrl: snapshot.profileUrl,
      heatmapUrl: snapshot.heatmapUrl,
      topRepos: topReposValue,
      pinnedRepos: pinnedReposValue,
      raw: rawValue,
      lastFetchedAt: new Date(),
    },
    create: {
      userId,
      username: snapshot.username,
      avatarUrl: snapshot.avatarUrl,
      profileUrl: snapshot.profileUrl,
      heatmapUrl: snapshot.heatmapUrl,
      topRepos: topReposValue,
      pinnedRepos: pinnedReposValue,
      raw: rawValue,
      lastFetchedAt: new Date(),
    },
  });

  await prisma.socialLink.upsert({
    where: {
      profileId_type: {
        profileId,
        type: SocialLinkType.GITHUB,
      },
    },
    update: {
      url: snapshot.profileUrl,
    },
    create: {
      profileId,
      type: SocialLinkType.GITHUB,
      url: snapshot.profileUrl,
    },
  });

  await prisma.profileProject.deleteMany({
    where: {
      profileId,
      source: 'GITHUB',
    },
  });

  if (snapshot.pinnedRepos.length > 0) {
    await prisma.profileProject.createMany({
      data: snapshot.pinnedRepos.map((repo, index) => ({
        profileId,
        title: repo.name,
        description: repo.description,
        url: repo.url,
        source: 'GITHUB',
        repoName: repo.name,
        language: repo.language,
        stars: repo.stars,
        isFeatured: true,
        sortOrder: index,
      })),
    });
  }

  await prisma.builderProfile.update({
    where: { userId },
    data: {
      avatarUrl: snapshot.avatarUrl || undefined,
    },
  });

  return snapshot;
}

export async function publishProfile(userId: string) {
  const payload = await getOnboardingPayload(userId);
  const errors: string[] = [];

  if (!payload.auth.email) errors.push('Email is required.');
  if (!payload.auth.wallet) errors.push('Wallet is required.');
  if (!payload.profile.displayName) errors.push('Display name is required.');
  if (!payload.profile.bio) errors.push('Bio is required.');
  if (!payload.profile.country) errors.push('Country is required.');
  if (!payload.profile.city) errors.push('City is required.');
  if (payload.skills.selected.length === 0) errors.push('Select at least one skill.');
  if (payload.intents.length === 0) errors.push('Select at least one intent.');

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  await Promise.all([
    prisma.builderProfile.update({
      where: { userId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.onboardingState.update({
      where: { userId },
      data: {
        currentStep: OnboardingStep.COMPLETED,
        completedAt: new Date(),
        skippedAt: null,
        lastVisitedAt: new Date(),
      },
    }),
  ]);

  return getOnboardingPayload(userId);
}
