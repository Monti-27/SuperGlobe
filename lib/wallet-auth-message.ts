const MAX_AUTH_MESSAGE_AGE_MS = 5 * 60 * 1000;

export function createWalletAuthMessage(wallet: string, issuedAt = new Date()) {
  return `SuperGlobe wallet sign-in\nWallet: ${wallet}\nIssued At: ${issuedAt.toISOString()}`;
}

export function validateWalletAuthMessage(message: string, wallet: string, now = Date.now()) {
  const walletMatch = message.match(/^Wallet: (.+)$/m);
  const issuedAtMatch = message.match(/^Issued At: (.+)$/m);

  if (!message.startsWith('SuperGlobe wallet sign-in') || !walletMatch || !issuedAtMatch) {
    return false;
  }

  if (walletMatch[1]?.trim() !== wallet) {
    return false;
  }

  const issuedAt = Date.parse(issuedAtMatch[1]);
  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  return Math.abs(now - issuedAt) <= MAX_AUTH_MESSAGE_AGE_MS;
}
