'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, MotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import TweetCard from '@/components/kokonutui/tweet-card';
import { FadeIn } from './fade-in';

/**
 * Tweet data for the parallax testimonial cards.
 */
interface TweetEntry {
  authorName: string;
  authorHandle: string;
  authorImage: string;
  content: string[];
  isVerified?: boolean;
  timestamp: string;
  tweetUrl: string;
}

/**
 * Real testimonial tweets from the Superteam community.
 * Data sourced from Twitter oEmbed API.
 * Profile images via unavatar.io (resolves real Twitter avatars).
 */
const TESTIMONIALS: TweetEntry[] = [
  {
    authorName: 'Suhas Sumukh',
    authorHandle: 'suhasasumukh',
    authorImage: 'https://unavatar.io/twitter/suhasasumukh',
    content: [
      'i was invited as a contributor to superteam in december 2023 by @abhwshek when I was just learning & building around solana.',
      '',
      'i was there when solana was at $18, $55, $108, $215, and will continue to be. still here, still bullish.',
      '',
      'superteam is a cheat code.',
    ],
    isVerified: true,
    timestamp: 'Mar 17, 2025',
    tweetUrl: 'https://twitter.com/suhasasumukh/status/1901613997901992296',
  },
  {
    authorName: 'Kash',
    authorHandle: 'kashdhanda',
    authorImage: 'https://unavatar.io/twitter/kashdhanda',
    content: [
      "if you're an aspiring Solana founder, getting involved with your local @superteam is the best way to grow.",
      '',
      "if you're a successful Solana founder, getting involved with your local @superteam is the best way to give back.",
    ],
    isVerified: true,
    timestamp: 'Oct 7, 2024',
    tweetUrl: 'https://twitter.com/kashdhanda/status/1843229841912717771',
  },
  {
    authorName: 'Grahil Khandelwal',
    authorHandle: 'grahilk',
    authorImage: 'https://unavatar.io/twitter/grahilk',
    content: [
      'Superteam has impacted many lives, as well as mine.',
      '',
      '- Earned my first crypto, first $1000, first $10,000...',
      '- Got my first internship and job.',
      '- Made really good friends and connections.',
      '- and many more countless memories.',
      '',
      'Here is my story with Superteam !!!',
    ],
    isVerified: true,
    timestamp: 'Feb 29, 2024',
    tweetUrl: 'https://twitter.com/grahilk/status/1763105821041320386',
  },
  {
    authorName: 'shek',
    authorHandle: 'shek_dev',
    authorImage: 'https://unavatar.io/twitter/shek_dev',
    content: [
      'Launching on @solana is simple',
      '',
      '1) Build a good product',
      '2) Tell your local @superteam about it',
      '',
      'Watch the entire ecosystem rally behind you, it is as simple as that',
    ],
    isVerified: true,
    timestamp: 'Jun 14, 2025',
    tweetUrl: 'https://twitter.com/shek_dev/status/1933898938375188729',
  },
  {
    authorName: 'Paarug Sethi',
    authorHandle: 'paarugsethi',
    authorImage: 'https://unavatar.io/twitter/paarugsethi',
    content: [
      'this is the only thread that matters — people paying off family debts, getting to spend time with their families, pursuing things they really love, and moving toward their dreams.',
      '',
      'all because they can earn global salaries while working remotely. the TCP/IP visa wins.',
    ],
    isVerified: true,
    timestamp: 'Mar 3, 2025',
    tweetUrl: 'https://twitter.com/paarugsethi/status/1896516328544186851',
  },
  {
    authorName: 'Superteam',
    authorHandle: 'superteam',
    authorImage: 'https://unavatar.io/twitter/superteam',
    content: ['What a week! 💜'],
    isVerified: true,
    timestamp: 'Sep 17, 2023',
    tweetUrl: 'https://twitter.com/superteam/status/1703332996483551538',
  },
  {
    authorName: 'Jay Patel',
    authorHandle: 'imjp19_',
    authorImage: 'https://unavatar.io/twitter/imjp19_',
    content: [
      'one year: from contributor to core team at @SuperteamIN',
      '',
      'grateful for it all—great people, great work, great times. Excited for what\'s next!',
      '',
      'special thanks to @AdityaShetts for the support',
      '',
      'remember: "superteam is the cheatcode"',
    ],
    isVerified: true,
    timestamp: 'Mar 13, 2025',
    tweetUrl: 'https://twitter.com/imjp19_/status/1900144398723146168',
  },
  {
    authorName: 'amrit',
    authorHandle: 'amritwt',
    authorImage: 'https://unavatar.io/twitter/amritwt',
    content: [
      'Superteam from Solana Foundation is the best community in the whole of cryptocurrency',
      '',
      "Can't even think of any other ones that come close for other ecosystems like Ethereum",
      '',
      'Proud to be a @SuperteamIN member',
    ],
    isVerified: true,
    timestamp: 'Apr 28, 2025',
    tweetUrl: 'https://twitter.com/amritwt/status/1916875074289672521',
  },
  {
    authorName: 'Yash',
    authorHandle: 'yashhsm',
    authorImage: 'https://unavatar.io/twitter/yashhsm',
    content: [
      'Solana Hackerhouse Bengaluru was truly special — went from being an attendee in 2022 to giving 4 talks/workshops/panels in 2024, thanks to @superteam.',
      '',
      'Best part; many folks have started to recognize me IRL; thanks to Twitter.',
      '',
      'We all grew up along with the Solana Ecosystem 🙏',
    ],
    isVerified: true,
    timestamp: 'Jul 28, 2024',
    tweetUrl: 'https://twitter.com/yashhsm/status/1817645789629559176',
  },
  {
    authorName: 'aryan | 🐂',
    authorHandle: '_0xaryan',
    authorImage: 'https://unavatar.io/twitter/_0xaryan',
    content: [
      'got invited as a contributor to superteam in jan 2023 by @neilshroff when I was building something for the grizzlython hackathon.',
      '',
      'one of the best things that happened to me.',
      '',
      'up only since then.',
    ],
    isVerified: true,
    timestamp: 'Mar 17, 2025',
    tweetUrl: 'https://twitter.com/_0xaryan/status/1901492324821237762',
  },
  {
    authorName: 'Srijan R Shetty',
    authorHandle: 'srijanshetty',
    authorImage: 'https://unavatar.io/twitter/srijanshetty',
    content: [
      'The cracked part about @superteam is that all of the members view life as a positive sum game, with an abundance mindset.',
      '',
      'Sincere and earnest builders wanting to build the pie and give it forward.',
      '',
      "And it's not easy to build something like this in crypto-land and India. Yet,…",
    ],
    isVerified: true,
    timestamp: 'Jun 22, 2025',
    tweetUrl: 'https://twitter.com/srijanshetty/status/1936688230113620045',
  },
  {
    authorName: 'Aditya',
    authorHandle: 'AdityaShetts',
    authorImage: 'https://unavatar.io/twitter/AdityaShetts',
    content: ['How do I become a superteam India member?'],
    isVerified: true,
    timestamp: 'Jan 30, 2025',
    tweetUrl: 'https://x.com/AdityaShetts/status/1884818818448654434',
  },
  {
    authorName: 'Jesco',
    authorHandle: 'Jesco_M',
    authorImage: 'https://unavatar.io/twitter/Jesco_M',
    content: [
      'Thanks 🙏 @SuperteamUK for organizing the most amazing event with 400 of the best leaders in the industry. This was better than any conference. Really have high expectations for @breakpoint 2026.',
      '',
      'Hope to connect with all of you!',
    ],
    isVerified: true,
    timestamp: 'Mar 12, 2026',
    tweetUrl: 'https://x.com/Jesco_M/status/2032152135391993909',
  },
  {
    authorName: 'Harkirat Singh',
    authorHandle: 'kirat_tw',
    authorImage: 'https://unavatar.io/twitter/kirat_tw',
    content: [
      'Announcing $10k @100xSchool x @superteam hackathon',
      '',
      '1. Project ideas',
      '2. Coding along as well',
      '',
      'Tune in',
    ],
    isVerified: true,
    timestamp: 'Sep 24, 2025',
    tweetUrl: 'https://x.com/kirat_tw/status/1970889624257270010',
  },
  {
    authorName: 'Harkirat Singh',
    authorHandle: 'kirat_tw',
    authorImage: 'https://unavatar.io/twitter/kirat_tw',
    content: [
      'About the fellowship:',
      '8 weeks.',
      'Free to attend.',
      'Fully remote.',
      '',
      'Open to anyone in the world with a laptop, internet connection and proof of work. Supported by @solana & @superteam',
      '',
      'Top 20 graduates win a $2500 stipend.',
    ],
    isVerified: true,
    timestamp: 'Jun 3, 2025',
    tweetUrl: 'https://x.com/kirat_tw/status/1929805167370948676',
  },
];

