export interface OnchainActivity {
  wallet: string;
  score: number;
  recent7d: number;
  recent30d: number;
  latestActivityAt: string | null;
  signatureSampleSize: number;
  source: "solana-rpc";
  rpcEndpoint: string;
  fetchedAt: string;
  error?: string;
}

interface CacheEntry {
  expiresAt: number;
  value: OnchainActivity;
}

interface SignatureInfo {
  blockTime: number | null;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_RPC_ENDPOINT = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

const globalCache = globalThis as unknown as {
  onchainActivityCache?: Map<string, CacheEntry>;
};

const onchainActivityCache = globalCache.onchainActivityCache ?? new Map<string, CacheEntry>();

if (!globalCache.onchainActivityCache) {
  globalCache.onchainActivityCache = onchainActivityCache;
}

function isLikelySolanaWallet(wallet: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet);
}

function toIso(tsSeconds: number | null): string | null {
  if (!tsSeconds) {
    return null;
  }

  return new Date(tsSeconds * 1000).toISOString();
}

async function fetchSignaturesForAddress(wallet: string, limit = 40): Promise<SignatureInfo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(DEFAULT_RPC_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [wallet, { limit }],
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`RPC failed with status ${res.status}`);
    }

    const payload = (await res.json()) as { result?: SignatureInfo[]; error?: { message?: string } };

    if (payload.error) {
      throw new Error(payload.error.message || "RPC returned an error");
    }

    return payload.result ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

function computeActivityScore(wallet: string, signatures: SignatureInfo[]): OnchainActivity {
  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const validTimes = signatures
    .map((sig) => sig.blockTime)
    .filter((blockTime): blockTime is number => typeof blockTime === "number");

  const recent7d = validTimes.filter((blockTime) => blockTime >= sevenDaysAgo).length;
  const recent30d = validTimes.filter((blockTime) => blockTime >= thirtyDaysAgo).length;
  const latest = validTimes.length > 0 ? Math.max(...validTimes) : null;

  const daysSinceLatest = latest ? Math.max(0, (now - latest) / (24 * 60 * 60)) : Number.POSITIVE_INFINITY;
  const recencyBonus = Number.isFinite(daysSinceLatest) ? Math.max(0, 40 - daysSinceLatest * 4) : 0;

  const scoreRaw = Math.min(100, recent30d * 2 + recent7d * 3 + recencyBonus);
  const score = Math.round(scoreRaw);

  return {
    wallet,
    score,
    recent7d,
    recent30d,
    latestActivityAt: toIso(latest),
    signatureSampleSize: signatures.length,
    source: "solana-rpc",
    rpcEndpoint: DEFAULT_RPC_ENDPOINT,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getWalletActivity(wallet: string): Promise<OnchainActivity> {
  if (!wallet || !isLikelySolanaWallet(wallet)) {
    return {
      wallet,
      score: 0,
      recent7d: 0,
      recent30d: 0,
      latestActivityAt: null,
      signatureSampleSize: 0,
      source: "solana-rpc",
      rpcEndpoint: DEFAULT_RPC_ENDPOINT,
      fetchedAt: new Date().toISOString(),
      error: "Invalid wallet address",
    };
  }

  const cached = onchainActivityCache.get(wallet);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const signatures = await fetchSignaturesForAddress(wallet);
    const activity = computeActivityScore(wallet, signatures);

    onchainActivityCache.set(wallet, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value: activity,
    });

    return activity;
  } catch (error) {
    const fallback: OnchainActivity = {
      wallet,
      score: 0,
      recent7d: 0,
      recent30d: 0,
      latestActivityAt: null,
      signatureSampleSize: 0,
      source: "solana-rpc",
      rpcEndpoint: DEFAULT_RPC_ENDPOINT,
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown RPC error",
    };

    onchainActivityCache.set(wallet, {
      expiresAt: Date.now() + 60_000,
      value: fallback,
    });

    return fallback;
  }
}

export async function getWalletActivityBatch(
  wallets: string[],
  options?: { concurrency?: number }
): Promise<Map<string, OnchainActivity>> {
  const concurrency = Math.max(1, options?.concurrency ?? 4);
  const uniqueWallets = Array.from(new Set(wallets.filter(Boolean)));
  const results = new Map<string, OnchainActivity>();

  let index = 0;

  async function worker() {
    while (index < uniqueWallets.length) {
      const current = uniqueWallets[index];
      index += 1;
      const activity = await getWalletActivity(current);
      results.set(current, activity);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, uniqueWallets.length) }, () => worker()));
  return results;
}
