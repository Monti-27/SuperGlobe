import { Suspense } from 'react';
import { fetchMemberById } from '@/lib/services/member-roster';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { getCurrentViewerWallet } from '@/lib/auth-session';
import { notFound } from 'next/navigation';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);
  const readable = id.startsWith('profile-') ? 'Builder Profile' : id;

  return {
    title: `${readable} | SuperGlobe`,
    description: 'View this builder profile on SuperGlobe.',
  };
}

async function ProfileData({ id }: { id: string }) {
  const viewerWallet = await getCurrentViewerWallet();
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
