"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleDot, Search } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTIONS = [
  "Solana",
  "Rust",
  "TypeScript",
  "Frontend",
  "Backend",
  "Design",
  "DeFi",
  "DevOps",
  "Full Stack",
];

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  suggestions?: string[];
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

function SearchBar({
  value,
  defaultValue = "",
  placeholder = "Search...",
  suggestions = DEFAULT_SUGGESTIONS,
  onChange,
  onSearch,
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickParticles, setClickParticles] = useState<
    Array<{
      x: number;
      y: number;
      scale: number;
      duration: number;
      hue: number;
      alpha: number;
    }>
  >([]);

  const searchQuery = value ?? internalValue;
  const isControlled = value !== undefined;

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    return isSafari || isChromeOniOS;
  }, []);

  const visibleSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    return suggestions
      .filter((item) => item.toLowerCase().includes(trimmed))
      .slice(0, 5);
  }, [searchQuery, suggestions]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        left: seededUnit(index + 1) * 100,
        top: seededUnit(index + 21) * 100,
        x: (seededUnit(index + 41) - 0.5) * 40,
        y: (seededUnit(index + 61) - 0.5) * 40,
        scale: seededUnit(index + 81) * 0.8 + 0.4,
        duration: seededUnit(index + 101) * 1.5 + 1.5,
        size: seededUnit(index + 121) * 6 + 6,
        opacity: seededUnit(index + 141) * 0.45 + 0.25,
      })),
    []
  );

  const setQuery = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    onSearch?.(trimmed);
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isFocused) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextMousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setMousePosition(nextMousePosition);
    setClickParticles(
      Array.from({ length: 14 }, (_, index) => ({
        x: nextMousePosition.x + (seededUnit(index + nextMousePosition.x) - 0.5) * 160,
        y: nextMousePosition.y + (seededUnit(index + nextMousePosition.y + 100) - 0.5) * 160,
        scale: seededUnit(index + nextMousePosition.x + nextMousePosition.y) * 0.8 + 0.2,
        duration: seededUnit(index + nextMousePosition.x + 200) * 0.8 + 0.5,
        hue: 35 + Math.floor(seededUnit(index + nextMousePosition.y + 300) * 25),
        alpha: 0.45 + seededUnit(index + nextMousePosition.x + 400) * 0.35,
      }))
    );
    setIsClicked(true);
    window.setTimeout(() => {
      setIsClicked(false);
      setClickParticles([]);
    }, 800);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const searchIconVariants: Variants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  const suggestionVariants: Variants = {
    hidden: (index: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: index * 0.05 },
    }),
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 15, delay: index * 0.07 },
    }),
    exit: (index: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: index * 0.03 },
    }),
  };

  return (
    <div className={cn("relative w-full", className)}>
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative mx-auto flex w-full items-center justify-center"
        initial={false}
        animate={{
          width: isFocused ? "100%" : "94%",
          scale: isFocused ? 1.012 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "relative flex w-full items-center overflow-hidden rounded-full border backdrop-blur-md",
            isFocused
              ? "border-zinc-700 bg-zinc-900/92 shadow-xl"
              : "border-zinc-800 bg-zinc-900/86"
          )}
          animate={{
            boxShadow: isClicked
              ? "0 0 34px rgba(245, 158, 11, 0.14), 0 0 14px rgba(255, 255, 255, 0.08) inset"
              : isFocused
                ? "0 15px 35px rgba(0, 0, 0, 0.26)"
                : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.1,
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(245,158,11,0.08) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(120,113,108,0.12) 100%)",
                  "linear-gradient(90deg, rgba(245,158,11,0.08) 0%, rgba(255,255,255,0.04) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(245,158,11,0.08) 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {isFocused &&
              particles.map((particle, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{
                    x: [0, particle.x],
                    y: [0, particle.y],
                    scale: [0, particle.scale],
                    opacity: [0, particle.opacity, 0],
                  }}
                  transition={{
                    duration: particle.duration,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute rounded-full bg-gradient-to-r from-amber-200/55 to-zinc-100/25"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: particle.size,
                    height: particle.size,
                    filter: "blur(2px)",
                  }}
                />
              ))}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-300/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}

          {clickParticles.map((particle, index) => (
            <motion.div
              key={`click-${index}`}
              initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: [1, 0],
              }}
              transition={{ duration: particle.duration, ease: "easeOut" }}
              className="absolute h-3 w-3 rounded-full"
              style={{
                background: `hsla(${particle.hue}, 90%, 68%, ${particle.alpha})`,
                boxShadow: "0 0 8px rgba(255,255,255,0.35)",
              }}
            />
          ))}

          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating
                  ? "text-amber-300"
                  : isFocused
                    ? "text-zinc-100"
                    : "text-zinc-500"
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => window.setTimeout(() => setIsFocused(false), 200)}
            className={cn(
              "relative z-10 w-full bg-transparent py-3 text-base font-medium outline-none placeholder:text-zinc-500",
              isFocused ? "tracking-wide text-zinc-100" : "text-zinc-300"
            )}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(45deg, rgba(255,255,255,0.18) 0%, rgba(245,158,11,0.3) 100%)",
                  boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.18)",
                }}
                whileTap={{ scale: 0.95 }}
                className="mr-2 rounded-full border border-zinc-700 bg-zinc-950/90 px-5 py-2 text-sm font-medium text-zinc-100 shadow-lg transition-all backdrop-blur-sm"
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.08, 0.16, 0.08, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && visibleSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/96 shadow-xl backdrop-blur-md"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.18))",
            }}
          >
            <div className="p-2">
              {visibleSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(suggestion);
                    onSearch?.(suggestion);
                    setIsFocused(false);
                  }}
                  className="group flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                    <CircleDot size={16} className="text-amber-300/80 group-hover:text-amber-300" />
                  </motion.div>
                  <motion.span
                    className="group-hover:text-white"
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {suggestion}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { SearchBar };
