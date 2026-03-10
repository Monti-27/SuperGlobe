'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search members...' }: SearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="relative"
        >
            {/* Glow effect when focused */}
            <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: isFocused ? 0.5 : 0 }}
                transition={{ duration: 0.3 }}
            />

            <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.04] hover:border-white/[0.08]"
                style={{
                    borderColor: isFocused ? 'rgba(153, 69, 255, 0.3)' : undefined,
                }}
            >
                {/* Search Icon */}
                <motion.svg
                    animate={{
                        scale: isFocused ? 1.1 : 1,
                        color: isFocused ? '#9945FF' : 'rgba(255, 255, 255, 0.4)'
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </motion.svg>

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />

                {/* Clear button */}
                {value && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChange('')}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/[0.1] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
