import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCSVData, COUNTRY_COORDS } from "@/lib/mock-data";
import { normalizeCountry } from "@/lib/country-normalization";

export interface MemberRosterRecord {
  id: string;
  name: string;
  wallet: string;
  country: string;
  lat: number;
  lng: number;
  city?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  intents?: string[];
  socials?: {
    x?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  } | null;
  github?: {
    username?: string;
    avatarUrl?: string;
    profileUrl?: string;
    heatmapUrl?: string;
    contributions?: {
      totalLastYear: number;
      totalCurrentYear: number;
      maxDailyCount: number;
      days: Array<{
        date: string;
        count: number;
        level: number;
      }>;
    } | null;
    topRepos?: Array<{
      name: string;
      url: string;
      description?: string;
      stars?: number;
      language?: string;
    }>;
  } | null;
  source?: "profile" | "member" | "csv";
  isSuperteam?: boolean;
}

interface MemberRosterFilters {
  country?: string | null;
  search?: string | null;
  skip?: number;
  take?: number;
}

export interface MemberRosterResult {
  members: MemberRosterRecord[];
  total: number;
  source: "prisma" | "csv";
  fallbackReason?: string;
}

export interface MemberWalletCountryResult {
  members: Array<{ country: string; wallet: string }>;
  source: "prisma" | "csv";
  fallbackReason?: string;
}

export interface RosterClaimRecord {
  title: string;
  wallet: string;
  country: string;
  lat: number;
  lng: number;
  xHandle: string | null;
}

interface CsvCachePayload {
  expiresAt: number;
  members: MemberRosterRecord[];
}

const CSV_CACHE_TTL_MS = 5 * 60 * 1000;

const globalCache = globalThis as unknown as {
  memberRosterCsvCache?: CsvCachePayload;
};

function csvFilePath() {
  return path.join(process.cwd(), "public", "members-data", "Shareable Wallets (Public Access).csv");
}

function normalizeSearch(search: string | null | undefined): string {
  return (search || "").trim().toLowerCase();
}

