import { Suspense } from 'react';
import { fetchMemberById } from '@/lib/services/member-roster';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { getCurrentUserContext } from '@/lib/auth-session';
import { notFound } from 'next/navigation';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const member = await fetchMemberById(decodeURIComponent(resolvedParams.id));
  
  if (!member) {
    return {
      title: 'Builder Not Found | SuperGlobe',
    };
  }

  return {
    title: `${member.name} | SuperGlobe Builder Profile`,
    description: member.bio || `View ${member.name}'s builder profile on SuperGlobe.`,
  };
}

async function ProfileData({ id }: { id: string }) {
  const currentUser = await getCurrentUserContext();
  const viewerWallet = currentUser?.wallet || null;
  const member = await fetchMemberById(id, { viewerWallet });

  if (!member) {
    notFound();
  }

  return <ProfileLayout member={member} initialIsOwner={viewerWallet === member.wallet} />;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const memberId = decodeURIComponent(resolvedParams.id);
  
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileData id={memberId} />
    </Suspense>
  );
}
