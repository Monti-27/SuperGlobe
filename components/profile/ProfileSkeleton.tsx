import React from 'react';

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Identity Card Skeleton */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="h-32 w-full bg-zinc-800 animate-pulse" />
            
            <div className="px-6 pb-8 pt-0 relative flex flex-col items-center">
              <div className="h-28 w-28 rounded-full border-4 border-zinc-900 bg-zinc-800 animate-pulse relative -mt-14 mb-4 shadow-xl" />
              
              <div className="h-7 w-40 bg-zinc-800 animate-pulse rounded-md mb-2" />
              <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded-md" />
            </div>
          </div>

          {/* Confirmed Info Card Skeleton */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 p-6 shadow-xl">
            <div className="h-6 w-48 bg-zinc-800 animate-pulse rounded-md mb-8" />
            
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-zinc-800 animate-pulse rounded-md" />
                    <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">
          
          {/* About Section Skeleton */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 p-8 shadow-xl">
            <div className="h-8 w-64 bg-zinc-800 animate-pulse rounded-md mb-8" />
            
            <div className="space-y-3 mb-10">
              <div className="h-4 w-full bg-zinc-800 animate-pulse rounded-md" />
              <div className="h-4 w-[90%] bg-zinc-800 animate-pulse rounded-md" />
              <div className="h-4 w-[95%] bg-zinc-800 animate-pulse rounded-md" />
              <div className="h-4 w-[60%] bg-zinc-800 animate-pulse rounded-md" />
            </div>

            {/* Skills & Tools Skeleton */}
            <div className="mb-10">
              <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded-md mb-5" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 w-24 bg-zinc-800 animate-pulse rounded-xl" />
                ))}
              </div>
            </div>

            {/* Social Links Skeleton */}
            <div>
              <div className="h-4 w-20 bg-zinc-800 animate-pulse rounded-md mb-5" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-2xl bg-zinc-800 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* GitHub Activity Skeleton */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 p-8 shadow-xl">
            <div className="h-8 w-64 bg-zinc-800 animate-pulse rounded-md mb-6" />
            <div className="w-full h-[180px] rounded-xl bg-zinc-800 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
}
