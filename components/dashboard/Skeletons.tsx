'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SidebarSkeleton() {
    return (
        <div className="glass rounded-xl p-4 w-64">
            {/* Header */}
            <Skeleton className="mb-4 h-4 w-24" />

            {/* Country Items */}
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-8" />
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
                    <Skeleton className="absolute inset-0 rounded-full" />

                    <div className="absolute inset-[18%]">
                        <Skeleton className="h-full w-full rounded-full opacity-70" />
                    </div>
                </div>

                {/* Loading text */}
                <div className="text-center mt-6">
                    <Skeleton className="mx-auto h-3 w-36" />
                    <div className="flex items-center justify-center gap-1 mt-2">
                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                        <Skeleton className="h-1.5 w-1.5 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
