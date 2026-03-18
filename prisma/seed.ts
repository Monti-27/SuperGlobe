import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const COUNTRY_ALIASES: Record<string, string> = {
  england: 'United Kingdom',
  'great britain': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  uk: 'United Kingdom',
  usa: 'USA',
  us: 'USA',
  'u.s.a.': 'USA',
  'u.s.': 'USA',
  'united states': 'USA',
  'united states of america': 'USA',
  'united arab emirates': 'UAE',
  uae: 'UAE',
  balkan: 'Balkans',
  balkans: 'Balkans',
  kazakstan: 'Kazakhstan',
  kazakhstan: 'Kazakhstan',
};

const COUNTRY_COORDS: Record<string, { lat: number; lng: number; displayName: string }> = {
  India: { lat: 20.5937, lng: 78.9629, displayName: 'India' },
  Turkey: { lat: 38.9637, lng: 35.2433, displayName: 'Turkey' },
  Vietnam: { lat: 14.0583, lng: 108.2772, displayName: 'Vietnam' },
  Germany: { lat: 51.1657, lng: 10.4515, displayName: 'Germany' },
  'United Kingdom': { lat: 55.3781, lng: -3.436, displayName: 'United Kingdom' },
  UAE: { lat: 23.4241, lng: 53.8478, displayName: 'UAE' },
  Nigeria: { lat: 9.082, lng: 8.6753, displayName: 'Nigeria' },
  Brazil: { lat: -14.235, lng: -51.9253, displayName: 'Brazil' },
  Philippines: { lat: 12.8797, lng: 121.774, displayName: 'Philippines' },
  Malaysia: { lat: 4.2105, lng: 101.9758, displayName: 'Malaysia' },
  Balkans: { lat: 42, lng: 21, displayName: 'Balkans' },
  Japan: { lat: 36.2048, lng: 138.2529, displayName: 'Japan' },
  France: { lat: 46.2276, lng: 2.2137, displayName: 'France' },
  Canada: { lat: 56.1304, lng: -106.3468, displayName: 'Canada' },
  Singapore: { lat: 1.3521, lng: 103.8198, displayName: 'Singapore' },
  'South Korea': { lat: 35.9078, lng: 127.7669, displayName: 'South Korea' },
  Indonesia: { lat: -0.7893, lng: 113.9213, displayName: 'Indonesia' },
  Ireland: { lat: 53.1424, lng: -7.6921, displayName: 'Ireland' },
  Kazakhstan: { lat: 48.0196, lng: 66.9237, displayName: 'Kazakhstan' },
  Netherlands: { lat: 52.1326, lng: 5.2913, displayName: 'Netherlands' },
  Poland: { lat: 51.9194, lng: 19.1451, displayName: 'Poland' },
  Georgia: { lat: 42.3154, lng: 43.3569, displayName: 'Georgia' },
  Spain: { lat: 40.4637, lng: -3.7492, displayName: 'Spain' },
  Ukraine: { lat: 48.3794, lng: 31.1656, displayName: 'Ukraine' },
  Mexico: { lat: 23.6345, lng: -102.5528, displayName: 'Mexico' },
  USA: { lat: 37.0902, lng: -95.7129, displayName: 'USA' },
  Australia: { lat: -25.2744, lng: 133.7751, displayName: 'Australia' },
  Israel: { lat: 31.0461, lng: 34.8516, displayName: 'Israel' },
};

function normalizeCountry(rawCountry: string) {
  const trimmed = rawCountry.trim();
  return COUNTRY_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function offsetForWallet(wallet: string) {
  let hash = 0;
  for (let index = 0; index < wallet.length; index++) {
    hash = (hash << 5) - hash + wallet.charCodeAt(index);
    hash |= 0;
  }

  const hash2 = (hash * 1103515245 + 12345) | 0;
  const latOffset = ((Math.abs(hash) % 200) / 100 - 1) * 1.2;
  const lngOffset = ((Math.abs(hash2) % 200) / 100 - 1) * 1.2;
  return { latOffset, lngOffset };
}

function loadMembers() {
  const csvPath = path.join(process.cwd(), 'public/members-data/Shareable Wallets (Public Access).csv');
  const csvText = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '');
  const lines = csvText.trim().split(/\r?\n/);
  const members = new Map<string, { name: string; wallet: string; country: string; lat: number; lng: number }>();
  const skippedCountries = new Set<string>();
  let skippedRows = 0;

  for (let index = 1; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) {
      skippedRows++;
      continue;
    }

    const parts = line.split(',');
    const name = (parts[0] || '').trim();
    const wallet = (parts[1] || '').trim();
    const rawCountry = (parts[parts.length - 1] || '').trim();

    if (!name || name === '-' || name.toLowerCase() === 'n/a' || !wallet || wallet === '-' || wallet.toLowerCase() === 'n/a' || wallet.length < 10 || !rawCountry) {
      skippedRows++;
      continue;
    }

    const country = normalizeCountry(rawCountry);
    const coords = COUNTRY_COORDS[country];

    if (!coords) {
      skippedCountries.add(rawCountry);
      skippedRows++;
      continue;
    }

    if (members.has(wallet)) {
      continue;
    }

    const { latOffset, lngOffset } = offsetForWallet(wallet);
    members.set(wallet, {
      name,
      wallet,
      country: coords.displayName,
      lat: coords.lat + latOffset,
      lng: coords.lng + lngOffset,
    });
  }

  return {
    members: Array.from(members.values()),
    skippedRows,
    skippedCountries: Array.from(skippedCountries).sort(),
  };
}

async function main() {
  const { members, skippedRows, skippedCountries } = loadMembers();
  await prisma.member.deleteMany();
  await prisma.member.createMany({ data: members });

  const total = await prisma.member.count();

  console.log(`Loaded ${members.length} unique members from CSV.`);
  console.log(`Member table now has ${total} rows.`);
  console.log(`Skipped ${skippedRows} rows.`);

  if (skippedCountries.length > 0) {
    console.log(`Skipped countries: ${skippedCountries.join(', ')}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
