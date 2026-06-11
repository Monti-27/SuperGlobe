"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { useRef, useState, useEffect } from "react";

const images = [
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
];

const Skiper30 = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <ReactLenis root>
      <section className="relative w-full bg-[#0c0c0c] pb-[15vh]">
        {/* Gallery */}
        <div
          ref={gallery}
          className="relative box-border flex h-[200vh] gap-[2vw] overflow-hidden p-[2vw]"
        >
          <Column images={[images[0], images[1], images[2]]} y={y} />
          <Column images={[images[3], images[4], images[5]]} y={y2} />
          <Column images={[images[6], images[7], images[8]]} y={y3} />
          <Column images={[images[9], images[10], images[11]]} y={y4} />
        </div>

        {/* Cutout Mask Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 mix-blend-multiply">
          <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-[#1a1a1a]">
            <h2 className="text-7xl md:text-[10rem] leading-[0.9] font-serif tracking-tight text-white text-center">
              Superteam<br/>
              <span className="italic text-white/90">in action</span>
            </h2>
          </div>
        </div>

        {/* Normal text overlay */}
        <div className="absolute inset-0 pointer-events-none z-40">
          <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center">
            <div className="-mt-[18rem] md:-mt-[22rem]">
              <p className="text-[12px] font-data uppercase tracking-[0.2em] text-[#E2A336]">
                Gallery
              </p>
            </div>
          </div>
        </div>
      </section>
    </ReactLenis>
  );
};

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative -top-[45%] flex h-full w-1/4 min-w-[250px] flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%]"
      style={{ y }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-full w-full overflow-hidden rounded-[1rem] bg-white/5">
          <img
            src={`${src}`}
            alt="Superteam in action"
            className="pointer-events-none object-cover h-full w-full"
            loading="lazy"
          />
        </div>
      ))}
    </motion.div>
  );
};

export { Skiper30 };