// Split 15 testimonials into 4 columns (4-4-4-3)
const COL_1 = [TESTIMONIALS[0], TESTIMONIALS[4], TESTIMONIALS[8], TESTIMONIALS[12]];
const COL_2 = [TESTIMONIALS[1], TESTIMONIALS[5], TESTIMONIALS[9], TESTIMONIALS[13]];
const COL_3 = [TESTIMONIALS[2], TESTIMONIALS[6], TESTIMONIALS[10], TESTIMONIALS[14]];
const COL_4 = [TESTIMONIALS[3], TESTIMONIALS[7], TESTIMONIALS[11]];

/**
 * Column of tweet cards that moves on scroll via framer-motion.
 */
function TweetColumn({
  tweets,
  y,
}: {
  tweets: TweetEntry[];
  y: MotionValue<number>;
}) {
  return (
    <motion.div
      className="relative flex w-1/4 min-w-[280px] flex-col gap-4 will-change-transform [contain:layout_paint_style]"
      style={{ y }}
    >
      {tweets.map((tweet, i) => (
        <TweetCard
          key={`${tweet.authorHandle}-${i}`}
          authorName={tweet.authorName}
          authorHandle={tweet.authorHandle}
          authorImage={tweet.authorImage}
          content={tweet.content}
          isVerified={tweet.isVerified}
          timestamp={tweet.timestamp}
          tweetUrl={tweet.tweetUrl}
        />
      ))}
    </motion.div>
  );
}

