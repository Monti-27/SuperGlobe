"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { cn } from "@/lib/utils";

interface CardData {
  id: number | string;
  image: string;
  alt?: string;
}

interface StickyCard002Props {
  cards: CardData[];
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
}

const StickyCard002 = ({
  cards,
  className,
  containerClassName,
  imageClassName,
}: StickyCard002Props) => {
  const container = useRef(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const imageElements = imageRefs.current;
      const totalCards = imageElements.length;

      if (!imageElements[0]) return;

      gsap.set(imageElements[0], { y: "0%", scale: 1, rotation: 0 });

      for (let i = 1; i < totalCards; i++) {
        if (!imageElements[i]) continue;
        gsap.set(imageElements[i], { y: "100%", scale: 1, rotation: 0 });
      }

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "center center",
          end: `+=${window.innerHeight * (totalCards + 1)}`,
          pin: true,
          scrub: 1,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const currentImage = imageElements[i];
        const nextImage = imageElements[i + 1];
        const position = i;
        if (!currentImage || !nextImage) continue;

        scrollTimeline.to(
          currentImage,
          {
            scale: 0.7,
            rotation: 5,
            duration: 1,
            ease: "power1.inOut",
          },
          position,
        );

        scrollTimeline.to(
          nextImage,
          {
            y: "0%",
            duration: 1,
            ease: "power1.inOut",
          },
          position,
        );
      }

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      if (container.current) {
        resizeObserver.observe(container.current);
      }

      return () => {
        resizeObserver.disconnect();
        scrollTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: container },
  );

  return (
    <section className={cn("relative w-full bg-[#09090B] z-20 overflow-hidden py-16", className)} ref={container}>
      {/* Header - Now pinned with the images */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 mb-10 text-center shrink-0">
        <p className="text-[10px] font-data uppercase tracking-[0.2em] text-[#E2A336]/50 mb-3">
          Gallery
        </p>
        <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-white mb-2">
          Superteam in
          <span className="text-white/35 italic ml-2">action</span>
        </h2>
      </div>

      {/* Image Stack */}
      <div className="flex w-full items-center justify-center pointer-events-none">
        <div
          className={cn(
            "relative w-full h-[60vh] max-h-[600px] min-h-[400px] max-w-sm rounded-lg sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl aspect-[4/3] md:aspect-[16/9] shadow-2xl overflow-hidden",
            containerClassName,
          )}
        >
          {cards.map((card, i) => (
            <img
              key={card.id}
              src={card.image}
              alt={card.alt || ""}
              className={cn(
                "rounded-4xl absolute h-full w-full object-cover shadow-[0_0_40px_rgba(0,0,0,0.5)]",
                imageClassName,
              )}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Example usage component with default data
const Skiper17 = () => {
  const defaultCards = [
    { id: 1, image: "/images/76f12a8b-e1f3-48d7-ad3a-1ca0ab558370_5760x3840.jpg" },
    { id: 2, image: "/images/G2jrVKTXAAAp7bU.jpeg" },
    { id: 3, image: "/images/G2lSEI3XgAA08sF.jpeg" },
    { id: 4, image: "/images/G2qwbY0XwAA7I98.jpeg" },
    { id: 5, image: "/images/G3nhywGX0AA6A65.jpeg" },
    { id: 6, image: "/images/G40iWRbWYAA1iRC.jpeg" },
    { id: 7, image: "/images/G45crCnXIAECqMw.jpeg" },
    { id: 8, image: "/images/G5PWFRJa0AAr_oU.jpeg" },
    { id: 9, image: "/images/G78qnagagAQg5oA.jpeg" },
    { id: 10, image: "/images/GTUD81VWUAAWQhJ.jpeg" },
    { id: 11, image: "/images/GTfaw5daQAAqAfz.jpeg" },
    { id: 12, image: "/images/Gm46P4yakAA6m8c.jpeg" },
    { id: 13, image: "/images/GrkGyPiWgAAuGdG.jpeg" },
    { id: 14, image: "/images/HDKby2GXcAAZqNZ.jpeg" },
  ];

  return <StickyCard002 cards={defaultCards} />;
};

export { Skiper17, StickyCard002 };

/**
 * Skiper 17 StickyCard_002 — React + Gsap + scrollTrigger
 * We respect the original creators. This is an inspired rebuild with our own taste and does not claim any ownership.
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
