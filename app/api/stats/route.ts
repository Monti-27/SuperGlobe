import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const stats = await prisma.member.groupBy({
            by: ['country'],
            _count: { country: true },
            orderBy: { _count: { country: 'desc' } },
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
        };

        const countries = stats.map(s => ({
            country: s.country,
            count: s._count.country,
            flag: flagMap[s.country] || '🌍',
        }));

        const total = countries.reduce((sum, c) => sum + c.count, 0);

        return NextResponse.json({ countries, total });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
