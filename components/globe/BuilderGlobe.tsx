'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { parseCSVData, HUB_ARCS, truncateWallet, type Member, COUNTRY_COORDS } from '@/lib/mock-data';
import { getMemberSkills, TECH_COLORS } from '@/lib/utils'; // Fixed import
import { type Bounty } from '@/lib/services/superteam-earn';
import { cn } from '@/lib/utils';

// GeoJSON Feature types
interface GeoFeature {
    type: string;
    properties: {
        ADMIN?: string;
        ISO_A3?: string;
        [key: string]: unknown;
    };
    geometry: {
        type: string;
        coordinates: number[][][] | number[][][][];
    };
}

interface GeoJSON {
    type: string;
    features: GeoFeature[];
}

interface BuilderGlobeProps {
    onCountryClick?: (countryName: string) => void;
    onMembersLoaded?: (members: Member[]) => void;
    selectedCountry?: string | null;
    globeRef?: React.MutableRefObject<GlobeMethods | undefined>;
    activeFilter?: string | null;
    mode?: 'builders' | 'bounties';
    bounties?: Bounty[];
}

const COUNTRY_LOGOS: Record<string, string> = {
    'Nigeria': 'nigeria.jpg',
    'India': 'india.jpg',
    'Germany': 'germant.jpg',
    'United Kingdom': 'uk.jpg',
    'Brazil': 'brasil.jpg',
    'Japan': 'japan.jpg',
    'South Korea': 'korea.png',
    'Singapore': 'singapore.jpg',
    'Malaysia': 'malysia.jpg',
    'UAE': 'uae.jpg',
    'Canada': 'canada.jpg',
    'Balkans': 'balkan.jpg',
    'Turkey': 'SUPERTEAM.jpg',
    'Vietnam': 'SUPERTEAM.jpg',
    'Philippines': 'SUPERTEAM.jpg',
    'France': 'SUPERTEAM.jpg',
    'Poland': 'poland.jpg',
    'Indonesia': 'indonesia.jpg',
    'Georgia': 'georgia.jpg',
    'Kazakstan': 'kazakstan.png',
    'Mexico': 'SUPERTEAM.jpg',
};

// Tech stack colors for X-Ray
// Imported from utils now

