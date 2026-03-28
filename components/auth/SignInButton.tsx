'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Wallet, WalletMinimal, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { type ProfileStatus } from '@/lib/onboarding';
import { createWalletAuthMessage } from '@/lib/wallet-auth-message';
import { GradientWaveText } from '@/components/ui/gradient-wave-text';
import { FlowButton } from '@/components/ui/flow-button';

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

interface WalletAuthResult {
  status: ProfileStatus;
  claim: {
    title: string;
    wallet: string;
    country: string;
  } | null;
  user: {
    wallet: string | null;
  } | null;
}

interface StatusPayload {
  status: ProfileStatus;
  user: {
    wallet: string | null;
  } | null;
}

interface SignInButtonProps {
  onClaimProfile?: (result: WalletAuthResult) => void;
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
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

export function SignInButton({ onClaimProfile }: SignInButtonProps) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshSession = useCallback(async () => {
    const payload = await readJson<StatusPayload>('/api/me/status');
    setWallet(payload.user?.wallet || null);
    return payload;
  }, []);

  useEffect(() => {
    void refreshSession().catch(() => null);
  }, [refreshSession]);

  const handleDisconnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setWallet(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);

    try {
      const provider = window.solana;
      if (!provider) {
        throw new Error('Install a Solana wallet to continue.');
      }

      const response = await provider.connect();
      const walletString = response.publicKey.toString();
      const messageText = createWalletAuthMessage(walletString);
      const message = new TextEncoder().encode(messageText);
      const { signature } = await provider.signMessage(message, 'utf8');
      const bs58 = (await import('bs58')).default;

      const result = await readJson<WalletAuthResult>('/api/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          wallet: walletString,
          signature: bs58.encode(signature),
          message: messageText,
        }),
      });

      setWallet(result.user?.wallet || walletString);

      if (result.status.startsWith('authenticated_completed')) {
        toast.success('Signed in successfully', {
          description: 'Welcome back to SuperGlobe!',
          duration: 3000,
        });
        onClaimProfile?.(result);
      } else if (result.claim) {
        const toastId = `claim-${walletString}`;
        toast.custom(
          (t) => (
            <div className="flex w-[356px] max-w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-white">Superteam wallet found</div>
                  <div className="text-xs text-zinc-400">Claim profile for {result.claim?.title}.</div>
                </div>
              </div>
              <FlowButton
                type="button"
                active={true}
                size="sm"
                strokeWidth={1.5}
                borderColor="rgba(255,255,255,0.9)"
                className="text-white"
                onClick={() => {
                  toast.dismiss(toastId);
                  onClaimProfile?.(result);
                }}
              >
                Claim
              </FlowButton>
            </div>
          ),
          { id: toastId, duration: 12000 }
        );
      } else {
        toast.message('Wallet connected', {
          description: 'This wallet is not in the Superteam roster yet.',
        });
        onClaimProfile?.(result);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  }, [onClaimProfile]);

  if (wallet) {
    return (
      <FlowButton
        onClick={handleDisconnect}
        disabled={isConnecting}
        borderColor="rgb(52, 211, 153)"
        className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 transition-all hover:bg-emerald-400/15 disabled:cursor-wait disabled:opacity-70 font-medium"
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {shortWallet(wallet)}
      </FlowButton>
    );
  }

    return (
      <FlowButton
        onClick={handleConnect}
        disabled={isConnecting}
        borderColor="rgba(255, 255, 255, 0.4)"
        className="bg-zinc-900 border border-zinc-800 text-zinc-100 transition-all hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-70 font-bold overflow-hidden"
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4 text-zinc-300" />}
        <GradientWaveText
          repeat={true}
          speed={1}
        >
          Connect Wallet
        </GradientWaveText>
      </FlowButton>
    );
}
