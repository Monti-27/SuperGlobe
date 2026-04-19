'use client';

import React from 'react';
import { MemberRosterRecord } from '@/lib/services/member-roster';
import { cn, getMemberSkills } from '@/lib/utils';
import { MapPin, Star, Wallet, Github, Linkedin, Globe, CheckCircle2, ArrowLeft, Edit2 } from 'lucide-react';
import { XIcon } from '@/components/ui/x-icon';
import { formatIntentLabel } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BuilderOnboardingDialog } from '@/components/onboarding/BuilderOnboardingDialog';
import { AwardBadge } from '@/components/ui/award-badge';

interface ProfileLayoutProps {
  member: MemberRosterRecord;
  initialIsOwner?: boolean;
}

function getWalletBanner(wallet: string): string {
  const palette = [
    ['#1d1731', '#2d4c7d'],
    ['#1f2a38', '#205767'],
    ['#2e1a3e', '#823c79'],
    ['#1a2e2c', '#237c66'],
    ['#2d1b1b', '#915744'],
  ];

  let hash = 0;
  for (let i = 0; i < wallet.length; i++) {
    hash = (hash << 5) - hash + wallet.charCodeAt(i);
    hash |= 0;
  }

  const [from, to] = palette[Math.abs(hash) % palette.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect fill='url(#g)' width='1200' height='400'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function ProfileImage({
  src,
  alt,
  className,
  skeletonClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse rounded-[inherit] bg-zinc-800',
            skeletonClassName
          )}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          className,
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}

export function ProfileLayout({ member, initialIsOwner = false }: ProfileLayoutProps) {
  const [currentWallet, setCurrentWallet] = useState<string | null>(initialIsOwner ? member.wallet : null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/me/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.wallet) {
          setCurrentWallet(data.user.wallet);
        }
      })
      .catch(() => {});
  }, []);

  const isOwner = currentWallet === member.wallet;

  const skills = getMemberSkills(member);
  const title = skills.length > 0 ? `${skills[0]} Builder` : 'Web3 Builder';
  const avatar = member.avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(member.name)}`;
  const banner = getWalletBanner(member.wallet);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-12 px-4 md:px-8 relative">
      <Link 
        href="/globe" 
        className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Globe
      </Link>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl relative">
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 z-10 flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                <Edit2 className="w-3 h-3" />
                Edit Profile
              </button>
            )}
            <div className="h-32 w-full relative">
              <ProfileImage src={banner} alt={`${member.name} profile banner`} className="w-full h-full object-cover" />
            </div>
            
            <div className="px-6 pb-8 pt-0 relative flex flex-col items-center">
              <div className="h-28 w-28 rounded-full border-4 border-zinc-900 overflow-hidden relative -mt-14 mb-4 bg-zinc-800 shadow-xl">
                <ProfileImage
                  src={avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  skeletonClassName="rounded-full"
                />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                {member.name}
                {member.wallet && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </h1>
              <p className="text-zinc-400 text-sm font-medium">{title}</p>
              {member.isSuperteam && (
                <div className="mt-4 w-full flex justify-center">
                  <AwardBadge type="verified-member" className="w-[180px]" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-6">Confirmed Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Wallet</p>
                  <p className="text-sm font-mono">{member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-sm">{member.city ? `${member.city}, ` : ''}{member.country}</p>
                </div>
              </div>

              {member.intents && member.intents.length > 0 && (
                <div className="flex items-center gap-4 text-zinc-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/20">
                    <Star className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider mb-0.5">Status</p>
                    <p className="text-sm font-medium text-emerald-100">{formatIntentLabel(member.intents[0])}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="rounded-3xl bg-zinc-900 border border-white/10 p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6 font-serif">About {member.name.split(' ')[0]}</h2>
            
            {member.bio ? (
              <p className="text-zinc-300 text-lg leading-relaxed mb-8 font-light">
                {member.bio}
              </p>
            ) : (
              <p className="text-zinc-500 text-lg leading-relaxed mb-8 italic">
                This builder hasn&apos;t added a bio yet.
              </p>
            )}

            {skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Tech Stack & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.socials && Object.values(member.socials).some(Boolean) && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Connect</h3>
                <div className="flex gap-3">
                  {member.socials.x && (
                    <a href={member.socials.x} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <XIcon className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <Github className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <Linkedin className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {member.socials.website && (
                    <a href={member.socials.website} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                      <Globe className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {member.github?.heatmapUrl && (
            <div className="rounded-3xl bg-zinc-900 border border-white/10 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                  <Github className="w-6 h-6" />
                  GitHub Contributions
                </h2>
                {member.github.contributions && (
                  <div className="text-sm text-zinc-400 font-medium">
                    <span className="text-white font-bold">{member.github.contributions.totalLastYear}</span> contributions last year
                  </div>
                )}
              </div>
              <div className="w-full overflow-hidden rounded-xl bg-zinc-950 p-6 border border-zinc-800 min-h-[180px]">
                <ProfileImage
                  src={member.github.heatmapUrl} 
                  alt="GitHub Heatmap" 
                  className="w-full h-auto hue-rotate-180 invert opacity-80" 
                  skeletonClassName="rounded-xl"
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {isEditing && (
        <BuilderOnboardingDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          onFinished={() => window.location.reload()}
        />
      )}
    </div>
  );
}