/**
 * Parallax testimonials section.
 *
 * Uses the Skiper30 parallax mechanic (framer-motion useScroll + useTransform + Lenis)
 * with KokonutUI tweet-style cards.
 */
export function ParallaxTestimonials() {
  const gallery = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(900);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  // Keep travel distances bounded to avoid huge transform jumps on large screens.
  const travel = Math.min(Math.max(height * 0.9, 520), 980);

  const y1Raw = useTransform(scrollYProgress, [0, 1], [-220, travel * 0.66]);
  const y2Raw = useTransform(scrollYProgress, [0, 1], [-340, travel]);
  const y3Raw = useTransform(scrollYProgress, [0, 1], [-160, travel * 0.48]);
  const y4Raw = useTransform(scrollYProgress, [0, 1], [-280, travel * 0.84]);

  // Add light spring smoothing to reduce perceived stutter from uneven scroll deltas.
  const y1 = useSpring(y1Raw, { stiffness: 85, damping: 24, mass: 0.3 });
  const y2 = useSpring(y2Raw, { stiffness: 85, damping: 24, mass: 0.3 });
  const y3 = useSpring(y3Raw, { stiffness: 85, damping: 24, mass: 0.3 });
  const y4 = useSpring(y4Raw, { stiffness: 85, damping: 24, mass: 0.3 });

  useEffect(() => {
    const resize = () => {
      setHeight(window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="community" className="relative w-full">
      {/* Section header */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 pt-24 pb-12">
        <FadeIn>
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-[#E2A336]/50 mb-3">
            Community Voices
          </p>
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-white">
            What builders are
            <br />
            <span className="text-white/35">saying on X</span>
          </h2>
        </FadeIn>
      </div>

      {/* Parallax gallery */}
      <div
        ref={gallery}
        className="relative box-border flex h-[145vh] gap-4 overflow-hidden px-4 md:px-6"
      >
        {/* Fade edges — top and bottom */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#09090B] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#09090B] to-transparent" />

        {/* 4 columns at different speeds & vertical offsets */}
        <TweetColumn tweets={COL_1} y={y1} />
        <TweetColumn tweets={COL_2} y={y2} />
        <TweetColumn tweets={COL_3} y={y3} />
        <TweetColumn tweets={COL_4} y={y4} />
      </div>
    </section>
  );
}
