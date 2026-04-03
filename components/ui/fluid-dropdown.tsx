"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function useClickAway(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

type DropdownItem = {
  id: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
};

interface FluidDropdownProps {
  items: DropdownItem[];
  selectedId: string;
  onSelect: (item: DropdownItem) => void;
  className?: string;
  align?: "left" | "right";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

function IconWrapper({
  icon: Icon,
  isHovered,
  color,
}: {
  icon?: React.ElementType;
  isHovered: boolean;
  color?: string;
}) {
  const ResolvedIcon = Icon || Layers;

  return (
    <motion.div className="relative mr-2 h-4 w-4" initial={false} animate={isHovered ? { scale: 1.18 } : { scale: 1 }}>
      <ResolvedIcon className="h-4 w-4" />
      {isHovered && color && (
        <motion.div
          className="absolute inset-0"
          style={{ color }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <ResolvedIcon className="h-4 w-4" strokeWidth={2} />
        </motion.div>
      )}
    </motion.div>
  );
}

export function FluidDropdown({
  items,
  selectedId,
  onSelect,
  className,
  align = "left",
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useClickAway(dropdownRef, () => setIsOpen(false));

  const selectedItem = React.useMemo(
    () => items.find((item) => item.id === selectedId) || items[0],
    [items, selectedId]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div ref={dropdownRef} className={cn("relative w-full max-w-[240px]", className)}>
        <button
          onClick={() => setIsOpen((current) => !current)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-medium text-zinc-300 transition-all duration-200",
            "hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            isOpen && "border-zinc-700 bg-zinc-900 text-zinc-100"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center truncate">
            <IconWrapper icon={selectedItem.icon} isHovered={false} color={selectedItem.color} />
            <span className="truncate">{selectedItem.label}</span>
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-5 w-5 items-center justify-center"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 1, y: 0, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              exit={{
                opacity: 0,
                y: 0,
                height: 0,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              className={cn(
                "absolute top-full z-50 mt-2 w-full",
                align === "right" ? "right-0" : "left-0"
              )}
              onKeyDown={handleKeyDown}
            >
              <motion.div
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-1 shadow-[0_22px_70px_rgba(0,0,0,0.45)]"
                initial={{ borderRadius: 16 }}
                animate={{ borderRadius: 18, transition: { duration: 0.2 } }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div className="relative py-2" variants={containerVariants} initial="hidden" animate="visible">
                  {items.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        setIsOpen(false);
                      }}
                      onHoverStart={() => setHoveredId(item.id)}
                      onHoverEnd={() => setHoveredId(null)}
                      className={cn(
                        "relative flex h-11 w-full items-center rounded-xl px-4 text-sm transition-colors duration-150 focus:outline-none",
                        selectedItem.id === item.id || hoveredId === item.id ? "text-zinc-100" : "text-zinc-400"
                      )}
                      whileTap={{ scale: 0.98 }}
                      variants={itemVariants}
                    >
                      {(selectedItem.id === item.id || hoveredId === item.id) && (
                        <motion.div
                          layoutId="fluid-dropdown-highlight"
                          className="absolute inset-0 rounded-xl bg-zinc-900"
                          transition={{
                            type: "spring",
                            bounce: 0.15,
                            duration: 0.5,
                          }}
                        />
                      )}
                      <IconWrapper icon={item.icon} isHovered={hoveredId === item.id} color={item.color} />
                      <span className="relative z-10 flex h-full items-center">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
