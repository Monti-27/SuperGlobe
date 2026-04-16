'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { XIcon } from '@/components/ui/x-icon';
import { useSession } from 'next-auth/react';
import { BuilderOnboardingDialog } from './BuilderOnboardingDialog';

interface ClaimMatch {
  title: string;
  wallet: string;
  country: string;
  xHandle: string | null;
}

interface ClaimMatchPayload {
  authenticated: boolean;
  handle: string | null;
  match: ClaimMatch | null;
  shouldClearLocalSession: boolean;
  localUser: {
    id: string;
    wallet: string | null;
    xHandle: string | null;
  } | null;
}

interface ProfileStatusPayload {
  status: string;
  user: { id: string; wallet: string | null } | null;
}

export function TwitterClaimListener() {
  const { data: session, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [claimMatch, setClaimMatch] = useState<ClaimMatch | null>(null);

  useEffect(() => {
    if (status === 'loading' || hasChecked) return;

    const checkHandle = async () => {
      setHasChecked(true);
      
      if (!session?.user) {
        try {
          const response = await fetch('/api/me/status', { cache: 'no-store' });
          const payload = (await response.json()) as ProfileStatusPayload;

          if (payload.user) {
            await fetch('/api/auth/session', { method: 'DELETE' });
            window.location.reload();
          }
        } catch {
          return;
        }

        return;
      }

      const handle = session.user?.twitterHandle;
      
      if (!handle) return;

      let payload: ClaimMatchPayload;

      try {
        const response = await fetch('/api/profile/claim/match', { cache: 'no-store' });
        payload = (await response.json()) as ClaimMatchPayload;
      } catch {
        return;
      }

      if (payload.shouldClearLocalSession) {
        await fetch('/api/auth/session', { method: 'DELETE' });
        window.location.reload();
        return;
      }
      
      const match = payload.match;

      if (!match) {
        return;
      }

      setClaimMatch(match);

      setTimeout(() => {
        toast.custom((t) => (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl max-w-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#1DA1F2]/20 p-1.5 rounded-lg border border-[#1DA1F2]/30">
                <XIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm">Welcome back, @{handle}</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We found {match.title} in the Superteam roster. Sign with the listed wallet to claim this profile.
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-400">
              {match.wallet.slice(0, 6)}...{match.wallet.slice(-6)}
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button 
                onClick={() => toast.dismiss(t)} 
                className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={async () => {
                  if (payload.localUser?.wallet !== match.wallet) {
                    await fetch('/api/auth/session', { method: 'DELETE' });
                  }
                  setIsDialogOpen(true); 
                  toast.dismiss(t); 
                }} 
                className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                Claim Profile
              </button>
            </div>
          </div>
        ), { duration: Infinity, position: 'bottom-right' });
      }, 1500);
    };

    void checkHandle();
  }, [session, status, hasChecked]);

  return (
    <BuilderOnboardingDialog 
      open={isDialogOpen} 
      onOpenChange={setIsDialogOpen} 
      onFinished={() => window.location.reload()}
      claimWallet={claimMatch?.wallet}
      claimProfile={claimMatch || undefined}
    />
  );
}
