import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookie, clearSessionCookie } from '@/lib/auth-session';
import { findOrCreateUserFromAuthInput, computeProfileStatusForUser } from '@/lib/services/profile-onboarding';
import { findRosterClaimByWallet } from '@/lib/services/member-roster';
import { validateWalletAuthMessage } from '@/lib/wallet-auth-message';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const wallet = String(body.wallet || '').trim();
    const signature = body.signature;
    const message = body.message;

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet is required.' }, { status: 400 });
    }

    if (!signature || !message) {
      return NextResponse.json({ error: 'Cryptographic signature is required to claim a profile.' }, { status: 400 });
    }

    if (!validateWalletAuthMessage(String(message), wallet)) {
      return NextResponse.json({ error: 'Wallet signature message expired or does not match this wallet.' }, { status: 401 });
    }

    try {
      const publicKey = new PublicKey(wallet);
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);
      
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid wallet signature. You must own this wallet to claim the profile.' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Failed to verify wallet signature.' }, { status: 400 });
    }

    const [user, claim] = await Promise.all([
      findOrCreateUserFromAuthInput({ email: email || undefined, wallet }),
      findRosterClaimByWallet(wallet),
    ]);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
    const status = await computeProfileStatusForUser(user.id);

    return NextResponse.json({
      ok: true,
      status,
      claim,
      user: {
        id: user.id,
        email: user.email,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
