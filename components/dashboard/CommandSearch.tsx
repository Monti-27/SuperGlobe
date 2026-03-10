'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Member, truncateWallet, COUNTRY_COORDS } from '@/lib/mock-data';
import { GlobeMethods } from 'react-globe.gl';

interface CommandSearchProps {
    members: Member[];
    globeRef: React.MutableRefObject<GlobeMethods | undefined>;
    onCountrySelect?: (country: string) => void;
}

export function CommandSearch({ members, globeRef, onCountrySelect }: CommandSearchProps) {
    const [open, setOpen] = useState(false);

    // Cmd+K and "/" shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const isCmdK = e.key === 'k' && (e.metaKey || e.ctrlKey);
            const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;

            if (isCmdK || isSlash) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        const openSearch = () => setOpen(true);
        window.addEventListener('open-command-search', openSearch);
        return () => window.removeEventListener('open-command-search', openSearch);
    }, []);

    const handleMemberSelect = useCallback((member: Member) => {
        setOpen(false);

        if (globeRef.current) {
            globeRef.current.pointOfView(
                { lat: member.lat, lng: member.lng, altitude: 1.5 },
                1500
            );
        }
    }, [globeRef]);

    const handleCountrySelect = useCallback((country: string) => {
        setOpen(false);

        const coords = COUNTRY_COORDS[country];
        if (coords && globeRef.current) {
            globeRef.current.pointOfView(
                { lat: coords.lat, lng: coords.lng, altitude: 1.8 },
                1500
            );
        }

        if (onCountrySelect) {
            onCountrySelect(country);
        }
    }, [globeRef, onCountrySelect]);

    // Get unique countries
    const countries = Array.from(new Set(members.map(m => m.country))).sort();

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search members or countries..."
                className="border-none focus:ring-0"
            />
            <CommandList className="max-h-[400px]">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Countries">
                    {countries.slice(0, 10).map((country) => {
                        const count = members.filter(m => m.country === country).length;
                        return (
                            <CommandItem
                                key={country}
                                value={country}
                                onSelect={() => handleCountrySelect(country)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <span>{country}</span>
                                <span className="text-xs font-data text-muted-foreground">{count}</span>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                <CommandGroup heading="Members">
                    {members.slice(0, 20).map((member) => (
                        <CommandItem
                            key={member.id}
                            value={`${member.name} ${member.country}`}
                            onSelect={() => handleMemberSelect(member)}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <div>
                                <span className="font-medium">{member.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">{member.country}</span>
                            </div>
                            <code className="text-xs font-data text-secondary">
                                {truncateWallet(member.wallet)}
                            </code>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