function normalizeHandle(value: string | null | undefined): string {
  return (value || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function offsetForSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const hash2 = (hash * 1103515245 + 12345) | 0;
  const latOffset = ((Math.abs(hash) % 200) / 100 - 1) * 1.2;
  const lngOffset = ((Math.abs(hash2) % 200) / 100 - 1) * 1.2;
  return { latOffset, lngOffset };
}

function hydrateCountryCoordinates(country: string, seed: string) {
  const normalizedCountry = normalizeCountry(country);
  const coords = normalizedCountry ? COUNTRY_COORDS[normalizedCountry] : null;

  if (!coords) {
    return null;
  }

  const { latOffset, lngOffset } = offsetForSeed(seed);
  return {
    country: coords.displayName,
    lat: coords.lat + latOffset,
    lng: coords.lng + lngOffset,
  };
}

function applyRosterFilters(
  records: MemberRosterRecord[],
  filters: { country?: string | null; search?: string | null }
): MemberRosterRecord[] {
  const normalizedSearch = normalizeSearch(filters.search);

  return records.filter((record) => {
    if (filters.country && record.country !== filters.country) {
      return false;
    }

    if (normalizedSearch) {
      const inName = record.name.toLowerCase().includes(normalizedSearch);
      const inWallet = record.wallet.toLowerCase().includes(normalizedSearch);
      if (!inName && !inWallet) {
        return false;
      }
    }

    return true;
  });
}

async function loadRosterFromCsv(): Promise<MemberRosterRecord[]> {
  const now = Date.now();
  const cached = globalCache.memberRosterCsvCache;
  if (cached && cached.expiresAt > now) {
    return cached.members;
  }

  const csvText = await readFile(csvFilePath(), "utf8");
  const parsed = parseCSVData(csvText).map((member) => ({
    id: member.id,
    name: member.name,
    wallet: member.wallet,
    country: member.country,
    lat: member.lat,
    lng: member.lng,
    source: "csv" as const,
  }));

  globalCache.memberRosterCsvCache = {
    members: parsed,
    expiresAt: now + CSV_CACHE_TTL_MS,
  };

  return parsed;
}

const rosterProfileInclude = {
  user: {
    include: {
      githubSnapshot: true,
    },
  },
  socialLinks: true,
  skills: {
    include: {
      skillTag: true,
    },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
  intents: {
    where: { isActive: true },
  },
} satisfies Prisma.BuilderProfileInclude;

async function loadProfilesFromDb(where: Prisma.BuilderProfileWhereInput) {
  return prisma.builderProfile.findMany({
    where,
    include: rosterProfileInclude,
  });
}

type RosterProfileRow = Awaited<ReturnType<typeof loadProfilesFromDb>>[number];

function profileToRosterRecord(profile: RosterProfileRow): MemberRosterRecord | null {
  const wallet = profile.user.wallet || "";
  const coords = profile.country ? hydrateCountryCoordinates(profile.country, wallet || profile.id) : null;
  if (!coords) {
    return null;
  }

  const socialLookup = Object.fromEntries(
    profile.socialLinks.map((item) => [item.type.toLowerCase(), item.url])
  ) as MemberRosterRecord["socials"];
  const rawSnapshot = (profile.user.githubSnapshot?.raw as Record<string, unknown> | null) || null;
  const rawContributions = (rawSnapshot?.contributions as Record<string, unknown> | null) || null;

  return {
    id: `profile-${profile.id}`,
    name: profile.displayName || "Unnamed Builder",
    wallet,
    country: coords.country,
    lat: coords.lat,
    lng: coords.lng,
    city: profile.city,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    skills: profile.skills
      .map((item) => item.skillTag?.label || item.customLabel || "")
      .filter(Boolean),
    intents: profile.intents.map((item) => item.intent),
    socials: socialLookup,
    github: profile.user.githubSnapshot
      ? {
          username: profile.user.githubSnapshot.username,
          avatarUrl: profile.user.githubSnapshot.avatarUrl || "",
          profileUrl: profile.user.githubSnapshot.profileUrl || "",
          heatmapUrl: profile.user.githubSnapshot.heatmapUrl || "",
          contributions: rawContributions
            ? {
                totalLastYear: Number(rawContributions.totalLastYear || 0),
                totalCurrentYear: Number(rawContributions.totalCurrentYear || 0),
                maxDailyCount: Number(rawContributions.maxDailyCount || 0),
                days: (((rawContributions.days as Array<Record<string, unknown>> | null) || []).map((day) => ({
                  date: String(day.date || ''),
                  count: Number(day.count || 0),
                  level: Number(day.level || 0),
                }))),
              }
            : null,
          topRepos: ((profile.user.githubSnapshot.topRepos as Array<Record<string, unknown>> | null) || []).map(
            (repo) => ({
              name: String(repo.name || ""),
              url: String(repo.url || ""),
              description: String(repo.description || ""),
              stars: Number(repo.stars || 0),
              language: String(repo.language || ""),
            })
          ),
        }
      : null,
    source: "profile",
  };
}

async function loadPublicProfilesFromDb(): Promise<MemberRosterRecord[]> {
  const profiles = await loadProfilesFromDb({
    isPublished: true,
    visibility: "PUBLIC",
    user: {
      wallet: {
        not: null,
      },
    },
  });

  const mappedProfiles = profiles
    .map(profileToRosterRecord)
    .filter((item): item is MemberRosterRecord => item !== null);

  return mappedProfiles;
}

async function loadOwnerProfileById(idOrWallet: string, viewerWallet?: string | null) {
  if (!viewerWallet) {
    return null;
  }

  const profileId = idOrWallet.startsWith("profile-") ? idOrWallet.slice("profile-".length) : idOrWallet;
  const profiles = await loadProfilesFromDb({
    isPublished: true,
    user: {
      wallet: viewerWallet,
    },
    OR: [
      { id: profileId },
      {
        user: {
          wallet: idOrWallet,
        },
      },
    ],
  });

  if (profiles[0]) {
    const record = profileToRosterRecord(profiles[0]);
    if (record) {
      const legacy = await loadLegacyMembersFromDb({ search: record.wallet }).catch(() => []);
      const csv = await loadRosterFromCsv().catch(() => []);
      const isSuperteam = legacy.some(l => l.wallet === record.wallet) || csv.some(c => c.wallet === record.wallet);
      return { ...record, isSuperteam };
    }
  }
  return null;
}

async function loadLegacyMembersFromDb(filters: MemberRosterFilters): Promise<MemberRosterRecord[]> {
  const search = (filters.search || "").trim();
  const where: Record<string, unknown> = {};

  if (filters.country) {
    where.country = filters.country;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { wallet: { contains: search, mode: "insensitive" } },
    ];
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return members.map((member) => ({
    ...member,
    source: "member" as const,
  }));
}

function mergeRosterRecords(records: MemberRosterRecord[]) {
  const merged = new Map<string, MemberRosterRecord>();
  const superteamWallets = new Set(
    records.filter(r => r.source === 'member' || r.source === 'csv').map(r => r.wallet)
  );

  for (const record of records) {
    const key = record.wallet || `${record.source}-${record.id}`;
    if (!merged.has(key) || record.source === "profile") {
      const isSuperteam = superteamWallets.has(record.wallet) || record.source === 'member' || record.source === 'csv';
      merged.set(key, { ...record, isSuperteam });
    }
  }

  return Array.from(merged.values());
}

export async function fetchMemberRoster(filters: MemberRosterFilters): Promise<MemberRosterResult> {
  const skip = Math.max(0, filters.skip ?? 0);
  const take = filters.take ? Math.max(1, filters.take) : undefined;

  try {
    const profiles = await loadPublicProfilesFromDb().catch(() => []);
    const legacy = await loadLegacyMembersFromDb(filters).catch(() => []);
    const combined = mergeRosterRecords([...profiles, ...legacy]);
    const filtered = applyRosterFilters(combined, { country: filters.country, search: filters.search }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const paged =
      typeof take === "number"
        ? filtered.slice(skip, skip + take)
        : skip > 0
          ? filtered.slice(skip)
          : filtered;

    return {
      members: paged,
      total: filtered.length,
      source: "prisma",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown prisma error";
    console.warn("Prisma member roster unavailable, using CSV fallback:", reason);

    const csvRecords = await loadRosterFromCsv();
    const filtered = applyRosterFilters(csvRecords, { country: filters.country, search: filters.search }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const paged =
      typeof take === "number"
        ? filtered.slice(skip, skip + take)
        : skip > 0
          ? filtered.slice(skip)
          : filtered;

    return {
      members: paged,
      total: filtered.length,
      source: "csv",
      fallbackReason: reason,
    };
  }
}

export async function fetchMemberWalletCountrySnapshot(): Promise<MemberWalletCountryResult> {
  try {
    const roster = await fetchMemberRoster({});
    return {
      members: roster.members.map((record) => ({
        country: record.country,
        wallet: record.wallet,
      })),
      source: "prisma",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown prisma error";
    console.warn("Prisma country snapshot unavailable, using CSV fallback:", reason);

    const csvRecords = await loadRosterFromCsv();
    return {
      members: csvRecords.map((record) => ({
        country: record.country,
        wallet: record.wallet,
      })),
      source: "csv",
      fallbackReason: reason,
    };
  }
}

export async function fetchMemberById(
  idOrWallet: string,
  options: { viewerWallet?: string | null } = {}
): Promise<MemberRosterRecord | null> {
  try {
    const ownerProfile = await loadOwnerProfileById(idOrWallet, options.viewerWallet).catch(() => null);
    if (ownerProfile) {
      return ownerProfile;
    }

    const profiles = await loadPublicProfilesFromDb().catch(() => []);
    const legacy = await loadLegacyMembersFromDb({}).catch(() => []);
    const combined = mergeRosterRecords([...profiles, ...legacy]);

    const member = combined.find(m => m.id === idOrWallet || m.wallet === idOrWallet);

    if (!member) {
      const csvRecords = await loadRosterFromCsv();
      return csvRecords.find(m => m.id === idOrWallet || m.wallet === idOrWallet) || null;
    }

    return member;
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    return null;
  }
}

export async function findRosterClaimByHandle(handle: string): Promise<RosterClaimRecord | null> {
  const normalizedHandle = normalizeHandle(handle);
  if (!normalizedHandle) {
    return null;
  }

  return null;
}

export async function findRosterClaimByWallet(wallet: string): Promise<RosterClaimRecord | null> {
  const normalizedWallet = wallet.trim();
  if (!normalizedWallet) {
    return null;
  }

  const records = await loadRosterFromCsv();
  const record = records.find((item) => item.wallet === normalizedWallet);

  if (!record) {
    return null;
  }

  return {
    title: record.name,
    wallet: record.wallet,
    country: record.country,
    lat: record.lat,
    lng: record.lng,
    xHandle: null,
  };
}
