// Real Data for Solana Superteam Members

export interface Member {
    id: string;
    name: string;
    wallet: string;
    country: string;
    lat: number;
    lng: number;
}

export interface Hub {
    id: string;
    name: string;
    lat: number;
    lng: number;
    memberCount: number;
}

// Country coordinates for mapping
export const COUNTRY_COORDS: Record<string, { lat: number; lng: number; displayName: string }> = {
    'India': { lat: 20.5937, lng: 78.9629, displayName: 'India' },
    'Turkey': { lat: 38.9637, lng: 35.2433, displayName: 'Turkey' },
    'Vietnam': { lat: 14.0583, lng: 108.2772, displayName: 'Vietnam' },
    'Germany': { lat: 51.1657, lng: 10.4515, displayName: 'Germany' },
    'United Kingdom': { lat: 55.3781, lng: -3.4360, displayName: 'United Kingdom' },
    'UAE': { lat: 23.4241, lng: 53.8478, displayName: 'UAE' },
    'Nigeria': { lat: 9.0820, lng: 8.6753, displayName: 'Nigeria' },
    'Brazil': { lat: -14.2350, lng: -51.9253, displayName: 'Brazil' },
    'Philippines': { lat: 12.8797, lng: 121.7740, displayName: 'Philippines' },
    'Malaysia': { lat: 4.2105, lng: 101.9758, displayName: 'Malaysia' },
    'Balkan': { lat: 42.0000, lng: 21.0000, displayName: 'Balkans' },
    'Japan': { lat: 36.2048, lng: 138.2529, displayName: 'Japan' },
    'France': { lat: 46.2276, lng: 2.2137, displayName: 'France' },
    'Canada': { lat: 56.1304, lng: -106.3468, displayName: 'Canada' },
    'Singapore': { lat: 1.3521, lng: 103.8198, displayName: 'Singapore' },
    'South Korea': { lat: 35.9078, lng: 127.7669, displayName: 'South Korea' },
    'USA': { lat: 37.0902, lng: -95.7129, displayName: 'USA' },
};

// Hub connections for arcs
export const HUB_ARCS = [
    { startLat: 20.5937, startLng: 78.9629, endLat: 1.3521, endLng: 103.8198 },     // India -> Singapore
    { startLat: 51.1657, startLng: 10.4515, endLat: 55.3781, endLng: -3.4360 },     // Germany -> UK
    { startLat: 9.0820, startLng: 8.6753, endLat: 55.3781, endLng: -3.4360 },       // Nigeria -> UK
    { startLat: 14.0583, startLng: 108.2772, endLat: 1.3521, endLng: 103.8198 },    // Vietnam -> Singapore
    { startLat: 12.8797, startLng: 121.7740, endLat: 36.2048, endLng: 138.2529 },   // Philippines -> Japan
    { startLat: 56.1304, startLng: -106.3468, endLat: 37.0902, endLng: -95.7129 },  // Canada -> USA
    { startLat: -14.2350, startLng: -51.9253, endLat: 37.0902, endLng: -95.7129 },  // Brazil -> USA
    { startLat: 38.9637, startLng: 35.2433, endLat: 51.1657, endLng: 10.4515 },     // Turkey -> Germany
    { startLat: 20.5937, startLng: 78.9629, endLat: 23.4241, endLng: 53.8478 },     // India -> UAE
    { startLat: 46.2276, startLng: 2.2137, endLat: 51.1657, endLng: 10.4515 },      // France -> Germany
];

// Parse CSV data to Member array
export function parseCSVData(csvText: string): Member[] {
    const lines = csvText.trim().split('\n');
    const members: Member[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parse CSV - handle potential commas in names
        const parts = line.split(',');
        if (parts.length < 3) continue;

        const name = parts[0].trim();
        const wallet = parts[1].trim();
        const country = parts[parts.length - 1].trim(); // Country is always last

        // Skip invalid entries
        if (!name || name === '-' || name === 'n/a' || name === 'N/A') continue;
        if (!wallet || wallet === '-' || wallet === 'n/a' || wallet === 'N/A') continue;
        if (!country) continue;

        const coords = COUNTRY_COORDS[country];
        if (!coords) continue; // Skip unknown countries

        // Add slight randomness to coordinates for visual spread
        const latOffset = (Math.random() - 0.5) * 2;
        const lngOffset = (Math.random() - 0.5) * 2;

        members.push({
            id: `member-${i}`,
            name,
            wallet,
            country: coords.displayName,
            lat: coords.lat + latOffset,
            lng: coords.lng + lngOffset,
        });
    }

    return members;
}

// Get members grouped by country
export function getCountryStats(members: Member[]): { country: string; count: number; flag: string }[] {
    const countryMap = new Map<string, number>();

    members.forEach(member => {
        countryMap.set(member.country, (countryMap.get(member.country) || 0) + 1);
    });

    const flagMap: Record<string, string> = {
        'India': '🇮🇳',
        'Turkey': '🇹🇷',
        'Vietnam': '🇻🇳',
        'Germany': '🇩🇪',
        'United Kingdom': '🇬🇧',
        'UAE': '🇦🇪',
        'Nigeria': '🇳🇬',
        'Brazil': '🇧🇷',
        'Philippines': '🇵🇭',
        'Malaysia': '🇲🇾',
        'Balkans': '🌍',
        'Japan': '🇯🇵',
        'France': '🇫🇷',
        'Canada': '🇨🇦',
        'Singapore': '🇸🇬',
        'South Korea': '🇰🇷',
        'USA': '🇺🇸',
    };

    return Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count, flag: flagMap[country] || '🌍' }))
        .sort((a, b) => b.count - a.count);
}

// Get top members (first N from the list)
export function getTopMembers(members: Member[], limit = 10): Member[] {
    return members.slice(0, limit);
}

// Truncate wallet address for display
export function truncateWallet(wallet: string): string {
    if (!wallet || wallet.length < 12) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}
