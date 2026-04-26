import { memo } from "react";
import { VerifiedIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @author: @dorianbaffier
 * @description: Tweet Card (adapted for SuperGlobe)
 * @version: 1.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

type ReplyProps = {
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string;
  isVerified?: boolean;
  timestamp: string;
};

type TweetCardProps = {
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string[];
  isVerified?: boolean;
  timestamp: string;
  tweetUrl?: string;
  reply?: ReplyProps;
};

const TweetCard = memo(function TweetCard({
  authorName = "Dorian",
  authorHandle = "dorianbaffier",
  authorImage = "https://pbs.twimg.com/profile_images/1992215290936205312/N_EuwLUO_400x400.jpg",
  content = [
    "All components from KokonutUI can now be open in @v0 🎉",
    "1. Click on 'Open in V0'",
    "2. Customize with prompts",
    "3. Deploy to your app",
  ],
  isVerified = true,
  timestamp = "Jan 18, 2025",
  tweetUrl = "#",
  reply,
}: TweetCardProps) {
  return (
    <Link
      href={tweetUrl}
      target="_blank"
      prefetch={false}
    >
      <div
        className={cn(
          "relative isolate w-full overflow-hidden rounded-2xl p-1.5",
          "bg-zinc-900/95",
          "border border-zinc-800",
          "shadow-[0_6px_14px_rgb(0_0_0_/_0.26)]",
          "translate-z-0 will-change-transform"
        )}
      >
        <div
          className={cn(
            "relative w-full rounded-xl p-5",
            "bg-zinc-950",
            "border border-zinc-800",
            "text-zinc-100",
            "shadow-xs",
            "translate-z-0 will-change-transform",
            "before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-zinc-900/0 before:to-zinc-900/0 before:opacity-0 before:transition-opacity",
            "hover:before:opacity-100"
          )}
        >
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <img
                  alt={authorName}
                  className="h-full w-full object-cover"
                  src={authorImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="cursor-pointer font-semibold text-zinc-100 hover:underline">
                      {authorName}
                    </span>
                    {isVerified && (
                      <VerifiedIcon className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-sm text-zinc-400">
                    @{authorHandle}
                  </span>
                </div>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  type="button"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    height="1227"
                    viewBox="0 0 1200 1227"
                    width="1200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>X</title>
                    <path
                      d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2">
            {content.map((item, index) => (
              <p
                className="text-base text-zinc-200"
                key={index}
              >
                {item}
              </p>
            ))}
            <span className="mt-2 block text-sm text-zinc-400">
              {timestamp}
            </span>
          </div>

          {reply && (
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="h-10 w-10 overflow-hidden rounded-full">
                    <img
                      alt={reply.authorName}
                      className="h-full w-full object-cover"
                      src={reply.authorImage}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="cursor-pointer font-semibold text-zinc-100 hover:underline">
                      {reply.authorName}
                    </span>
                    {reply.isVerified && (
                      <VerifiedIcon className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="text-sm text-zinc-400">
                      @{reply.authorHandle}
                    </span>
                    <span className="text-sm text-zinc-400">
                      ·
                    </span>
                    <span className="text-sm text-zinc-400">
                      {reply.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-300">
                    {reply.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

export default TweetCard;