export default function BuilderGlobe({
    onCountryClick,
    onMembersLoaded,
    selectedCountry,
    globeRef: externalGlobeRef,
    activeFilter,
    mode = 'builders',
    bounties = []
}: BuilderGlobeProps) {
    const internalGlobeRef = useRef<GlobeMethods | undefined>(undefined);
    const globeRef = externalGlobeRef || internalGlobeRef;

    const [countries, setCountries] = useState<GeoFeature[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [hoverD, setHoverD] = useState<GeoFeature | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Fetch GeoJSON country data
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then((data: GeoJSON) => {
                setCountries(data.features);
            })
            .catch(err => console.error('Failed to load country data:', err));
    }, []);

    // Fetch member CSV data
    useEffect(() => {
        fetch('/members-data/Shareable Wallets (Public Access).csv')
            .then(res => res.text())
            .then(csvText => {
                const parsedMembers = parseCSVData(csvText);
                setMembers(parsedMembers);
                if (onMembersLoaded) {
                    onMembersLoaded(parsedMembers);
                }
            })
            .catch(err => console.error('Failed to load member data:', err));
    }, [onMembersLoaded]);

    // Set up globe controls and auto-rotation
    useEffect(() => {
        if (globeRef.current) {
            const controls = globeRef.current.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.3;
                controls.enableZoom = true;
                controls.minDistance = 180;
                controls.maxDistance = 400;
            }

            globeRef.current.pointOfView({ lat: 20, lng: 40, altitude: 2.2 }, 1000);
        }
    }, [countries, globeRef]);

    // Fly to selected country
    useEffect(() => {
        if (selectedCountry && globeRef.current) {
            const coords = COUNTRY_COORDS[selectedCountry];
            if (coords) {
                globeRef.current.pointOfView(
                    { lat: coords.lat, lng: coords.lng, altitude: 1.8 },
                    1500
                );
            }
        }
    }, [selectedCountry, globeRef]);

    // Handle window resize
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Filter members by selected country AND tech stack
    const visibleMembers = useMemo(() => {
        if (mode === 'bounties') return [];
        return selectedCountry
            ? members.filter(m => m.country === selectedCountry)
            : members;
    }, [members, selectedCountry, mode]);

    // Helper to check if member matches filter
    const matchesFilter = useCallback((member: Member) => {
        if (!activeFilter) return true;
        const skills = getMemberSkills(member.wallet);
        return skills.includes(activeFilter);
    }, [activeFilter]);

    // Polygon cap color - Holographic Effect
    const getPolygonCapColor = useCallback((d: object) => {
        const feature = d as GeoFeature;
        const countryName = feature.properties?.ADMIN;

        // Selected country shows Holographic effect
        if (selectedCountry && countryName === selectedCountry) {
            // Transparent Hologram
            return mode === 'bounties' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 100, 0, 0.1)';
        }

        if (hoverD && feature === hoverD) {
            const hasMembersInCountry = members.some(m => m.country === countryName);
            if (hasMembersInCountry) {
                return mode === 'bounties' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(20, 241, 149, 0.1)';
            }
        }

        return 'rgba(0, 0, 0, 0)';
    }, [hoverD, selectedCountry, members, mode]);

    const getPolygonStrokeColor = useCallback((d: object) => {
        const feature = d as GeoFeature;
        const countryName = feature.properties?.ADMIN;
        if (selectedCountry && countryName === selectedCountry) {
            return mode === 'bounties' ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'; // Bright border
        }
        return 'rgba(255, 255, 255, 0.08)';
    }, [selectedCountry, mode]);


    // Track mouse position to detect drag vs click
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            mouseDownPos.current = { x: e.clientX, y: e.clientY };
            isDragging.current = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (mouseDownPos.current) {
                const dx = e.clientX - mouseDownPos.current.x;
                const dy = e.clientY - mouseDownPos.current.y;
                // If moved more than 5px, it's a drag
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    isDragging.current = true;
                }
            }
        };

        const handleMouseUp = () => {
            mouseDownPos.current = null;
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Handle country click - only if not dragging and country has members
    const handlePolygonClick = useCallback((polygon: object) => {
        // Ignore if this was a drag
        if (isDragging.current) return;

        const feature = polygon as GeoFeature;
        const countryName = feature.properties?.ADMIN;

        // Only allow clicking on countries that have members
        const hasMembersInCountry = members.some(m => m.country === countryName);
        if (!hasMembersInCountry) return;

        if (countryName && onCountryClick) {
            onCountryClick(countryName);
        }
    }, [onCountryClick, members]);

    // Handle country hover
    const handlePolygonHover = useCallback((polygon: object | null) => {
        setHoverD(polygon as GeoFeature | null);

        if (globeRef.current) {
            const controls = globeRef.current.controls();
            if (controls) {
                controls.autoRotate = !polygon && !selectedCountry;
            }
        }
    }, [globeRef, selectedCountry]);

    if (dimensions.width === 0) return null;

    return (
        <div className="absolute inset-0 z-0">
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}

                // Background
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"

                // Atmosphere
                atmosphereColor={mode === 'bounties' ? "#FFD700" : "#9945FF"}
                atmosphereAltitude={0.12}

                // Country Polygons
                polygonsData={countries}
                polygonAltitude={(d: object) => {
                    const feature = d as GeoFeature;
                    const countryName = feature.properties?.ADMIN;
                    // Raise selected country slightly
                    if (selectedCountry && countryName === selectedCountry) {
                        return mode === 'bounties' ? 0.04 : 0.02; // Higher lift in bounty mode
                    }
                    return 0.006;
                }}
                polygonCapColor={getPolygonCapColor}
                polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
                polygonStrokeColor={getPolygonStrokeColor}
                polygonLabel={(d: object) => {
                    const feature = d as GeoFeature;
                    const countryName = feature.properties?.ADMIN || 'Unknown';

                    // Hide tooltip if this country is selected
                    if (selectedCountry && countryName === selectedCountry) return '';

                    const membersInCountry = members.filter(m => m.country === countryName).length;
                    if (membersInCountry === 0) return '';

                    const logoFile = COUNTRY_LOGOS[countryName] || 'SUPERTEAM.jpg';
                    const logoPath = `/superteam-logos/${logoFile}`;
                    const accentColor = mode === 'bounties' ? '#FFD700' : '#14F195';

                    return `
            <div style="
              background: rgba(0, 0, 0, 0.95);
              backdrop-filter: blur(16px);
              padding: 12px 16px;
              border-radius: 14px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              font-family: inherit;
              display: flex;
              align-items: center;
              gap: 12px;
              min-width: 160px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
              <div style="width: 44px; height: 44px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <img src="${logoPath}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div>
                <div style="color: #ffffff; font-weight: 600; font-size: 15px; margin-bottom: 2px; letter-spacing: -0.01em;">${countryName}</div>
                <div style="color: ${accentColor}; font-size: 12px; font-family: monospace; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: ${accentColor}; box-shadow: 0 0 8px ${accentColor};"></span>
                  ${membersInCountry} members
                </div>
              </div>
            </div>
          `;
                }}
                onPolygonClick={handlePolygonClick}
                onPolygonHover={handlePolygonHover}

                // Arcs (Hidden in bounty mode)
                arcsData={mode === 'bounties' ? [] : HUB_ARCS}
                arcColor={() => ['rgba(153, 69, 255, 0.5)', 'rgba(20, 241, 149, 0.5)']}
                arcDashLength={0.5}
                arcDashGap={0.3}
                arcDashAnimateTime={3000}
                arcStroke={0.3}
                arcAltitudeAutoScale={0.25}

                // Member Points (Hidden in bounty mode)
                pointsData={visibleMembers}
                pointLat={(d: object) => (d as Member).lat}
                pointLng={(d: object) => (d as Member).lng}
                pointColor={(d: object) => {
                    const member = d as Member;
                    if (activeFilter) {
                        if (matchesFilter(member)) {
                            // Use skill color if possible, else default match color
                            // But activeFilter IS the skill name
                            return TECH_COLORS[activeFilter] || '#FF5733'; // Highlight match
                        }
                        return 'rgba(255, 255, 255, 0.1)'; // Dim non-match
                    }
                    return '#14F195'; // Default green
                }}
                pointAltitude={(d: object) => {
                    const member = d as Member;
                    if (activeFilter && matchesFilter(member)) {
                        return 0.02; // Pop out matches
                    }
                    return 0.008;
                }}
                pointRadius={(d: object) => {
                    const member = d as Member;
                    if (activeFilter) {
                        return matchesFilter(member) ? 0.15 : 0.05; // Larger matches, tiny non-matches
                    }
                    return 0.1;
                }}
                pointLabel={(d: object) => {
                    const member = d as Member;
                    const skills = getMemberSkills(member.wallet);
                    const skillTags = skills.slice(0, 3).map(s =>
                        `<span style="display:inline-block; padding:2px 6px; margin-right:4px; border-radius:4px; background:rgba(255,255,255,0.1); font-size:10px;">${s}</span>`
                    ).join('');

                    return `
            <div style="
              background: rgba(0, 0, 0, 0.9);
              backdrop-filter: blur(16px);
              padding: 12px 16px;
              border-radius: 10px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              font-family: inherit;
              min-width: 180px;
            ">
              <div style="color: #ededed; font-weight: 500; font-size: 13px;">${member.name}</div>
              <div style="color: #888; font-size: 11px; margin-top: 2px;">${member.country}</div>
              <div style="margin-top: 8px;">${skillTags}</div>
              <div style="
                margin-top: 10px;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.08);
              ">
                <div style="color: #666; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Wallet</div>
                <div style="color: #14F195; font-size: 12px; font-family: monospace;">${truncateWallet(member.wallet)}</div>
              </div>
            </div>
          `;
                }}

                // Custom Layer -> Bounty Beams
                customLayerData={mode === 'bounties' ? bounties : []}
                customThreeObject={(d: object) => {
                    const bounty = d as Bounty;
                    const height = Math.min(bounty.tokenAmount / 5000, 5) * 0.1 + 0.05;

                    const geometry = new THREE.CylinderGeometry(0.3, 0.3, height, 8);
                    geometry.translate(0, height / 2, 0); // Pivot at base
                    geometry.rotateX(Math.PI / 2); // Rotate to point outwards

                    const material = new THREE.MeshLambertMaterial({
                        color: new THREE.Color('#FFD700'),
                        transparent: true,
                        opacity: 0.8,
                        emissive: new THREE.Color('#FFD700'),
                        emissiveIntensity: 0.5
                    });

                    return new THREE.Mesh(geometry, material);
                }}
                customThreeObjectUpdate={(obj, d) => {
                    Object.assign(obj.position, globeRef.current?.getCoords((d as Bounty).coordinates.lat, (d as Bounty).coordinates.lng, 0.02));
                }}
                customLayerLabel={(d: object) => {
                    const bounty = d as Bounty;
                    return `
                     <div style="
                        background: rgba(20, 20, 20, 0.95);
                        border: 1px solid #FFD700;
                        padding: 12px;
                        border-radius: 8px;
                        color: white;
                        font-family: sans-serif;
                     ">
                        <div style="font-size: 10px; color: #FFD700; text-transform: uppercase;">${bounty.sponsor}</div>
                        <div style="font-weight: bold; font-size: 14px; margin: 4px 0;">${bounty.title}</div>
                        <div style="font-size: 12px; color: #ddd;">${bounty.prize}</div>
                     </div>
                     `;
                }}
            />
        </div>
    );
}
