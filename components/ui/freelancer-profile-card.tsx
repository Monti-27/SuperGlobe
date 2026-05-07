import * as React from 'react';
import { AnimatePresence, HTMLMotionProps, Variants, motion } from 'framer-motion';
import { Bookmark, Check, Copy, Globe2, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GitHubContributionHeatmap } from '@/components/ui/github-contribution-heatmap';
import { normalizeSocialUrl } from '@/lib/social-links';
import { AwardBadge } from '@/components/ui/award-badge';

interface SocialSet {
  x?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

interface GitHubProfile {
  username?: string;
  avatarUrl?: string;
  profileUrl?: string;
  heatmapUrl?: string;
  contributions?: {
    totalLastYear: number;
    totalCurrentYear: number;
    maxDailyCount: number;
    days: Array<{
      date: string;
      count: number;
      level: number;
    }>;
  } | null;
  topRepos?: Array<{
    name: string;
    url: string;
    description?: string;
    stars?: number;
    language?: string;
  }>;
}

interface FreelancerProfileCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  name: string;
  title: string;
  avatarSrc: string;
  bannerSrc: string;
  rating: number;
  duration: string;
  rate: string;
  tools: React.ReactNode;
  wallet?: string;
  onGetInTouch?: () => void;
  onBookmark?: (e: React.MouseEvent) => void;
  className?: string;
  isExpanded?: boolean;
  bio?: string | null;
  socials?: SocialSet | null;
  github?: GitHubProfile | null;
  profileUrl?: string;
  isSuperteam?: boolean;
}

const springConfig = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
  hover: {
    y: -5,
    transition: { duration: 0.2 },
  },
};

