'use client';

import { cn } from '@/lib/utils';

export interface TweetData {
  name: string;
  handle: string;
  avatar: string;
  content: string;
  tweetUrl: string;
  isVerified?: boolean;
  timestamp?: string;
}

interface TweetCardProps {
  tweet: TweetData;
  className?: string;
}

/**
 * Tweet-style testimonial card.
 * Adapted from KokonutUI TweetCard — glassmorphic dark-mode design
 * with avatar, verified badge, X logo, tweet text, and timestamp.
 */
export function TweetCard({ tweet, className }: TweetCardProps) {
  return (
    <div
      onClick={() => window.open(tweet.tweetUrl, '_blank', 'noopener,noreferrer')}
      className={cn(
        'relative isolate w-full overflow-hidden rounded-2xl p-[1px] cursor-pointer group',
        // Outer glass shell
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'hover:shadow-[0_8px_40px_rgba(0,0,0,0.55)]',
        'transition-all duration-300',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full rounded-[15px] p-5',
          'bg-[#0C0C0F]/90 backdrop-blur-xl',
          'border border-white/[0.06]',
          'group-hover:border-white/[0.12] transition-colors duration-300',
        )}
      >
        {/* Header */}
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/[0.08]">
              <img
                alt={tweet.name}
                className="h-full w-full object-cover"
                src={tweet.avatar}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white/90 truncate">
                    {tweet.name}
                  </span>
                  {tweet.isVerified !== false && (
                    <svg
                      className="h-[14px] w-[14px] flex-shrink-0 text-blue-400"
                      viewBox="0 0 22 22"
                      fill="currentColor"
                    >
                      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.144.271.587.703 1.087 1.24 1.443s1.167.554 1.813.571c.646-.017 1.275-.215 1.817-.571s.972-.856 1.245-1.443c.608.227 1.264.274 1.897.144.634-.131 1.217-.437 1.687-.883.445-.469.75-1.054.882-1.69.132-.633.083-1.29-.14-1.896.587-.273 1.084-.705 1.439-1.246.355-.54.552-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-white/30">
                  @{tweet.handle}
                </span>
              </div>

              {/* X logo */}
              <svg
                className="h-4 w-4 flex-shrink-0 text-white/20 group-hover:text-white/40 transition-colors"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-[13px] leading-relaxed text-white/60">
          {tweet.content}
        </p>

        {/* Timestamp */}
        {tweet.timestamp && (
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <span className="text-[11px] text-white/20">{tweet.timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
