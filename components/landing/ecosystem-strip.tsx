'use client';

import Image from 'next/image';
import { Section } from './section';
import { FadeIn } from './fade-in';

const COUNTRIES = [
  { name: 'India', logo: '/superteam-logos/india.jpg', flag: '🇮🇳' },
  { name: 'Nigeria', logo: '/superteam-logos/nigeria.jpg', flag: '🇳🇬' },
  { name: 'Germany', logo: '/superteam-logos/germant.jpg', flag: '🇩🇪' },
  { name: 'UK', logo: '/superteam-logos/uk.jpg', flag: '🇬🇧' },
  { name: 'Brazil', logo: '/superteam-logos/brasil.jpg', flag: '🇧🇷' },
  { name: 'Japan', logo: '/superteam-logos/japan.jpg', flag: '🇯🇵' },
  { name: 'Korea', logo: '/superteam-logos/korea.png', flag: '🇰🇷' },
  { name: 'UAE', logo: '/superteam-logos/uae.jpg', flag: '🇦🇪' },
  { name: 'Canada', logo: '/superteam-logos/canada.jpg', flag: '🇨🇦' },
  { name: 'Singapore', logo: '/superteam-logos/singapore.jpg', flag: '🇸🇬' },
  { name: 'Malaysia', logo: '/superteam-logos/malysia.jpg', flag: '🇲🇾' },
  { name: 'Indonesia', logo: '/superteam-logos/indonesia.jpg', flag: '🇮🇩' },
];

/**
 * Horizontal scrolling strip of Superteam country chapters.
 */
export function EcosystemStrip() {
  return (
    <Section id="ecosystem" className="py-20">
      <FadeIn>
        <div className="mb-10 text-center">
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-white/20 mb-3">
            Superteam Chapters
          </p>
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white">
            Active across <span className="text-[#E2A336]">{COUNTRIES.length}+</span> countries
          </h2>
        </div>
      </FadeIn>

      {/* Auto-scrolling marquee */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#09090B] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#09090B] to-transparent z-10" />

        <div className="flex animate-[marquee_30s_linear_infinite] gap-6">
          {[...COUNTRIES, ...COUNTRIES].map((country, i) => (
            <div
              key={`${country.name}-${i}`}
              className="flex flex-shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
                <Image
                  src={country.logo}
                  alt={country.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm text-white/50 whitespace-nowrap">
                {country.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
