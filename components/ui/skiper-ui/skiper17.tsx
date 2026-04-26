"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";

const defaultCards = [
  "/images/76f12a8b-e1f3-48d7-ad3a-1ca0ab558370_5760x3840.jpg",
  "/images/G2jrVKTXAAAp7bU.jpeg",
  "/images/G2lSEI3XgAA08sF.jpeg",
  "/images/G2qwbY0XwAA7I98.jpeg",
  "/images/G3nhywGX0AA6A65.jpeg",
  "/images/G40iWRbWYAA1iRC.jpeg",
  "/images/G45crCnXIAECqMw.jpeg",
  "/images/G5PWFRJa0AAr_oU.jpeg",
  "/images/G78qnagagAQg5oA.jpeg",
  "/images/GTUD81VWUAAWQhJ.jpeg",
  "/images/GTfaw5daQAAqAfz.jpeg",
  "/images/Gm46P4yakAA6m8c.jpeg",
  "/images/GrkGyPiWgAAuGdG.jpeg",
  "/images/HDKby2GXcAAZqNZ.jpeg",
];

const Skiper17 = () => {
  return (
    <ReactLenis root>
      <section className="relative flex w-full flex-col items-center gap-[15vh] px-4 pt-[30vh] pb-[40vh] z-20">
        <div className="absolute left-1/2 top-24 grid w-full -translate-x-1/2 content-start justify-items-center gap-2 text-center pointer-events-none z-30 mix-blend-difference">
          <p className="text-[10px] font-data uppercase tracking-[0.2em] text-[#E2A336] mb-3">
            Gallery
          </p>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tight text-white mb-2">
            Superteam in
            <span className="text-white/50 italic ml-2 transition-opacity">action</span>
          </h2>
        </div>
        
        {defaultCards.map((img, idx) => (
          <StickyCard_003 key={idx} imgUrl={img} />
        ))}
      </section>
    </ReactLenis>
  );
};

const StickyCard_003 = ({ imgUrl }: { imgUrl: string }) => {
  const vertMargin = 18;
  const container = useRef(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  const filter = useMotionValue(0);
  const negateFilter = useTransform(filter, (value) => -value);

  const { scrollY } = useScroll({
    target: container,
  });
  
  const scale = useTransform(scrollY, [maxScrollY, maxScrollY + 10000], [1, 0]);
  
  const isInView = useInView(container, {
    margin: `0px 0px -${100 - vertMargin}% 0px`,
    once: true,
  });

  scrollY.on("change", (scrollY) => {
    let animationValue = 1;
    if (scrollY > maxScrollY) {
      animationValue = Math.max(0, 1 - (scrollY - maxScrollY) / 10000);
    }

    scale.set(animationValue);
    filter.set((1 - animationValue) * 100);
  });

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setMaxScrollY(scrollY.get());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isInView, scrollY]);

  return (
    <motion.div
      ref={container}
      className="rounded-[2rem] sticky w-full max-w-3xl overflow-hidden bg-[#0c0c0c] border border-white/5 shadow-2xl"
      style={{
        scale: scale,
        rotate: filter,
        height: `${100 - 2 * vertMargin}vh`,
        top: `${vertMargin}vh`,
        marginBottom: "6vh"
      }}
    >
      <motion.img
        src={imgUrl}
        alt="Superteam in action"
        style={{
          rotate: negateFilter,
        }}
        className="h-full w-full scale-125 object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
        sizes="90vw"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none rounded-[2rem]" />
    </motion.div>
  );
};

export { Skiper17, StickyCard_003 };
