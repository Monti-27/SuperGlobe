'use client';

/**
 * Live Opportunities bento card with auto-scrolling opportunity listings.
 * Displays real bounty data with project icons, USDC amounts, tags, and badges.
 */

const opportunities = [
    {
        title: 'Ranger Build-A-Bear Hackathon Main Track',
        org: 'Ranger',
        verified: false,
        type: 'Bounty',
        due: '23d',
        comments: undefined,
        badge: 'FEATURED' as const,
        amount: '1M',
        currency: 'USDC',
        icon: {
            bg: 'bg-[#0A110D]',
            border: 'border-white/10',
            svg: (
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#B2F53E]">
                    <path d="M4 20L20 4M4 14L14 4M10 20L20 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ),
            padded: true,
        },
    },
    {
        title: 'Rebuild production backend systems as on-chain Rust programs',
        org: 'Superteam Poland',
        verified: true,
        type: 'Bounty',
        due: '2d',
        comments: 18,
        badge: undefined,
        amount: '1,000',
        currency: 'USDC',
        icon: {
            bg: 'bg-[#E53935]',
            border: 'border-white/10',
            svg: (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 relative z-10">
                        <circle cx="9" cy="9" r="4" />
                        <rect x="11" y="11" width="7" height="7" rx="1.5" />
                    </svg>
                </>
            ),
            padded: false,
        },
    },
    {
        title: 'TokenTon26 - Consumer Apps Track $8500 Prize Pool',
        org: 'DeAura Capital Group',
        verified: false,
        type: 'Bounty',
        due: '5d',
        comments: 6,
        badge: undefined,
        amount: '8,500',
        currency: 'USDC',
        icon: {
            bg: 'bg-[#0A1A1A]',
            border: 'border-[#20B2AA]/30',
            svg: (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#20B2AA]">
                    <path d="M6 4H12C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20H6V4Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M6 4L14 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            ),
            padded: false,
        },
    },
    {
        title: 'Adrena x Autonom: Trading Competition Design & Development',
        org: 'Superteam Ireland',
        verified: true,
        type: 'Bounty',
        due: '10d',
        comments: 7,
        badge: 'PRO' as const,
        amount: '5,000',
        currency: 'USDG',
        icon: {
            bg: 'bg-[#1E4620]',
            border: 'border-white/10',
            svg: (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 relative z-10">
                        <circle cx="9" cy="9" r="4" />
                        <rect x="11" y="11" width="7" height="7" rx="1.5" />
                    </svg>
                </>
            ),
            padded: false,
        },
    },
    {
        title: 'HelpBnk x Superteam | Business Challenge',
        org: 'Superteam UK',
        verified: true,
        type: 'Bounty',
        due: '18d',
        comments: 5,
        badge: undefined,
        amount: '10k',
        currency: 'USDG',
        icon: {
            bg: 'bg-gradient-to-br from-blue-700 to-red-600',
            border: 'border-white/10',
            svg: (
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 relative z-10">
                    <circle cx="9" cy="9" r="4" />
                    <rect x="11" y="11" width="7" height="7" rx="1.5" />
                </svg>
            ),
            padded: false,
        },
    },
    {
        title: 'Ranger Build-A-Bear Hackathon Drift Side Track',
        org: 'Ranger',
        verified: false,
        type: 'Bounty',
        due: '23d',
        comments: undefined,
        badge: undefined,
        amount: '200k',
        currency: 'USDC',
        icon: {
            bg: 'bg-[#0A110D]',
            border: 'border-white/10',
            svg: (
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#B2F53E]">
                    <path d="M4 20L20 4M4 14L14 4M10 20L20 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ),
            padded: true,
        },
    },
];

function OpportunityRow({ opp }: { opp: (typeof opportunities)[0] }) {
    return (
        <a
            href="#"
            className="group/row flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
        >
            {/* Icon */}
            <div
                className={`w-[38px] h-[38px] rounded-[10px] ${opp.icon.bg} ${opp.icon.border} flex items-center justify-center flex-shrink-0 relative overflow-hidden ${opp.icon.padded ? 'p-1.5' : ''}`}
            >
                {opp.icon.svg}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-[13px] font-medium text-zinc-200 truncate group-hover/row:text-amber-400 transition-colors">
                    {opp.title}
                </h3>
                <div className="flex items-center gap-1 mt-[2px]">
                    <span className="text-[11px] text-zinc-400 truncate">{opp.org}</span>
                    {opp.verified && (
                        <svg className="w-3 h-3 text-[#3B82F6] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    )}
                </div>
                <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-zinc-500 font-medium tracking-wide">
                    <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {opp.type}
                    </span>
                    <span className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                    <span>Due in {opp.due}</span>
                    {opp.badge === 'FEATURED' && (
                        <>
                            <span className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-0.5 text-[#A855F7] font-semibold">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                FEATURED
                            </span>
                        </>
                    )}
                    {opp.badge === 'PRO' && (
                        <>
                            <span className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-0.5 text-zinc-300 font-semibold">
                                <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L1 21h22L12 2zm0 3.99L18.53 19H5.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
                                </svg>
                                PRO
                            </span>
                        </>
                    )}
                    {opp.comments !== undefined && (
                        <>
                            <span className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-0.5">
                                <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {opp.comments}
                            </span>
                        </>
                    )}

                </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col items-end flex-shrink-0 pl-2">
                <div className="flex items-center gap-1">
                    {opp.currency === 'USDC' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="w-3.5 h-3.5">
                            <path fill="#3e73c4" d="M8 16c4.4183 0 8-3.5817 8-8 0-4.41828-3.5817-8-8-8C3.58172 0 0 3.58172 0 8c0 4.4183 3.58172 8 8 8Z" strokeWidth="0.5" />
                            <path fill="#ffffff" d="M10.01105 9.062c0-1.062-0.64-1.426-1.92-1.578-0.914-0.1215-1.0965-0.364-1.0965-0.789 0-0.425 0.305-0.698 0.914-0.698 0.5485 0 0.8535 0.182 1.0055 0.6375 0.0158 0.04405 0.04475 0.0822 0.08295 0.10925 0.03815 0.0271 0.0837 0.04185 0.13055 0.04225h0.4875c0.02815 0.00075 0.05615-0.0042 0.08235-0.0146 0.02615-0.0104 0.04995-0.02605 0.0699-0.0459 0.01995-0.01985 0.0357-0.0436 0.0462-0.0697 0.01055-0.02615 0.01565-0.05415 0.01505-0.0823v-0.03c-0.0596-0.32955-0.22635-0.6302-0.47435-0.85525-0.248-0.22505-0.5634-0.36185-0.89715-0.38925V4.571005c0-0.1215-0.0915-0.2125-0.2435-0.243h-0.4575c-0.1215 0-0.213 0.091-0.2435 0.243V5.269c-0.9145 0.121-1.493 0.728-1.493 1.487 0 1.001 0.609 1.3955 1.889 1.5475 0.8535 0.1515 1.1275 0.334 1.1275 0.8195 0 0.485-0.4265 0.819-1.0055 0.819-0.7925 0-1.0665-0.3335-1.158-0.789-0.03-0.121-0.122-0.182-0.2135-0.182h-0.518c-0.02815-0.0007-0.0561 0.00435-0.0822 0.0148-0.02615 0.0104-0.04985 0.02605-0.0698 0.0459-0.0199 0.01985-0.03555 0.04355-0.04605 0.06965-0.0105 0.0261-0.0156 0.05405-0.01495 0.08215v0.03c0.1215 0.759 0.6095 1.305 1.615 1.457v0.7285c0 0.121 0.0915 0.2125 0.2435 0.2425h0.4575c0.1215 0 0.213-0.091 0.2435-0.2425V10.67c0.9145-0.1515 1.5235-0.789 1.5235-1.6085v0.0005Z" strokeWidth="0.5" />
                            <path fill="#ffffff" d="M6.446 12.2485c-2.37698-0.85-3.59598-3.49-2.71198-5.8265 0.457-1.275 1.46248-2.2455 2.71198-2.701 0.122-0.0605 0.1825-0.1515 0.1825-0.3035v-0.425c0-0.121-0.0605-0.212-0.1825-0.2425-0.0305 0-0.0915 0-0.122 0.03-0.68575 0.21416-1.3224 0.561865-1.87327 1.023085-0.550855 0.461225-1.00503 1.026855-1.336385 1.664315-0.331355 0.6375-0.53334 1.3342-0.59432 2.05005-0.06098 0.71585 0.020245 1.4367 0.238995 2.12105 0.548 1.7 1.8585 3.005 3.56498 3.551 0.122 0.0605 0.244 0 0.274-0.1215 0.0305-0.03 0.0305-0.061 0.0305-0.1215v-0.425c0-0.091-0.091-0.212-0.1825-0.273Zm3.23-9.468c-0.122-0.061-0.244 0-0.274 0.121-0.0305 0.0305-0.0305 0.061-0.0305 0.1215v0.425c0 0.1215 0.091 0.2425 0.1825 0.3035 2.377 0.85 3.596 3.49 2.712 5.8265-0.457 1.275-1.4625 2.2455-2.712 2.701-0.122 0.0605-0.1825 0.1515-0.1825 0.3035v0.425c0 0.121 0.0605 0.212 0.1825 0.2425 0.0305 0 0.0915 0 0.122-0.03 0.6858-0.21415 1.32245-0.56185 1.8733-1.0231 0.55085-0.4612 1.00505-1.02685 1.3364-1.6643 0.33135-0.6375 0.53335-1.3342 0.5943-2.05005 0.061-0.71585-0.02025-1.4367-0.239-2.12105-0.548-1.73-1.889-3.035-3.565-3.581Z" strokeWidth="0.5" />
                        </svg>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src="/USDG.svg" alt="USDG" className="w-3.5 h-3.5 rounded-full" />
                    )}
                    <span className="text-[13px] font-semibold text-zinc-100">{opp.amount}</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-medium mt-[1px]">{opp.currency}</span>
            </div>
        </a>
    );
}

export function LiveOpportunitiesCard() {
    return (
        <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-3xl flex flex-col overflow-hidden group transition-all duration-500 relative h-[320px]">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex flex-col gap-3 shrink-0 relative z-10 bg-[#0A0A0A]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-primary/[0.05] group-hover:border-primary/20 transition-colors duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-zinc-100 font-semibold text-[15px] tracking-tight leading-tight">Live Opportunities</h2>
                    <p className="text-zinc-500 text-[11px] leading-[1.4]">Real-time bounties and projects pulled directly from the Superteam API.</p>
                </div>
            </div>

            {/* Scrolling list with mask */}
            <div
                className="relative flex-1 overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
            >
                <div className="flex flex-col gap-3 animate-scroll-y px-4 pt-2 pb-0">
                    {/* Original set */}
                    <div className="flex flex-col gap-3">
                        {opportunities.map((opp, i) => (
                            <OpportunityRow key={`a-${i}`} opp={opp} />
                        ))}
                    </div>
                    {/* Duplicate for seamless loop */}
                    <div className="flex flex-col gap-3" aria-hidden="true">
                        {opportunities.map((opp, i) => (
                            <OpportunityRow key={`b-${i}`} opp={opp} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
