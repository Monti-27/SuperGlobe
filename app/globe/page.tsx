import { GlobeExperience } from '@/components/globe/GlobeExperience';
import { getCountryStats } from '@/lib/mock-data';
import { fetchMemberRoster } from '@/lib/services/member-roster';
import { fetchLiveOpportunities } from '@/lib/services/superteam-live';

export const dynamic = 'force-dynamic';

export default async function GlobePage() {
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

  return (
    <GlobeExperience
      initialMembers={roster.members}
      initialCountryStats={getCountryStats(roster.members)}
      initialOpportunities={opportunitiesPayload.opportunities}
    />
  );
}
