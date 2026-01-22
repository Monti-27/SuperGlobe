
// Hash string to number
export const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// Top Tech Stacks
export const TECH_STACKS = [
    'Rust',
    'Solidity',
    'Next.js',
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'Go',
    'Design',
    'Mobile'
];

// Deterministically generate skills based on wallet address
export const getMemberSkills = (wallet: string): string[] => {
    const hash = hashCode(wallet);
    const skills: string[] = [];

    // Use different bits of the hash to determine skills
    // We want each person to have 2-4 skills
    const numberOfSkills = (hash % 3) + 2;

    // Create a copy of stacks to pick from
    const availableStacks = [...TECH_STACKS];

    // Shuffle deterministically based on hash
    let currentHash = hash;
    for (let i = 0; i < numberOfSkills; i++) {
        const index = currentHash % availableStacks.length;
        skills.push(availableStacks[index]);
        availableStacks.splice(index, 1);

        // Re-hash for next pick
        currentHash = hashCode(currentHash.toString() + wallet);
    }

    return skills;
};

// Tech Filter Colors
export const TECH_COLORS: Record<string, string> = {
    'Rust': '#dea584',
    'Solidity': '#656565', // Using a lighter grey for visibility on dark bg, originally #363636
    'Next.js': '#ffffff',
    'React': '#61dafb',
    'TypeScript': '#3178c6',
    'Node.js': '#339933',
    'Python': '#3776ab',
    'Go': '#00add8',
    'Design': '#ff69b4',
    'Mobile': '#a4c639'
};
