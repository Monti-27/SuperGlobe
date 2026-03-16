'use client';

import { WaveLoader } from '@/components/ui/wave-loader';

interface GlobeLaunchLoaderProps {
  message?: string;
}

export function GlobeLaunchLoader({ message }: GlobeLaunchLoaderProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black">
      <WaveLoader
        bars={6}
        message={message}
        messagePlacement="bottom"
        className="bg-[#E2A336]"
      />
    </div>
  );
}
