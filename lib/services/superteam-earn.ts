

export interface Bounty {
    id: string;
    title: string;
    sponsor: string;
    prize: string;
    tokenAmount: number; // Numeric amount for sorting/sizing
    type: 'DEV' | 'DESIGN' | 'CONTENT' | 'GRANT';
    link: string;
    deadline: string;
    coordinates: { lat: number; lng: number };
}

// Helper to simulate API delay
export const fetchBounties = async (): Promise<Bounty[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_BOUNTIES;
};

const MOCK_BOUNTIES: Bounty[] = [
    {
        id: '1',
        title: 'Build a Solana Blinks Dashboard',
        sponsor: 'Solana Foundation',
        prize: '$5,000 USDC',
        tokenAmount: 5000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-20',
        coordinates: { lat: 37.7749, lng: -122.4194 } // San Francisco
    },
    {
        id: '2',
        title: 'Superteam Germany: Brand Identity Refresh',
        sponsor: 'Superteam Germany',
        prize: '$3,000 USDC',
        tokenAmount: 3000,
        type: 'DESIGN',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-15',
        coordinates: { lat: 51.1657, lng: 10.4515 } // Germany
    },
    {
        id: '3',
        title: 'Deep Dive Thread: Token Extensions',
        sponsor: 'Superteam UK',
        prize: '$700 USDC',
        tokenAmount: 700,
        type: 'CONTENT',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-18',
        coordinates: { lat: 51.5074, lng: -0.1278 } // London
    },
    {
        id: '4',
        title: 'Implement Compressed NFTs (cNFTs) Support',
        sponsor: 'Tensor',
        prize: '$8,000 USDC',
        tokenAmount: 8000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-06-01',
        coordinates: { lat: 25.2048, lng: 55.2708 } // Dubai (Common crypto hub)
    },
    {
        id: '5',
        title: 'Superteam Grid: Video Contest',
        sponsor: 'Superteam UAE',
        prize: '$2,500 USDC',
        tokenAmount: 2500,
        type: 'CONTENT',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-25',
        coordinates: { lat: 25.2048, lng: 55.2708 } // Dubai
    },
    {
        id: '6',
        title: 'Mobile Wallet Adapter Integration',
        sponsor: 'Solana Mobile',
        prize: '$10,000 USDC',
        tokenAmount: 10000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-06-10',
        coordinates: { lat: 37.7749, lng: -122.4194 } // SF
    },
    {
        id: '7',
        title: 'DeFi Dashboard UI Kit',
        sponsor: 'Superteam Vietnam',
        prize: '$1,500 USDC',
        tokenAmount: 1500,
        type: 'DESIGN',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-22',
        coordinates: { lat: 14.0583, lng: 108.2772 } // Vietnam
    },
    {
        id: '8',
        title: 'Write a Guide: Governance on Solana',
        sponsor: 'Realms',
        prize: '$1,200 USDC',
        tokenAmount: 1200,
        type: 'CONTENT',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-19',
        coordinates: { lat: 40.7128, lng: -74.0060 } // NYC
    },
    {
        id: '9',
        title: 'Superteam Nigeria: Community Merch Design',
        sponsor: 'Superteam Nigeria',
        prize: '$500 USDC',
        tokenAmount: 500,
        type: 'DESIGN',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-12',
        coordinates: { lat: 9.0820, lng: 8.6753 } // Nigeria
    },
    {
        id: '10',
        title: 'Build a Prediction Market dApp',
        sponsor: 'Drift Protocol',
        prize: '$6,000 USDC',
        tokenAmount: 6000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-06-05',
        coordinates: { lat: 1.3521, lng: 103.8198 } // Singapore
    },
    {
        id: '11',
        title: 'Superteam Turkey: Local Meetup Video',
        sponsor: 'Superteam Turkey',
        prize: '$400 USDC',
        tokenAmount: 400,
        type: 'CONTENT',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-14',
        coordinates: { lat: 38.9637, lng: 35.2433 } // Turkey
    },
    {
        id: '12',
        title: 'Rust Smart Contract Audit',
        sponsor: 'OtterSec',
        prize: '$15,000 USDC',
        tokenAmount: 15000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-06-15',
        coordinates: { lat: 37.7749, lng: -122.4194 } // SF
    },
    {
        id: '13',
        title: 'Superteam India: Podcast Editor',
        sponsor: 'Superteam India',
        prize: '$800 USDC',
        tokenAmount: 800,
        type: 'CONTENT',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-16',
        coordinates: { lat: 20.5937, lng: 78.9629 } // India
    },
    {
        id: '14',
        title: 'Create a Solana Pay Point of Sale App',
        sponsor: 'Solana Pay',
        prize: '$4,000 USDC',
        tokenAmount: 4000,
        type: 'DEV',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-30',
        coordinates: { lat: 37.7749, lng: -122.4194 } // SF
    },
    {
        id: '15',
        title: 'Superteam Mexico: Sticker Pack',
        sponsor: 'Superteam Mexico',
        prize: '$300 USDC',
        tokenAmount: 300,
        type: 'DESIGN',
        link: 'https://earn.superteam.fun/bounties',
        deadline: '2024-05-13',
        coordinates: { lat: 23.6345, lng: -102.5528 } // Mexico
    }
];
