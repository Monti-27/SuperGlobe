import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Country coordinates for geocoding
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
    'India': { lat: 20.5937, lng: 78.9629 },
    'Turkey': { lat: 38.9637, lng: 35.2433 },
    'Vietnam': { lat: 14.0583, lng: 108.2772 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'United Kingdom': { lat: 55.3781, lng: -3.4360 },
    'UAE': { lat: 23.4241, lng: 53.8478 },
    'Nigeria': { lat: 9.0820, lng: 8.6753 },
    'Brazil': { lat: -14.2350, lng: -51.9253 },
    'Philippines': { lat: 12.8797, lng: 121.7740 },
    'Malaysia': { lat: 4.2105, lng: 101.9758 },
    'Balkan': { lat: 42.0000, lng: 21.0000 },
    'Japan': { lat: 36.2048, lng: 138.2529 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'Canada': { lat: 56.1304, lng: -106.3468 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'South Korea': { lat: 35.9078, lng: 127.7669 },
    'Indonesia': { lat: -0.7893, lng: 113.9213 },
    'Ireland': { lat: 53.1424, lng: -7.6921 },
    'Kazakhstan': { lat: 48.0196, lng: 66.9237 },
    'Kazakstan': { lat: 48.0196, lng: 66.9237 },
    'Netherlands': { lat: 52.1326, lng: 5.2913 },
    'Poland': { lat: 51.9194, lng: 19.1451 },
    'Georgia': { lat: 42.3154, lng: 43.3569 },
    'Spain': { lat: 40.4637, lng: -3.7492 },
    'Ukraine': { lat: 48.3794, lng: 31.1656 },
    'Mexico': { lat: 23.6345, lng: -102.5528 },
};

async function main() {
    console.log('🌱 Starting seed...');

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public/members-data/Shareable Wallets (Public Access).csv');
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvText.trim().split('\n');

    const members: {
        name: string;
        wallet: string;
        country: string;
        lat: number;
        lng: number;
    }[] = [];

    // Parse CSV (skip header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const parts = line.split(',');
        if (parts.length < 3) continue;

        const name = parts[0].trim();
        const wallet = parts[1].trim();
        const country = parts[parts.length - 1].trim();

        // Skip invalid entries
        if (!name || name === '-' || name === 'n/a' || name === 'N/A') continue;
        if (!wallet || wallet === '-' || wallet === 'n/a' || wallet === 'N/A' || wallet.length < 10) continue;
        if (!country) continue;

        const coords = COUNTRY_COORDS[country];
        if (!coords) continue;

        // Add randomness for visual spread
        const latOffset = (Math.random() - 0.5) * 8;
        const lngOffset = (Math.random() - 0.5) * 8;

        members.push({
            name,
            wallet,
            country: country === 'Balkan' ? 'Balkans' : country === 'Kazakstan' ? 'Kazakhstan' : country,
            lat: coords.lat + latOffset,
            lng: coords.lng + lngOffset,
        });
    }

    console.log(`📊 Parsed ${members.length} valid members from CSV`);

    // Clear existing data
    await prisma.member.deleteMany();
    console.log('🗑️  Cleared existing members');

    // Batch insert
    let inserted = 0;
    const seenWallets = new Set<string>();

    for (const member of members) {
        // Skip duplicates
        if (seenWallets.has(member.wallet)) continue;
        seenWallets.add(member.wallet);

        try {
            await prisma.member.create({ data: member });
            inserted++;

            if (inserted % 100 === 0) {
                console.log(`✅ Inserted ${inserted} members...`);
            }
        } catch {
            // Skip errors (duplicates, etc)
        }
    }

    console.log(`\n🎉 Seed complete! Inserted ${inserted} members.`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
