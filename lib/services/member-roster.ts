import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { parseCSVData } from "@/lib/mock-data";

export interface MemberRosterRecord {
  id: string;
  name: string;
  wallet: string;
  country: string;
  lat: number;
  lng: number;
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
  }));

  globalCache.memberRosterCsvCache = {
    members: parsed,
    expiresAt: now + CSV_CACHE_TTL_MS,
  };

  return parsed;
}

export async function fetchMemberRoster(filters: MemberRosterFilters): Promise<MemberRosterResult> {
  const skip = Math.max(0, filters.skip ?? 0);
  const take = filters.take ? Math.max(1, filters.take) : undefined;
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

  try {
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.member.count({ where }),
    ]);

    return { members, total, source: "prisma" };
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
    const members = await prisma.member.findMany({
      select: {
        country: true,
        wallet: true,
      },
    });

    return { members, source: "prisma" };
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
