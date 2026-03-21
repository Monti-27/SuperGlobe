export type SocialLinkKind = 'x' | 'linkedin' | 'github' | 'website';

function trimProtocol(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

export function normalizeSocialUrl(kind: SocialLinkKind, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (kind === 'website') {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimProtocol(trimmed)}`;
  }

  const withoutProtocol = trimProtocol(trimmed).replace(/^@/, '').replace(/\/+$/, '');

  if (kind === 'x') {
    if (/^(x|twitter)\.com\//i.test(withoutProtocol)) {
      return `https://${withoutProtocol.replace(/^twitter\.com\//i, 'x.com/')}`;
    }

    return `https://x.com/${withoutProtocol}`;
  }

  if (kind === 'linkedin') {
    if (/^linkedin\.com\//i.test(withoutProtocol)) {
      return `https://${withoutProtocol}`;
    }

    if (/^(in|company|school)\//i.test(withoutProtocol)) {
      return `https://linkedin.com/${withoutProtocol}`;
    }

    return `https://linkedin.com/in/${withoutProtocol}`;
  }

  if (/^github\.com\//i.test(withoutProtocol)) {
    return `https://${withoutProtocol}`;
  }

  return `https://github.com/${withoutProtocol}`;
}

export function socialInputValue(kind: SocialLinkKind, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const normalized = normalizeSocialUrl(kind, trimmed);

  if (kind === 'website') {
    return trimProtocol(normalized);
  }

  if (kind === 'x') {
    const username = normalized.replace(/^https?:\/\/x\.com\//i, '').replace(/^@/, '');
    return username ? `@${username}` : '';
  }

  if (kind === 'linkedin') {
    return normalized.replace(/^https?:\/\/linkedin\.com\/(in|company|school)\//i, '');
  }

  return normalized.replace(/^https?:\/\/github\.com\//i, '');
}
