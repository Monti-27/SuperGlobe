import * as React from "react";
import { motion, AnimatePresence, HTMLMotionProps, Variants } from "framer-motion";
import { Star, Bookmark, Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/**
 * Props for the FreelancerProfileCard component.
 */
interface FreelancerProfileCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
    /** The user's full name. */
    name: string;
    /** The user's job title or role. */
    title: string;
    /** URL for the user's avatar image. */
    avatarSrc: string;
    /** URL for the card's banner image. */
    bannerSrc: string;
    /** The user's rating (e.g., 4.0). */
    rating: number;
    /** A string describing the project duration (e.g., "8 Days"). */
    duration: string;
    /** A string for the user's rate (e.g., "$40/hr"). */
    rate: string;
    /** A React node (e.g., array of icons) for the tools section. */
    tools: React.ReactNode;
    /** The user's wallet address. */
    wallet?: string;
    /** Optional click handler for the "Get in touch" button. */
    onGetInTouch?: () => void;
    /** Optional click handler for the bookmark icon. */
    onBookmark?: (e: React.MouseEvent) => void;
    /** Optional additional class names. */
    className?: string;
    /** Whether the card is expanded. */
    isExpanded?: boolean;
}

// Ultra-smooth spring configuration
const springConfig = {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
};

// Animation variants for Framer Motion
const cardVariants: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    },
    hover: {
        y: -5,
        transition: { duration: 0.2 },
    },
};

const contentVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2, // Start staggering after card expands
        },
    },
};

const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * A reusable, animated profile card component.
 */
export const FreelancerProfileCard = React.forwardRef<
    HTMLDivElement,
    FreelancerProfileCardProps
>(
    (
        {
            className,
            name,
            title,
            avatarSrc,
            bannerSrc,
            rating,
            duration,
            rate,
            tools,
            wallet = "0x...",
            onGetInTouch,
            onBookmark,
            isExpanded = false,
            onClick,
            ...props
        },
        ref
    ) => {
        const avatarName = name
            .split(" ")
            .map((n) => n[0])
            .join("");

        const [copied, setCopied] = React.useState(false);

        const handleCopy = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            navigator.clipboard.writeText(wallet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <motion.div
                ref={ref}
                layout
                className={cn(
                    "relative w-full overflow-hidden rounded-2xl bg-card shadow-lg cursor-pointer border border-white/5",
                    isExpanded ? "col-span-1 lg:col-span-2 row-span-2 z-20" : "col-span-1 row-span-1 z-0",
                    className
                )}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover={!isExpanded ? "hover" : undefined}
                onClick={onClick}
                transition={{ layout: springConfig }}
                {...props}
            >
                {/* Banner Image */}
                <motion.div layout className={cn("w-full transition-all duration-500", isExpanded ? "h-48" : "h-32")}>
                    <img
                        src={bannerSrc}
                        alt={`${name}'s banner`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-50" />
                </motion.div>

                {/* Bookmark Button */}
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-4 h-9 w-9 rounded-lg bg-background/50 backdrop-blur-sm text-card-foreground/80 hover:bg-background/70 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark?.(e);
                    }}
                    aria-label="Bookmark profile"
                >
                    <Bookmark className="h-4 w-4" />
                </Button>

                {/* Avatar (overlaps banner) */}
                <motion.div
                    layout
                    className={cn(
                        "absolute left-6 transition-all duration-500",
                        isExpanded ? "top-40" : "top-24"
                    )}
                >
                    <Avatar className={cn("border-4 border-card transition-all duration-500", isExpanded ? "h-24 w-24" : "h-20 w-20")}>
                        <AvatarImage src={avatarSrc} alt={name} />
                        <AvatarFallback>{avatarName}</AvatarFallback>
                    </Avatar>
                </motion.div>

                {/* Content Area */}
                <div className={cn("px-6 pb-6 transition-all duration-500", isExpanded ? "pt-16" : "pt-12")}>
                    {/* Name, Title, and Tools */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <motion.h2 layout="position" className="text-xl font-semibold text-card-foreground">
                                    {name}
                                </motion.h2>
                                <motion.button
                                    layout="position"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/copy relative z-20"
                                    onClick={handleCopy}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <span className="text-[10px] font-mono text-muted-foreground group-hover/copy:text-foreground transition-colors">
                                        {wallet.slice(0, 4)}...{wallet.slice(-4)}
                                    </span>
                                    {copied ? <Check className="w-3 h-3 text-[#14F195]" /> : <Copy className="w-3 h-3 text-muted-foreground group-hover/copy:text-foreground" />}
                                </motion.button>
                            </div>
                            <motion.p layout="position" className="text-sm text-muted-foreground">{title}</motion.p>
                        </div>

                        <motion.div layout="position" className="flex flex-col items-start sm:items-end gap-1.5">
                            <div className="flex gap-1.5 flex-wrap">{tools}</div>
                            <span className="text-xs text-muted-foreground">Tech Stack</span>
                        </motion.div>
                    </div>

                    {/* Expanded Content with AnimatePresence */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                    {/* Stats */}
                                    <div className="my-6 flex items-center justify-around rounded-lg border border-border bg-background/30 p-4">
                                        <StatItem icon={Star} value={rating} label="rating" />
                                        <Divider />
                                        <StatItem value={duration} label="Experience" />
                                        <Divider />
                                        <StatItem value={rate} label="Active" />
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-6 space-y-2">
                                        <h3 className="text-sm font-medium text-foreground">About</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Experienced {title} specializing in high-performance Solana applications and modern web interfaces.
                                            Passionate about building decentralized solutions that scale.
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <Button className="w-full bg-[#14F195] text-black hover:bg-[#14F195]/90 font-bold" size="lg" onClick={onGetInTouch}>
                                        Connect with {name.split(' ')[0]}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }
);
FreelancerProfileCard.displayName = "FreelancerProfileCard";

// Internal StatItem component
const StatItem = ({
    icon: Icon,
    value,
    label,
}: {
    icon?: React.ElementType;
    value: string | number;
    label: string;
}) => (
    <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        <div className="flex items-center gap-1">
            {Icon && <Icon className="h-4 w-4 text-[#FFD700]" />}
            <span className="text-base font-semibold text-card-foreground">
                {value}
            </span>
        </div>
        <span className="text-xs capitalize text-muted-foreground">{label}</span>
    </div>
);

// Internal Divider component
const Divider = () => <div className="h-8 w-px bg-border/50" />;
