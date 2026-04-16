'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Sparkles, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowButton } from '@/components/ui/flow-button';
import { ShaderAnimation } from '@/components/ui/shader-lines';
import { TextMarquee } from '@/components/ui/text-marquee';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  INTENT_OPTIONS,
  ONBOARDING_STEP_META,
  ONBOARDING_STEPS,
  type OnboardingPayload,
  type OnboardingStep,
  type ProfileStatus,
  type SkillCatalogItem,
} from '@/lib/onboarding';
import { socialInputValue } from '@/lib/social-links';
import { cn, formatIntentLabel } from '@/lib/utils';
import { createWalletAuthMessage } from '@/lib/wallet-auth-message';

interface BuilderOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished?: (payload: { reason: 'published' | 'skip'; status: ProfileStatus; wallet?: string }) => void;
  claimWallet?: string;
  claimProfile?: {
    title: string;
    wallet: string;
    country: string;
    xHandle: string | null;
  };
}

interface OnboardingDraft {
  auth: {
    email: string;
    wallet: string;
  };
  profile: {
    displayName: string;
    bio: string;
    avatarUrl: string;
    country: string;
    city: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    isPublished: boolean;
  };
  socials: {
    x: string;
    linkedin: string;
    github: string;
    website: string;
  };
  github: OnboardingPayload['github'];
  githubUsername: string;
  skills: {
    selected: string[];
    custom: string[];
    catalog: SkillCatalogItem[];
  };
  intents: string[];
  signature?: string;
  message?: string;
}

interface SolanaWalletProvider {
  isPhantom?: boolean;
  connect: () => Promise<{
    publicKey: {
      toString: () => string;
    };
  }>;
  signMessage: (message: Uint8Array, encoding: 'utf8') => Promise<{
    signature: Uint8Array;
  }>;
}

declare global {
  interface Window {
    solana?: SolanaWalletProvider;
  }
}

const EMPTY_DRAFT: OnboardingDraft = {
  auth: {
    email: '',
    wallet: '',
  },
  profile: {
    displayName: '',
    bio: '',
    avatarUrl: '',
    country: '',
    city: '',
    visibility: 'PRIVATE',
    isPublished: false,
  },
  socials: {
    x: '',
    linkedin: '',
    github: '',
    website: '',
  },
  github: null,
  githubUsername: '',
  skills: {
    selected: [],
    custom: [],
    catalog: [],
  },
  intents: [],
};

function githubUsernameFromValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '');
}

function draftFromPayload(payload: OnboardingPayload): OnboardingDraft {
  return {
    auth: payload.auth,
    profile: payload.profile,
    socials: {
      x: socialInputValue('x', payload.socials.x),
      linkedin: socialInputValue('linkedin', payload.socials.linkedin),
      github: socialInputValue('github', payload.socials.github),
      website: socialInputValue('website', payload.socials.website),
    },
    github: payload.github,
    githubUsername: payload.github?.username || githubUsernameFromValue(payload.socials.github),
    skills: payload.skills,
    intents: payload.intents,
  };
}

function draftFromClaimProfile(previous: OnboardingDraft, claimProfile?: BuilderOnboardingDialogProps['claimProfile']): OnboardingDraft {
  if (!claimProfile) {
    return {
      ...EMPTY_DRAFT,
      auth: previous.auth,
    };
  }

  return {
    ...EMPTY_DRAFT,
    auth: {
      email: previous.auth.email,
      wallet: '',
    },
    profile: {
      ...EMPTY_DRAFT.profile,
      displayName: claimProfile.title,
      country: claimProfile.country,
    },
    socials: EMPTY_DRAFT.socials,
  };
}

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error === 'string' ? data.error : 'Request failed.');
  }

  return data as T;
}

