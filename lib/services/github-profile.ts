import 'server-only';

interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  fork: boolean;
}

interface GitHubUser {
  login: string;
  avatar_url: string | null;
  html_url: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubContributionActivity {
  totalLastYear: number;
  totalCurrentYear: number;
  maxDailyCount: number;
  days: GitHubContributionDay[];
}

export interface GitHubSnapshotPayload {
  username: string;
  avatarUrl: string;
  profileUrl: string;
  heatmapUrl: string;
  contributions: GitHubContributionActivity | null;
  topRepos: Array<{
    name: string;
    url: string;
    description: string;
    stars: number;
    language: string;
  }>;
  pinnedRepos: Array<{
    name: string;
    url: string;
    description: string;
    stars: number;
    language: string;
  }>;
  raw: {
    user: GitHubUser;
    repos: GitHubRepo[];
    contributions: GitHubContributionActivity | null;
  };
}

async function fetchGitHubJson<T>(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'SuperGlobe',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GitHub request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

async function fetchGitHubContributionActivity(username: string): Promise<GitHubContributionActivity | null> {
  const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'SuperGlobe',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const html = await res.text();
  const totalLastYearMatch = html.match(/>\s*([\d,]+)\s*contributions?\s*in the last year\s*</i);
  const totalLastYear = totalLastYearMatch ? Number(totalLastYearMatch[1].replace(/,/g, '')) : 0;
  const tooltipCounts = new Map<string, number>();

  for (const match of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/gi)) {
    const [, id, text] = match;
    const contributionMatch = text.match(/([\d,]+)\s+contributions?/i);
    tooltipCounts.set(id, contributionMatch ? Number(contributionMatch[1].replace(/,/g, '')) : 0);
  }

  const days: GitHubContributionDay[] = [];

  for (const match of html.matchAll(/<td\b([^>]*\bclass="ContributionCalendar-day"[^>]*)><\/td>/gi)) {
    const attrs = match[1];
    const idMatch = attrs.match(/\bid="([^"]+)"/i);
    const dateMatch = attrs.match(/\bdata-date="([^"]+)"/i);
    const levelMatch = attrs.match(/\bdata-level="([^"]+)"/i);

    if (!idMatch || !dateMatch || !levelMatch) {
      continue;
    }

    const count = tooltipCounts.get(idMatch[1]) ?? 0;
    days.push({
      date: dateMatch[1],
      count,
      level: Number(levelMatch[1]) || 0,
    });
  }

  if (days.length === 0) {
    return null;
  }

  const currentYear = new Date().getUTCFullYear();
  const totalCurrentYear = days.reduce((sum, day) => {
    return day.date.startsWith(String(currentYear)) ? sum + day.count : sum;
  }, 0);
  const maxDailyCount = days.reduce((max, day) => Math.max(max, day.count), 0);

  return {
    totalLastYear,
    totalCurrentYear,
    maxDailyCount,
    days,
  };
}

export async function fetchGitHubSnapshot(username: string): Promise<GitHubSnapshotPayload> {
  const normalizedUsername = username.trim().replace(/^@/, '');
  const [user, repos, contributions] = await Promise.all([
    fetchGitHubJson<GitHubUser>(`https://api.github.com/users/${normalizedUsername}`),
    fetchGitHubJson<GitHubRepo[]>(`https://api.github.com/users/${normalizedUsername}/repos?per_page=100&sort=updated`),
    fetchGitHubContributionActivity(normalizedUsername),
  ]);

  const topRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      if (b.stargazers_count === a.stargazers_count) {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      }
      return b.stargazers_count - a.stargazers_count;
    })
    .slice(0, 6)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || '',
      stars: repo.stargazers_count,
      language: repo.language || '',
    }));

  return {
    username: user.login,
    avatarUrl: user.avatar_url || '',
    profileUrl: user.html_url,
    heatmapUrl: `https://ghchart.rshah.org/${encodeURIComponent(user.login)}`,
    contributions,
    topRepos,
    pinnedRepos: topRepos.slice(0, 3),
    raw: {
      user,
      repos,
      contributions,
    },
  };
}
