"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* OUTSIDE THE CARD: Theme-aware text (Shadow in Light Mode, Glow in Dark Mode) */
  .text-3d-matte {
      color: white;
      text-shadow: 
          0 10px 30px rgba(255,255,255,0.1), 
          0 2px 4px rgba(255,255,255,0.05);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0); /* Hardware acceleration */
      filter: 
          drop-shadow(0px 10px 20px rgba(255,255,255,0.15)) 
          drop-shadow(0px 2px 4px rgba(255,255,255,0.1));
  }
`;

interface CinematicTextProps extends React.HTMLAttributes<HTMLDivElement> {
  tagline1?: string;
  tagline2?: string;
}

export function CinematicText({ 
  tagline1 = "Track the journey,",
  tagline2 = "not just the days.",
  className, 
  ...props 
}: CinematicTextProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
    gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });

    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%", // Triggers when the top of the container is 75% down the viewport
        toggleActions: "play none none reset"
      }
    });

    introTl
      .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
      .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");
      
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full flex flex-col items-center justify-center py-32 z-20 will-change-transform transform-style-3d", className)}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      <h1 className="text-track gsap-reveal text-3d-matte text-4xl md:text-6xl lg:text-[5rem] font-bold tracking-tight mb-2 text-center px-4">
        {tagline1}
      </h1>
      <h1 className="text-days gsap-reveal text-silver-matte text-4xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tighter text-center px-4">
        {tagline2}
      </h1>
    </div>
  );
}