export function BuilderOnboardingDialog({
  open,
  onOpenChange,
  onFinished,
  claimWallet,
  claimProfile
}: BuilderOnboardingDialogProps) {
  const [status, setStatus] = useState<ProfileStatus>('unauthenticated');
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('WELCOME');
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const shouldBlockScroll = (deltaY: number) => {
      const canScroll = el.scrollHeight > el.clientHeight + 1;

      if (!canScroll) {
        return true;
      }

      const isAtTop = el.scrollTop <= 0;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

      return (isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0);
    };

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();

      if (shouldBlockScroll(e.deltaY)) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY ?? 0;
      const deltaY = touchStartYRef.current - currentY;
      e.stopPropagation();

      if (shouldBlockScroll(deltaY)) {
        e.preventDefault();
      }
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open, currentStep]);

  const isAuthenticated = status !== 'unauthenticated';
  const stepOrder = useMemo(
    () => (isAuthenticated ? ONBOARDING_STEPS.filter((step) => step !== 'AUTH') : ONBOARDING_STEPS),
    [isAuthenticated]
  );

  const currentStepIndex = Math.max(0, stepOrder.findIndex((step) => step === currentStep));

  const applyPayload = useCallback((payload: OnboardingPayload) => {
    setDraft(draftFromPayload(payload));
    setCurrentStep(payload.currentStep === 'AUTH' ? 'IDENTITY' : payload.currentStep);
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const statusPayload = await readJson<{
        status: ProfileStatus;
        user: { wallet?: string | null } | null;
      }>('/api/me/status');

      if (claimWallet && statusPayload.user?.wallet && statusPayload.user.wallet !== claimWallet) {
        await fetch('/api/auth/session', { method: 'DELETE' });
        setStatus('unauthenticated');
        setCurrentStep('WELCOME');
        setDraft((previous) => draftFromClaimProfile(previous, claimProfile));
        return;
      }

      setStatus(statusPayload.status);

      if (statusPayload.status === 'unauthenticated') {
        setCurrentStep('WELCOME');
        setDraft((previous) => draftFromClaimProfile(previous, claimProfile));
        return;
      }

      const payload = await readJson<OnboardingPayload>('/api/onboarding');
      applyPayload(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load onboarding.');
    } finally {
      setLoading(false);
    }
  }, [applyPayload, claimProfile, claimWallet]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void hydrate();
  }, [open, hydrate]);

  const moveToStep = useCallback(
    (nextStep: OnboardingStep) => {
      const nextIndex = stepOrder.findIndex((step) => step === nextStep);
      if (nextIndex < 0) {
        return;
      }
      setDirection(nextIndex >= currentStepIndex ? 1 : -1);
      setCurrentStep(nextStep);
    },
    [currentStepIndex, stepOrder]
  );

  const syncStep = useCallback(
    async (body: Record<string, unknown>) => {
      const payload = await readJson<OnboardingPayload>('/api/onboarding', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      applyPayload(payload);
      return payload;
    },
    [applyPayload]
  );

  const refreshStatus = useCallback(async () => {
    const payload = await readJson<{ status: ProfileStatus }>('/api/me/status');
    setStatus(payload.status);
    return payload.status;
  }, []);

  const validateStep = useCallback(() => {
    if (currentStep === 'AUTH') {
      if (!draft.auth.email.trim()) {
        return 'Email is required.';
      }

      if (!draft.auth.wallet.trim() || !draft.signature) {
        return 'Wallet connection and signature are required to prove ownership.';
      }
    }

    if (currentStep === 'IDENTITY') {
      if (!draft.auth.email.trim()) {
        return 'Email is required.';
      }

      if (!draft.profile.displayName.trim()) {
        return 'Display name is required.';
      }

      if (!draft.profile.bio.trim()) {
        return 'Bio is required.';
      }

      if (!draft.profile.country.trim()) {
        return 'Country is required.';
      }

      if (!draft.profile.city.trim()) {
        return 'City is required.';
      }
    }

    if (currentStep === 'SKILLS') {
      if (draft.skills.selected.length === 0 && draft.skills.custom.length === 0) {
        return 'Add at least one skill.';
      }
    }

    if (currentStep === 'INTENT') {
      if (draft.intents.length === 0) {
        return 'Select at least one intent.';
      }
    }

    return '';
  }, [currentStep, draft]);

  const handleBack = useCallback(async () => {
    setError('');

    if (currentStepIndex === 0) {
      return;
    }

    const previousStep = stepOrder[currentStepIndex - 1];
    if (!previousStep) {
      return;
    }

    setSaving(true);

    try {
      if (isAuthenticated) {
        await syncStep({ step: previousStep });
      } else {
        moveToStep(previousStep);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to move back.');
    } finally {
      setSaving(false);
    }
  }, [currentStepIndex, isAuthenticated, moveToStep, stepOrder, syncStep]);

  const handleSkip = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      let nextStatus = status;

      if (isAuthenticated) {
        await syncStep({ step: currentStep, skip: true });
        nextStatus = await refreshStatus();
      }

      onOpenChange(false);
      onFinished?.({ reason: 'skip', status: nextStatus });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to skip for now.');
    } finally {
      setSaving(false);
    }
  }, [currentStep, isAuthenticated, onFinished, onOpenChange, refreshStatus, status, syncStep]);

  const handleNext = useCallback(async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (currentStep === 'WELCOME') {
        if (isAuthenticated) {
          await syncStep({ step: 'IDENTITY' });
        } else {
          moveToStep('AUTH');
        }
        return;
      }

      if (currentStep === 'AUTH') {
        const authPayload = await readJson<{ status: ProfileStatus }>('/api/auth/session', {
          method: 'POST',
          body: JSON.stringify({
            ...draft.auth,
            signature: draft.signature,
            message: draft.message
          }),
        });

        setStatus(authPayload.status);
        await syncStep({ step: 'IDENTITY' });
        return;
      }

      if (currentStep === 'IDENTITY') {
        await syncStep({
          step: 'SOCIALS',
          auth: {
            email: draft.auth.email,
          },
          identity: draft.profile,
        });
        return;
      }

      if (currentStep === 'SOCIALS') {
        await syncStep({
          step: 'SKILLS',
          socials: draft.socials,
        });
        return;
      }

      if (currentStep === 'SKILLS') {
        await syncStep({
          step: 'INTENT',
          skills: {
            selected: draft.skills.selected,
            custom: draft.skills.custom,
          },
        });
        return;
      }

      if (currentStep === 'INTENT') {
        await syncStep({
          step: 'REVIEW',
          intents: {
            values: draft.intents,
            visibility: draft.profile.visibility,
          },
        });
        return;
      }

      if (currentStep === 'REVIEW') {
        await readJson<{ status: ProfileStatus }>('/api/profile/publish', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const nextStatus = await refreshStatus();
        onOpenChange(false);
        onFinished?.({ reason: 'published', status: nextStatus, wallet: draft.auth.wallet });
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to continue onboarding.');
    } finally {
      setSaving(false);
    }
  }, [
    currentStep,
    draft,
    isAuthenticated,
    moveToStep,
    onFinished,
    onOpenChange,
    refreshStatus,
    syncStep,
    validateStep,
  ]);

  const toggleSkill = useCallback((slug: string) => {
    setDraft((previous) => ({
      ...previous,
      skills: {
        ...previous.skills,
        selected: previous.skills.selected.includes(slug)
          ? previous.skills.selected.filter((item) => item !== slug)
          : [...previous.skills.selected, slug],
      },
    }));
  }, []);

  const toggleIntent = useCallback((value: string) => {
    setDraft((previous) => ({
      ...previous,
      intents: previous.intents.includes(value)
        ? previous.intents.filter((item) => item !== value)
        : [...previous.intents, value],
    }));
  }, []);

  const addCustomSkill = useCallback(() => {
    const normalized = customSkillInput.trim();
    if (!normalized) {
      return;
    }

    setDraft((previous) => {
      if (previous.skills.custom.includes(normalized)) {
        return previous;
      }

      return {
        ...previous,
        skills: {
          ...previous.skills,
          custom: [...previous.skills.custom, normalized],
        },
      };
    });
    setCustomSkillInput('');
  }, [customSkillInput]);

  const removeCustomSkill = useCallback((value: string) => {
    setDraft((previous) => ({
      ...previous,
      skills: {
        ...previous.skills,
        custom: previous.skills.custom.filter((item) => item !== value),
      },
    }));
  }, []);

  const skillGroups = useMemo(() => {
    return draft.skills.catalog.reduce<Record<string, SkillCatalogItem[]>>((groups, item) => {
      const key = item.category || 'Other';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }, [draft.skills.catalog]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] border-none bg-transparent p-0 shadow-none sm:max-w-[34rem]"
      >
        <div className="flex max-h-[calc(100dvh-1rem)] min-h-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <DialogHeader className="space-y-1.5 text-left">
                    <DialogTitle className="text-[1.5rem] font-semibold tracking-tight text-zinc-100">
                      {ONBOARDING_STEP_META[currentStep].label}
                    </DialogTitle>
                    <DialogDescription className="max-w-[26rem] text-sm leading-relaxed text-zinc-400">
                      {ONBOARDING_STEP_META[currentStep].description}
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {stepOrder.map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      'h-1 rounded-full transition-all',
                      index === currentStepIndex
                        ? 'w-8 bg-zinc-100'
                        : index < currentStepIndex
                          ? 'w-5 bg-zinc-500'
                          : 'w-5 bg-zinc-800'
                    )}
                  />
                ))}
              </div>


            </div>

            <div className="min-h-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
                <motion.div 
                  ref={scrollContainerRef}
                  className="relative h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                >
                  <div className="pb-1 w-full relative">
                    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                      <motion.div
                        key={currentStep}
                        custom={direction}
                        initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)", x: direction > 0 ? 12 : -12 }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                        exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)", x: direction > 0 ? -12 : 12, position: "absolute", left: 0, right: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-4 w-full"
                      >
                      {currentStep === 'WELCOME' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative flex h-56 sm:h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-black shadow-inner"
                        >
                          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_80%)] opacity-90 mix-blend-screen">
                            <ShaderAnimation />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40 z-0"></div>
                          <div className="pointer-events-none z-10 flex flex-col items-center text-center text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] px-6 leading-tight">
                            <span>Enter the Globe.</span>
                            <TextMarquee
                              prefix={<span className="mr-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Find your next</span>}
                              height={50}
                              speed={1.5}
                              className="text-lg sm:text-xl text-zinc-300 font-medium tracking-normal mt-2"
                            >
                              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">gig.</span>
                              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">cofounder.</span>
                              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">opportunity.</span>
                              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">bounty.</span>
                              <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">team.</span>
                            </TextMarquee>
                          </div>
                        </motion.div>
                      ) : null}

                      {currentStep === 'AUTH' ? (
                        <div className="space-y-4">
                          <FieldShell label="Email">
                            <Input
                              value={draft.auth.email}
                              onChange={(event) =>
                                setDraft((previous) => ({
                                  ...previous,
                                  auth: { ...previous.auth, email: event.target.value },
                                }))
                              }
                              placeholder="Enter Your Email"
                            />
                          </FieldShell>
                          <FieldShell label="Wallet Ownership">
                            <div className="flex flex-col gap-3">
                              {claimWallet ? (
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-400">
                                  Claim wallet {claimWallet.slice(0, 6)}...{claimWallet.slice(-6)}
                                </div>
                              ) : null}
                              <Button
                                type="button"
                                variant="outline"
                                className="group relative h-auto w-full justify-start overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-left text-zinc-100 shadow-sm transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-md"
                                onClick={async () => {
                                  try {
                                    const provider = window.solana;
                                    if (!provider?.isPhantom) {
                                      throw new Error('Please install Phantom Wallet extension.');
                                    }
                                    const resp = await provider.connect();
                                    const walletString = resp.publicKey.toString();
                                    
                                    if (claimWallet && walletString !== claimWallet) {
                                      throw new Error(`You must connect with wallet ${claimWallet.slice(0,4)}...${claimWallet.slice(-4)} to claim this profile.`);
                                    }
                                    
                                    const messageText = createWalletAuthMessage(walletString);
                                    const message = new TextEncoder().encode(messageText);
                                    const { signature } = await provider.signMessage(message, 'utf8');
                                    
                                    const bs58 = (await import('bs58')).default;
                                    
                                    setDraft((previous) => ({
                                      ...previous,
                                      auth: { ...previous.auth, wallet: walletString },
                                      signature: bs58.encode(signature),
                                      message: messageText
                                    }));
                                    setError('');
                                  } catch (caught) {
                                    setError(caught instanceof Error ? caught.message : 'Failed to connect wallet');
                                  }
                                }}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/50 bg-black/30 text-zinc-300">
                                  {draft.auth.wallet ? <ShieldCheck className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-zinc-100">
                                    {draft.auth.wallet
                                      ? 'Wallet connected'
                                      : 'Connect wallet linked to your Superteam account'}
                                  </div>
                                  <div className="mt-0.5 truncate text-xs font-normal text-zinc-500">
                                    {draft.auth.wallet
                                      ? `${draft.auth.wallet.slice(0, 6)}...${draft.auth.wallet.slice(-6)}`
                                      : claimWallet
                                        ? `${claimWallet.slice(0, 6)}...${claimWallet.slice(-6)}`
                                        : 'Use the wallet you use for Superteam payouts and membership'}
                                  </div>
                                </div>
                              </Button>
                            </div>
                          </FieldShell>
                          <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm leading-relaxed text-emerald-400">
                            Cryptographic signature required. You must mathematically prove ownership of the wallet to claim a profile.
                          </div>
                        </div>
                      ) : null}

                      {currentStep === 'IDENTITY' ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FieldShell label="Email">
                              <Input
                                value={draft.auth.email}
                                onChange={(event) =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    auth: { ...previous.auth, email: event.target.value },
                                  }))
                                }
                                placeholder="Enter Your Email"
                              />
                            </FieldShell>
                            <FieldShell label="Display name">
                              <Input
                                value={draft.profile.displayName}
                                onChange={(event) =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    profile: { ...previous.profile, displayName: event.target.value },
                                  }))
                                }
                                placeholder="Your public name"
                              />
                            </FieldShell>
                            <FieldShell label="Country">
                              <Input
                                value={draft.profile.country}
                                onChange={(event) =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    profile: { ...previous.profile, country: event.target.value },
                                  }))
                                }
                                placeholder="India"
                              />
                            </FieldShell>
                            <FieldShell label="City">
                              <Input
                                value={draft.profile.city}
                                onChange={(event) =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    profile: { ...previous.profile, city: event.target.value },
                                  }))
                                }
                                placeholder="Delhi"
                              />
                            </FieldShell>
                          </div>

                          <FieldShell label="Bio">
                            <textarea
                              value={draft.profile.bio}
                              onChange={(event) =>
                                setDraft((previous) => ({
                                  ...previous,
                                  profile: { ...previous.profile, bio: event.target.value },
                                }))
                              }
                              placeholder="What do you build, what do you care about, and how should people discover you?"
                              className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
                            />
                          </FieldShell>
                        </div>
                      ) : null}

                      {currentStep === 'SOCIALS' ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FieldShell label="X">
                              <Input
                                value={draft.socials.x}
                                onChange={(event) => {
                                  const val = event.target.value;
                                  if (val.includes('http://') || val.includes('https://') || val.includes('www.') || val.includes('twitter.com/') || val.includes('x.com/')) {
                                    toast.warning('Please enter just your username, not a link.');
                                    return;
                                  }
                                  setDraft((previous) => ({
                                    ...previous,
                                    socials: { ...previous.socials, x: val },
                                  }))
                                }}
                                placeholder="@username"
                              />
                            </FieldShell>
                            <FieldShell label="LinkedIn">
                              <Input
                                value={draft.socials.linkedin}
                                onChange={(event) => {
                                  const val = event.target.value;
                                  if (val.includes('http://') || val.includes('https://') || val.includes('www.') || val.includes('linkedin.com/')) {
                                    toast.warning('Please enter just your username, not a link.');
                                    return;
                                  }
                                  setDraft((previous) => ({
                                    ...previous,
                                    socials: { ...previous.socials, linkedin: val },
                                  }))
                                }}
                                placeholder="username"
                              />
                            </FieldShell>
                            <FieldShell label="GitHub">
                              <Input
                                value={draft.githubUsername || draft.socials.github}
                                onChange={(event) => {
                                  const val = event.target.value;
                                  if (val.includes('http://') || val.includes('https://') || val.includes('www.') || val.includes('github.com/')) {
                                    toast.warning('Please enter just your username, not a link.');
                                    return;
                                  }
                                  setDraft((previous) => ({
                                    ...previous,
                                    githubUsername: val,
                                    socials: { ...previous.socials, github: val },
                                  }))
                                }}
                                placeholder="octocat"
                              />
                            </FieldShell>
                            <FieldShell label="Website">
                              <Input
                                value={draft.socials.website}
                                onChange={(event) =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    socials: { ...previous.socials, website: event.target.value },
                                  }))
                                }
                                placeholder="builder.xyz"
                              />
                            </FieldShell>
                          </div>


                        </div>
                      ) : null}

                      {currentStep === 'SKILLS' ? (
                        <div className="space-y-6">
                          <div className="flex flex-wrap gap-2 px-1">
                            {draft.skills.catalog.map((item) => (
                              <ChoiceChip
                                key={item.slug}
                                active={draft.skills.selected.includes(item.slug)}
                                onClick={() => toggleSkill(item.slug)}
                              >
                                {item.label}
                              </ChoiceChip>
                            ))}
                          </div>

                          <div className="border-t border-zinc-800/50 pt-5 px-1">
                            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Custom Tag</div>
                            <div className="flex gap-2 max-w-sm">
                              <Input
                                value={customSkillInput}
                                onChange={(event) => setCustomSkillInput(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addCustomSkill();
                                  }
                                }}
                                placeholder="e.g. Move, DevRel"
                                className="h-9 bg-zinc-900/40 border-zinc-800 focus-visible:ring-zinc-700"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                className="h-9 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                onClick={addCustomSkill}
                              >
                                Add
                              </Button>
                            </div>

                            {draft.skills.custom.length > 0 ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {draft.skills.custom.map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => removeCustomSkill(item)}
                                    className="group flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-300 hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                                  >
                                    {item}
                                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {currentStep === 'INTENT' ? (
                        <div className="space-y-8 px-1">
                          <div className="flex flex-wrap gap-2">
                            {INTENT_OPTIONS.map((item) => (
                              <ChoiceChip
                                key={item.value}
                                active={draft.intents.includes(item.value)}
                                onClick={() => toggleIntent(item.value)}
                              >
                                {item.label}
                              </ChoiceChip>
                            ))}
                          </div>

                          <div className="border-t border-zinc-800/50 pt-6">
                            <div className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">Profile Visibility</div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <VisibilityCard
                                title="Public"
                                description="Show on the globe and in discovery."
                                active={draft.profile.visibility === 'PUBLIC'}
                                onClick={() =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    profile: { ...previous.profile, visibility: 'PUBLIC' },
                                  }))
                                }
                              />
                              <VisibilityCard
                                title="Private"
                                description="Keep drafting quietly and publish later."
                                active={draft.profile.visibility === 'PRIVATE'}
                                onClick={() =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    profile: { ...previous.profile, visibility: 'PRIVATE' },
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {currentStep === 'REVIEW' ? (
                        <div className="space-y-8 px-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <h2 className="text-2xl font-semibold tracking-tight text-white">
                                {draft.profile.displayName || 'Unnamed builder'}
                              </h2>
                              <div className="rounded-full border border-zinc-700/50 bg-zinc-900/50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                                {draft.profile.visibility}
                              </div>
                            </div>
                            <div className="mt-1.5 text-sm text-zinc-400">
                              {[draft.profile.city, draft.profile.country].filter(Boolean).join(', ')}
                            </div>

                            <p className="mt-5 text-sm leading-relaxed text-zinc-300 max-w-lg">{draft.profile.bio}</p>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {draft.skills.selected.map((slug) => {
                                const label = draft.skills.catalog.find((item) => item.slug === slug)?.label || slug;
                                return (
                                  <span key={slug} className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                                    {label}
                                  </span>
                                );
                              })}
                              {draft.skills.custom.map((item) => (
                                <span key={item} className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 border-t border-zinc-800/50 pt-5">
                            <ReviewItem label="Email" value={draft.auth.email} />
                            <ReviewItem label="Wallet" value={draft.auth.wallet} mono />
                            <ReviewItem label="X" value={draft.socials.x || 'Not added'} />
                            <ReviewItem label="LinkedIn" value={draft.socials.linkedin || 'Not added'} />
                            <ReviewItem label="Website" value={draft.socials.website || 'Not added'} />
                            <ReviewItem
                              label="Intent"
                              value={draft.intents.map((item) => formatIntentLabel(item)).join(', ') || 'None'}
                            />
                          </div>


                        </div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                  </div>
                </motion.div>
            </div>

            <div className="shrink-0 border-t border-zinc-800 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-[20px] text-[13px] text-red-400 max-w-[50%]">{error}</div>
                <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    className="h-10 rounded-full px-5 text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                    disabled={saving || loading}
                  >
                    Skip for now
                  </Button>
                  {currentStepIndex > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-full border-zinc-700 bg-zinc-900/50 px-5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
                      onClick={handleBack}
                      disabled={saving || loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    className="h-10 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 shadow-sm"
                    onClick={handleNext}
                    disabled={saving || loading}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {currentStep === 'REVIEW' ? 'Publish profile' : 'Next'}
                    {!saving && currentStep !== 'REVIEW' ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ChoiceChip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <FlowButton
      type="button"
      onClick={onClick}
      active={active}
      size="sm"
      strokeWidth={active ? 1.5 : 1}
      borderColor={active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)"}
      className={cn(
        'font-normal transition-colors border',
        active
          ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
          : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
      )}
    >
      {children}
    </FlowButton>
  );
}

function VisibilityCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors',
        active ? 'bg-zinc-800/30' : 'hover:bg-zinc-900/50'
      )}
    >
      <div className="flex h-5 items-center justify-center pt-0.5">
        <div className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
          active 
            ? "border-zinc-300 bg-zinc-800" 
            : "border-zinc-700 bg-zinc-950 group-hover:border-zinc-500"
        )}>
          {active && <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />}
        </div>
      </div>
      <div>
        <div className={cn(
          "text-sm font-medium transition-colors", 
          active ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
        )}>
          {title}
        </div>
        <div className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</div>
      </div>
    </button>
  );
}

function ReviewItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 px-1 py-1">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div
        className={cn(
          'mt-0.5 text-sm text-zinc-300 break-words',
          mono && 'font-mono text-[11px] leading-relaxed break-all'
        )}
      >
        {value}
      </div>
    </div>
  );
}
