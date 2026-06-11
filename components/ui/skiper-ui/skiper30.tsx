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
  // Adjusted parallax speeds to ensure all columns have noticeable and smooth movement
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 2.8]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.8]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 2.5]);

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

        {/* SVG Cutout Mask (True Frosted Glass) */}
        {/* We blur the outside and punch a literal hole through the glass using an SVG mask, providing perfect contrast (sharp vs blur) without darkening the images inside! */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="sticky top-0 h-screen w-full">
            <svg className="absolute w-0 h-0">
              <defs>
                <mask id="text-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <text 
                    x="50%" 
                    y="42%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="black" 
                    className="text-7xl md:text-[10rem] font-serif font-bold tracking-tight"
                  >
                    Superteam
                  </text>
                  <text 
                    x="50%" 
                    y="56%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="black" 
                    className="text-7xl md:text-[10rem] font-serif italic font-light tracking-tight"
                  >
                    in action
                  </text>
                </mask>
              </defs>
            </svg>
            
            <div 
              className="w-full h-full bg-black/40 backdrop-blur-md"
              style={{
                WebkitMaskImage: 'url(#text-mask)',
                maskImage: 'url(#text-mask)',
              }}
            />
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
      className="relative -top-[45%] flex h-full w-1/4 min-w-[150px] flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%]"
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