export const FreelancerProfileCard = React.forwardRef<HTMLDivElement, FreelancerProfileCardProps>(
  (
    {
      className,
      name,
      title,
      avatarSrc,
      bannerSrc,
      rating,
      duration,
      rate,
      tools,
      wallet = '0x...',
      onGetInTouch,
      onBookmark,
      isExpanded = false,
      onClick,
      bio,
      socials,
      github,
      profileUrl,
      isSuperteam,
      ...props
    },
    ref
  ) => {
    const avatarName = name
      .split(' ')
      .map((part) => part[0])
      .join('');

    const [copied, setCopied] = React.useState(false);

    const stopCardToggle = React.useCallback((event: React.SyntheticEvent) => {
      event.stopPropagation();
    }, []);

    const handleCardClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as Element | null;

        if (target?.closest?.('[data-card-interactive="true"]')) {
          return;
        }

        onClick?.(event);
      },
      [onClick]
    );

    const handleCopy = (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const socialItems = [
      socials?.x ? { label: 'X', href: normalizeSocialUrl('x', socials.x) } : null,
      socials?.linkedin ? { label: 'LinkedIn', href: normalizeSocialUrl('linkedin', socials.linkedin) } : null,
      socials?.github ? { label: 'GitHub', href: normalizeSocialUrl('github', socials.github) } : null,
      socials?.website ? { label: 'Website', href: normalizeSocialUrl('website', socials.website) } : null,
    ].filter((item): item is { label: string; href: string } => Boolean(item?.href));

    return (
      <motion.div
        ref={ref}
        layout
        className={cn(
          'relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-card shadow-lg',
          isExpanded ? 'row-span-2 z-20 col-span-1 lg:col-span-2' : 'z-0 row-span-1 col-span-1',
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover={!isExpanded ? 'hover' : undefined}
        onClick={handleCardClick}
        transition={{ layout: springConfig }}
        {...props}
      >
        <motion.div layout className={cn('w-full transition-all duration-500', isExpanded ? 'h-48' : 'h-32')}>
          <img src={bannerSrc} alt={`${name} banner`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-50" />
        </motion.div>

        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {profileUrl && (
            <Link 
              href={profileUrl}
              data-card-interactive="true"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 text-card-foreground/80 backdrop-blur-sm hover:bg-background/70 hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}

        </div>

        <motion.div
          layout
          className={cn('absolute left-6 transition-all duration-500', isExpanded ? 'top-40' : 'top-24')}
        >
          <Avatar className={cn('border-4 border-card transition-all duration-500', isExpanded ? 'h-24 w-24' : 'h-20 w-20')}>
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback>{avatarName}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div className={cn('px-6 pb-6 transition-all duration-500', isExpanded ? 'pt-16' : 'pt-12')}>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <motion.h2 layout="position" className="text-xl font-semibold text-card-foreground">
                  {name}
                </motion.h2>
                <motion.button
                  layout="position"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group/copy relative z-20 flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10"
                  data-card-interactive="true"
                  onClick={handleCopy}
                  onMouseDown={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  onTouchStart={(event) => event.stopPropagation()}
                >
                  <span className="font-mono text-[10px] text-muted-foreground transition-colors group-hover/copy:text-foreground">
                    {wallet.slice(0, 4)}...{wallet.slice(-4)}
                  </span>
                  {copied ? (
                    <Check className="h-3 w-3 text-[#14F195]" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground group-hover/copy:text-foreground" />
                  )}
                </motion.button>
              </div>
              {isSuperteam && (
                <div className="mt-1 mb-2 max-w-[140px]">
                  <AwardBadge type="verified-member" />
                </div>
              )}
              <motion.p layout="position" className="text-sm text-muted-foreground">
                {title}
              </motion.p>
            </div>

            <motion.div layout="position" className="flex flex-col items-start gap-1.5 sm:items-end">
              <div className="flex flex-wrap gap-1.5">{tools}</div>
              <span className="text-xs text-muted-foreground">Tech Stack</span>
            </motion.div>
          </div>

          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground">About</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {bio || `${title} active inside the Superteam network.`}
                      </p>
                    </div>

                    {socialItems.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Links</h3>
                        <div className="flex flex-wrap gap-2">
                          {socialItems.map((item) => (
                            <a
                              key={`${item.label}-${item.href}`}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              data-card-interactive="true"
                              onClick={stopCardToggle}
                              onMouseDown={stopCardToggle}
                              onPointerDown={stopCardToggle}
                              onTouchStart={stopCardToggle}
                              className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Globe2 className="h-3.5 w-3.5" />
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {github?.contributions ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">GitHub activity</h3>
                        <GitHubContributionHeatmap activity={github.contributions} />
                      </div>
                    ) : github?.heatmapUrl ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">GitHub activity</h3>
                        <div className="overflow-hidden rounded-2xl border border-white/6 bg-black/30 p-2">
                          <img src={github.heatmapUrl} alt="GitHub activity heatmap" className="w-full rounded-xl opacity-90" />
                        </div>
                      </div>
                    ) : null}

                    {github?.topRepos?.length ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Featured repos</h3>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {github.topRepos.slice(0, 3).map((repo) => (
                            <a
                              key={repo.url}
                              href={repo.url}
                              target="_blank"
                              rel="noreferrer"
                              data-card-interactive="true"
                              onClick={stopCardToggle}
                              onMouseDown={stopCardToggle}
                              onPointerDown={stopCardToggle}
                              onTouchStart={stopCardToggle}
                              className="rounded-2xl border border-white/6 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                            >
                              <div className="text-sm text-white">{repo.name}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {repo.language || 'Repository'} · {repo.stars || 0} stars
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {profileUrl ? (
                      <Link
                        href={profileUrl}
                        data-card-interactive="true"
                        onClick={stopCardToggle}
                        className="block mt-4"
                      >
                        <Button
                          className="w-full bg-white font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
                          size="default"
                        >
                          View Full Profile
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full mt-4 bg-white font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
                        size="default"
                        data-card-interactive="true"
                        onClick={onGetInTouch}
                      >
                        Connect with {name.split(' ')[0]}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }
);

FreelancerProfileCard.displayName = 'FreelancerProfileCard';

