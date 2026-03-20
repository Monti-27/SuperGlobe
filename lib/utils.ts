import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SKILLS_LIST = ['Rust', 'Solidity', 'Next.js', 'React', 'Mobile', 'Design', 'Full Stack', 'Backend', 'Frontend', 'DevOps'];

export function getMemberSkills(
  input: string | { wallet?: string | null; skills?: string[] | null }
): string[] {
  if (typeof input !== 'string' && input.skills && input.skills.length > 0) {
    return input.skills;
  }

  const wallet = typeof input === 'string' ? input : input.wallet || '';
  if (!wallet) return ['Frontend', 'React'];

  // Deterministic hash from wallet string
  let hash = 0;
  for (let i = 0; i < wallet.length; i++) {
    hash = ((hash << 5) - hash) + wallet.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Pick 2-3 skills based on hash
  const numSkills = (Math.abs(hash) % 2) + 2; // 2 or 3
  const skills = new Set<string>();

  // Use different parts of the hash to pick skills
  let currentHash = Math.abs(hash);
  for (let i = 0; i < numSkills; i++) {
    // Simple LCG-like step to mix it up
    currentHash = (currentHash * 1664525 + 1013904223) % 4294967296;
    const index = currentHash % SKILLS_LIST.length;
    skills.add(SKILLS_LIST[index]);
  }

  return Array.from(skills);
}

export function formatIntentLabel(intent: string) {
  return intent
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const TECH_COLORS: Record<string, string> = {
  'Rust': '#dea584',
  'Solidity': '#363636',
  'Next.js': '#000000',
  'React': '#61dafb',
  'Mobile': '#a4c639',
  'Design': '#ff61f6',
  'Full Stack': '#FFD700'
};
