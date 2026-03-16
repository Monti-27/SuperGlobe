import { unstable_cache } from 'next/cache';
import { GlobeExperience } from '@/components/globe/GlobeExperience';
import { getCountryStats } from '@/lib/mock-data';
import { fetchMemberRoster } from '@/lib/services/member-roster';
import { fetchLiveOpportunities } from '@/lib/services/superteam-live';

const loadGlobeRouteData = unstable_cache(
  async () => {
    const [roster, opportunitiesPayload] = await Promise.all([
      fetchMemberRoster({}),
      fetchLiveOpportunities().catch((error) => {
        console.error('Failed to fetch live opportunities for globe route:', error);
        return {
          opportunities: [],
          meta: {
            source: 'fallback',
            fetchedAt: new Date().toISOString(),
            cacheTtlSeconds: 60,
          },
        };
      }),
    ]);

    return {
      members: roster.members,
      countryStats: getCountryStats(roster.members),
      opportunities: opportunitiesPayload.opportunities,
    };
  },
  ['globe-route-data'],
  { revalidate: 300 }
);

export default async function GlobePage() {
  const data = await loadGlobeRouteData();

  return (
    <GlobeExperience
      initialMembers={data.members}
      initialCountryStats={data.countryStats}
      initialOpportunities={data.opportunities}
    />
  );
}
