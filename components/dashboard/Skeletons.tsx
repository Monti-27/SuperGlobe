'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SidebarSkeleton() {
    return (
        <div className="glass rounded-xl p-4 w-64">
            {/* Header */}
            <Skeleton className="h-4 w-24 mb-4 bg-white/[0.06]" />

            {/* Country Items */}
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded bg-white/[0.06]" />
                            <Skeleton className="h-3 w-16 bg-white/[0.06]" />
                        </div>
                        <Skeleton className="h-3 w-8 bg-white/[0.06]" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GlobeLoadingSkeleton() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
                {/* Globe outline */}
                <div className="w-64 h-64 rounded-full border border-white/[0.08] relative overflow-hidden">
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-pulse" />

                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full h-px bg-white/20"
                                style={{ top: `${(i + 1) * 16.66}%` }}
                            />
                        ))}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-full w-px bg-white/20"
                                style={{ left: `${(i + 1) * 16.66}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Loading text */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground font-data">Initializing Globe</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}
