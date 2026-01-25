'use client';

import { motion } from 'framer-motion';

export function MemberCardSkeleton({ index }: { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
        >
            {/* Index */}
            <div className="w-6 h-4 rounded bg-white/[0.04] animate-pulse" />

            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] animate-pulse" />

            {/* Info */}
            <div className="flex-1 space-y-2">
                <div className="w-32 h-4 rounded bg-white/[0.04] animate-pulse" />
                <div className="w-20 h-3 rounded bg-white/[0.04] animate-pulse" />
            </div>

            {/* Wallet */}
            <div className="w-24 h-8 rounded-lg bg-white/[0.04] animate-pulse" />
        </motion.div>
    );
}

export function DrawerSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <MemberCardSkeleton key={i} index={i} />
            ))}
        </div>
    );
}
