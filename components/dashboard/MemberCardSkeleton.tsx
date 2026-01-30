'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-card border border-white/5 h-[300px]">
            {/* Banner Skeleton */}
            <Skeleton className="h-32 w-full rounded-none bg-white/5" />

            {/* Avatar Skeleton */}
            <div className="absolute left-6 top-24">
                <Skeleton className="h-20 w-20 rounded-full border-4 border-card bg-white/10" />
            </div>

            {/* Content Area */}
            <div className="px-6 pt-12">
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        {/* Name */}
                        <Skeleton className="h-6 w-32 bg-white/10" />
                        {/* Title */}
                        <Skeleton className="h-4 w-24 bg-white/5" />
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-md bg-white/5" />
                        <Skeleton className="h-6 w-16 rounded-md bg-white/5" />
                        <Skeleton className="h-6 w-16 rounded-md bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Bookmark Button Skeleton */}
            <Skeleton className="absolute right-4 top-4 h-9 w-9 rounded-lg bg-white/10" />
        </div>
    );
}

export function DrawerSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <MemberCardSkeleton key={i} />
            ))}
        </div>
    );
}
