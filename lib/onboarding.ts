export const ONBOARDING_STEPS = [
  'WELCOME',
  'AUTH',
  'IDENTITY',
  'SOCIALS',
  'SKILLS',
  'INTENT',
  'REVIEW',
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number];

export type ProfileStatus =
  | 'unauthenticated'
  | 'authenticated_incomplete'
  | 'authenticated_completed_private'
  | 'authenticated_completed_public';

export const CURATED_SKILL_TAGS = [
  { slug: 'rust', label: 'Rust', category: 'Engineering' },
  { slug: 'solidity', label: 'Solidity', category: 'Engineering' },
  { slug: 'nextjs', label: 'Next.js', category: 'Frontend' },
  { slug: 'react', label: 'React', category: 'Frontend' },
  { slug: 'mobile', label: 'Mobile', category: 'Product' },
  { slug: 'design', label: 'Design', category: 'Design' },
  { slug: 'full-stack', label: 'Full Stack', category: 'Engineering' },
  { slug: 'backend', label: 'Backend', category: 'Engineering' },
  { slug: 'frontend', label: 'Frontend', category: 'Frontend' },
  { slug: 'devops', label: 'DevOps', category: 'Engineering' },
  { slug: 'product', label: 'Product', category: 'Product' },
  { slug: 'community', label: 'Community', category: 'Growth' },
  { slug: 'growth', label: 'Growth', category: 'Growth' },
  { slug: 'content', label: 'Content', category: 'Growth' },
  { slug: 'ai-agents', label: 'AI Agents', category: 'Engineering' },
  { slug: 'zk', label: 'ZK', category: 'Engineering' },
  { slug: 'defi', label: 'DeFi', category: 'Domain' },
  { slug: 'depin', label: 'DePIN', category: 'Domain' },
  { slug: 'governance', label: 'Governance', category: 'Domain' },
  { slug: 'security', label: 'Security', category: 'Engineering' },
  { slug: 'research', label: 'Research', category: 'Domain' },
  { slug: 'writing', label: 'Writing', category: 'Growth' },
  { slug: 'animation', label: 'Animation', category: 'Design' },
  { slug: 'branding', label: 'Branding', category: 'Design' },
  { slug: 'data', label: 'Data', category: 'Engineering' },
  { slug: 'typescript', label: 'TypeScript', category: 'Engineering' },
  { slug: 'solana', label: 'Solana', category: 'Domain' },
  { slug: 'smart-contracts', label: 'Smart Contracts', category: 'Engineering' },
  { slug: 'wallets', label: 'Wallet UX', category: 'Product' },
  { slug: 'ecosystem', label: 'Ecosystem Ops', category: 'Growth' },
] as const;

export const INTENT_OPTIONS = [
  { value: 'OPEN_TO_COLLAB', label: 'Open to collab' },
  { value: 'HIRING', label: 'Hiring' },
  { value: 'FREELANCE', label: 'Available for freelance' },
  { value: 'MENTORING', label: 'Mentoring' },
  { value: 'COFOUNDER', label: 'Looking for cofounder' },
  { value: 'LEARNING', label: 'Learning in public' },
] as const;

export const SOCIAL_TYPES = ['X', 'LINKEDIN', 'GITHUB', 'WEBSITE'] as const;

export const ONBOARDING_STEP_META: Record<
  OnboardingStep,
  { label: string; description: string }
> = {
  WELCOME: {
    label: 'Welcome',
    description: 'Understand how profiles unlock discovery and matching.',
  },
  AUTH: {
    label: 'Identity',
    description: 'Create your account with wallet and email.',
  },
  IDENTITY: {
    label: 'Basic Profile',
    description: 'Set your public identity and location.',
  },
  SOCIALS: {
    label: 'Socials',
    description: 'Add your public links and connect GitHub.',
  },
  SKILLS: {
    label: 'Skills',
    description: 'Select the skills people should discover you for.',
  },
  INTENT: {
    label: 'Intent',
    description: 'Tell the network how you want to collaborate.',
  },
  REVIEW: {
    label: 'Review',
    description: 'Check your profile and publish when ready.',
  },
};

export interface SkillCatalogItem {
  slug: string;
  label: string;
  category?: string | null;
}

export interface OnboardingPayload {
  currentStep: OnboardingStep;
  completedAt: string | null;
  skippedAt: string | null;
  profile: {
    displayName: string;
    bio: string;
    avatarUrl: string;
    country: string;
    city: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    isPublished: boolean;
  };
  auth: {
    email: string;
    wallet: string;
  };
  socials: {
    x: string;
    linkedin: string;
    github: string;
    website: string;
  };
  github: {
    username: string;
    avatarUrl: string;
    profileUrl: string;
    heatmapUrl: string;
    contributions: {
      totalLastYear: number;
      totalCurrentYear: number;
      maxDailyCount: number;
      days: Array<{
        date: string;
        count: number;
        level: number;
      }>;
    } | null;
    topRepos: Array<{
      name: string;
      url: string;
      description: string;
      stars: number;
      language: string;
    }>;
  } | null;
  skills: {
    selected: string[];
    custom: string[];
    catalog: SkillCatalogItem[];
  };
  intents: string[];
}
