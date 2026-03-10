'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { parseCSVData, HUB_ARCS, type Member, COUNTRY_COORDS } from '@/lib/mock-data';
import { getMemberSkills } from '@/lib/utils';
import { type Opportunity } from '@/lib/services/superteam-earn';
import { displayCountryName, getGeoCountryName, normalizeCountry } from '@/lib/country-normalization';

interface GeoFeature {
  type: string;
  properties: {
    name?: string;
    NAME?: string;
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
  onCountryHover?: (countryName: string | null) => void;
  onMembersLoaded?: (members: Member[]) => void;
  onGlobeReady?: () => void;
  selectedCountry?: string | null;
  globeRef?: React.MutableRefObject<GlobeMethods | undefined>;
  activeFilter?: string | null;
  mode?: 'builders' | 'bounties';
  opportunities?: Opportunity[];
}

interface GlobeRingDatum {
  lat: number;
  lng: number;
  kind: 'ambient' | 'selected';
}

interface HubArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

const COUNTRY_LOGOS: Record<string, string> = {
  Nigeria: 'nigeria.jpg',
  India: 'india.jpg',
  Germany: 'germant.jpg',
  'United Kingdom': 'uk.jpg',
  Brazil: 'brasil.jpg',
  Japan: 'japan.jpg',
  'South Korea': 'korea.png',
  Singapore: 'singapore.jpg',
  Malaysia: 'malysia.jpg',
  UAE: 'uae.jpg',
  Canada: 'canada.jpg',
  Balkans: 'balkan.jpg',
  Turkey: 'SUPERTEAM.jpg',
  Vietnam: 'SUPERTEAM.jpg',
  Philippines: 'SUPERTEAM.jpg',
  France: 'SUPERTEAM.jpg',
  Poland: 'poland.jpg',
  Indonesia: 'indonesia.jpg',
  Georgia: 'georgia.jpg',
  Kazakhstan: 'kazakstan.png',
  Ireland: 'irelnad.jpg',
  Netherlands: 'SUPERTEAM.jpg',
  Mexico: 'SUPERTEAM.jpg',
  Spain: 'SUPERTEAM.jpg',
  Ukraine: 'SUPERTEAM.jpg',
};

const DRAG_THRESHOLD_PX = 6;
const BUILDER_ACCENT = '#6fd8ff';

export default function BuilderGlobe({
  onCountryClick,
  onCountryHover,
  onMembersLoaded,
  onGlobeReady,
  selectedCountry,
  globeRef: externalGlobeRef,
  activeFilter,
  mode = 'builders',
  opportunities = [],
}: BuilderGlobeProps) {
  const internalGlobeRef = useRef<GlobeMethods | undefined>(undefined);
  const globeRef = externalGlobeRef || internalGlobeRef;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedPulseCountry, setSelectedPulseCountry] = useState<string | null>(null);

  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const hasSignaledReady = useRef(false);
  const loggedResolutionMisses = useRef(new Set<string>());
  const pulseTimeoutRef = useRef<number | null>(null);
  const lastReportedHoverRef = useRef<string | null>(null);
  const normalizedCountryCacheRef = useRef(new Map<string, string | null>());

  const normalizedSelectedCountry = useMemo(
    () => normalizeCountry(selectedCountry) || null,
    [selectedCountry]
  );

  const signalGlobeReady = useCallback(() => {
    if (hasSignaledReady.current) {
      return;
    }

    hasSignaledReady.current = true;
    onGlobeReady?.();
  }, [onGlobeReady]);

  const maybeLogResolutionMiss = useCallback((rawCountry: string | null) => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const key = rawCountry || '__missing__';
    if (loggedResolutionMisses.current.has(key)) {
      return;
    }

    loggedResolutionMisses.current.add(key);
    console.debug('[BuilderGlobe] Country resolution miss', { rawCountry });
  }, []);

  const resolvePolygonCountry = useCallback((polygon: object | null) => {
    const feature = polygon as GeoFeature | null;
    const rawCountry = getGeoCountryName(feature);
    let canonicalCountry: string | null = null;

    if (rawCountry) {
      if (normalizedCountryCacheRef.current.has(rawCountry)) {
        canonicalCountry = normalizedCountryCacheRef.current.get(rawCountry) || null;
      } else {
        canonicalCountry = normalizeCountry(rawCountry);
        normalizedCountryCacheRef.current.set(rawCountry, canonicalCountry);
      }
    }

    return {
      rawCountry,
      canonicalCountry,
    };
  }, []);

  useEffect(() => {
    fetch('/data/world.geojson')
      .then((res) => res.json())
      .then((data: GeoJSON) => {
        setCountries(
          data.features.filter((feature) => {
            const canonical = normalizeCountry(getGeoCountryName(feature));
            return canonical !== 'Antarctica';
          })
        );
      })
      .catch((err) => console.error('Failed to load country polygons:', err));
  }, []);

  useEffect(() => {
    fetch('/members-data/Shareable Wallets (Public Access).csv')
      .then((res) => res.text())
      .then((csvText) => {
        const parsedMembers = parseCSVData(csvText);
        setMembers(parsedMembers);
        onMembersLoaded?.(parsedMembers);
      })
      .catch((err) => console.error('Failed to load members CSV:', err));
  }, [onMembersLoaded]);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !normalizedSelectedCountry;
      controls.autoRotateSpeed = 0.2;
      controls.enableZoom = true;
      controls.minDistance = 180;
      controls.maxDistance = 380;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.8;
    }

    globeRef.current.pointOfView({ lat: 20, lng: 30, altitude: 2.08 }, 800);
  }, [countries, globeRef, normalizedSelectedCountry]);

  useEffect(() => {
    if (!normalizedSelectedCountry || !globeRef.current) {
      return;
    }

    const coords =
      COUNTRY_COORDS[normalizedSelectedCountry] ||
      opportunities.find((item) => normalizeCountry(item.country) === normalizedSelectedCountry)?.coordinates;

    if (coords) {
      globeRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.72 }, 1100);
    }
  }, [normalizedSelectedCountry, globeRef, opportunities]);

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (!controls) {
      return;
    }

    controls.autoRotate = !hoverCountry && !normalizedSelectedCountry;
  }, [hoverCountry, normalizedSelectedCountry, globeRef]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (countries.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      signalGlobeReady();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [countries.length, dimensions.height, dimensions.width, signalGlobeReady]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      mouseDownPos.current = { x: event.clientX, y: event.clientY };
      isDragging.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseDownPos.current) {
        return;
      }

      const dx = event.clientX - mouseDownPos.current.x;
      const dy = event.clientY - mouseDownPos.current.y;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
        isDragging.current = true;
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

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  const membersInCurrentFilter = useMemo(() => {
    if (mode === 'bounties') {
      return [];
    }

    return activeFilter
      ? members.filter((member) => getMemberSkills(member.wallet).includes(activeFilter))
      : members;
  }, [members, activeFilter, mode]);

  const memberCountByCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of membersInCurrentFilter) {
      const canonicalCountry = normalizeCountry(member.country);
      if (!canonicalCountry) {
        continue;
      }
      map.set(canonicalCountry, (map.get(canonicalCountry) || 0) + 1);
    }
    return map;
  }, [membersInCurrentFilter]);

  const opportunityCountByCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const opportunity of opportunities) {
      const canonicalCountry = normalizeCountry(opportunity.country);
      if (!canonicalCountry) {
        continue;
      }
      map.set(canonicalCountry, (map.get(canonicalCountry) || 0) + 1);
    }
    return map;
  }, [opportunities]);

  const activeCountByCountry = mode === 'builders' ? memberCountByCountry : opportunityCountByCountry;

  const getCountryCount = useCallback(
    (country: string | null) => {
      if (!country) {
        return 0;
      }

      return activeCountByCountry.get(country) || 0;
    },
    [activeCountByCountry]
  );

  const isInteractiveCountry = useCallback(
    (country: string | null) => getCountryCount(country) > 0,
    [getCountryCount]
  );

  const ringsData = useMemo(() => {
    const rings: GlobeRingDatum[] = [];

    if (selectedPulseCountry && normalizedSelectedCountry === selectedPulseCountry) {
      const selectedCoords = COUNTRY_COORDS[selectedPulseCountry];
      if (selectedCoords) {
        rings.push({
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
          kind: 'selected',
        });
      }
    }

    return rings;
  }, [normalizedSelectedCountry, selectedPulseCountry]);

  const polygonCapColor = (polygon: object) => {
    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

    if (!rawCountry || !canonicalCountry) {
      maybeLogResolutionMiss(rawCountry);
      return 'rgba(0,0,0,0)';
    }

    const isSelected = normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry;
    const isHovered = hoverCountry && canonicalCountry === hoverCountry;

    // Border-only hover/selection UI: never tint polygon fills.
    if (isSelected || isHovered) {
      return 'rgba(0,0,0,0)';
    }

    return 'rgba(0,0,0,0)';
  };

  const polygonStrokeColor = (polygon: object) => {
    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

    if (!rawCountry || !canonicalCountry) {
      return 'rgba(255,255,255,0.08)';
    }

    const isSelected = normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry;
    if (isSelected) {
      return mode === 'bounties' ? 'rgba(255, 215, 0, 0.98)' : 'rgba(255,255,255,0.98)';
    }

    if (hoverCountry && canonicalCountry === hoverCountry) {
      return mode === 'bounties' ? 'rgba(255, 215, 0, 0.62)' : 'rgba(111, 216, 255, 0.72)';
    }

    return isInteractiveCountry(canonicalCountry) ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)';
  };

  const polygonLabel = (polygon: object) => {
    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

    if (!rawCountry || !canonicalCountry || !isInteractiveCountry(canonicalCountry)) {
      return '';
    }

    if (normalizedSelectedCountry && normalizedSelectedCountry === canonicalCountry) {
      return '';
    }

    const count = getCountryCount(canonicalCountry);
    const metricLabel =
      mode === 'bounties'
        ? `${count.toLocaleString()} open opportunities`
        : `${count.toLocaleString()} builders`;

    const logoFile = COUNTRY_LOGOS[canonicalCountry] || 'SUPERTEAM.jpg';
    const logoPath = `/superteam-logos/${logoFile}`;
    const accent = mode === 'bounties' ? '#FFD700' : BUILDER_ACCENT;

    return `
      <div style="
        background: rgba(4, 7, 18, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.22);
        padding: 12px 14px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 220px;
        backdrop-filter: blur(8px);
        box-shadow: 0 16px 42px rgba(0,0,0,0.5);
      ">
        <img src="${logoPath}" style="width: 42px; height: 42px; border-radius: 11px; object-fit: cover; border: 1px solid rgba(255,255,255,0.22)" />
        <div>
          <div style="color: #fff; font-size: 14px; font-weight: 700; letter-spacing: 0.01em;">${displayCountryName(canonicalCountry)}</div>
          <div style="color: ${accent}; font-size: 12px; margin-top: 2px; font-family: monospace;">${metricLabel}</div>
        </div>
      </div>
    `;
  };

  const handlePolygonClick = (polygon: object) => {
    if (isDragging.current) {
      return;
    }

    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);
    if (!rawCountry || !canonicalCountry) {
      maybeLogResolutionMiss(rawCountry);
      return;
    }

    if (!isInteractiveCountry(canonicalCountry)) {
      return;
    }

    setSelectedPulseCountry(canonicalCountry);
    if (pulseTimeoutRef.current !== null) {
      window.clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = window.setTimeout(() => {
      setSelectedPulseCountry((current) => (current === canonicalCountry ? null : current));
    }, 1500);

    onCountryClick?.(canonicalCountry);
  };

  const handlePolygonHover = (polygon: object | null) => {
    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

    if (polygon && (!rawCountry || !canonicalCountry)) {
      maybeLogResolutionMiss(rawCountry);
    }

    const nextHoverCountry =
      canonicalCountry && isInteractiveCountry(canonicalCountry)
        ? canonicalCountry
        : null;
    setHoverCountry((prev) => (prev === nextHoverCountry ? prev : nextHoverCountry));

    if (lastReportedHoverRef.current !== nextHoverCountry) {
      lastReportedHoverRef.current = nextHoverCountry;
      onCountryHover?.(nextHoverCountry);
    }

    const controls = globeRef.current?.controls();
    if (controls) {
      controls.autoRotate = !nextHoverCountry && !normalizedSelectedCountry;
    }
  };

  if (dimensions.width === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        onGlobeReady={signalGlobeReady}
        animateIn={false}
        waitForGlobeReady={false}
        rendererConfig={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        globeCurvatureResolution={8}
        enablePointerInteraction={true}
        pointerEventsFilter={(_obj: object, data?: object) => {
          const datum = data as Record<string, unknown> | undefined;
          if (!datum) {
            // Ignore non-data scene objects (globe sphere, helpers).
            return false;
          }

          // Keep hover/click locked on country polygons; arcs/columns should not steal pointer events.
          if (
            Object.prototype.hasOwnProperty.call(datum, 'startLat') &&
            Object.prototype.hasOwnProperty.call(datum, 'endLat')
          ) {
            return false;
          }

          if (
            Object.prototype.hasOwnProperty.call(datum, 'rewardAmount') &&
            Object.prototype.hasOwnProperty.call(datum, 'coordinates')
          ) {
            return false;
          }

          // Allow pointer events only for GeoJSON country polygon data.
          const hasGeoShape =
            Object.prototype.hasOwnProperty.call(datum, 'geometry') &&
            Object.prototype.hasOwnProperty.call(datum, 'properties');

          return hasGeoShape;
        }}
        showPointerCursor={(_objType: string, objData: object) => {
          const { canonicalCountry } = resolvePolygonCountry(objData);
          return isInteractiveCountry(canonicalCountry);
        }}
        lineHoverPrecision={0.12}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/textures/earth-night.jpg"
        atmosphereColor={mode === 'bounties' ? '#ffd27a' : '#6fd8ff'}
        atmosphereAltitude={0.085}
        polygonsData={countries}
        polygonCapCurvatureResolution={3}
        polygonsTransitionDuration={0}
        polygonAltitude={(polygon: object) => {
          const { canonicalCountry } = resolvePolygonCountry(polygon);

          if (normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry) {
            return mode === 'bounties' ? 0.006 : 0.0055;
          }

          // Keep a stable altitude to make hit-testing consistent across full country area.
          return 0.004;
        }}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={polygonStrokeColor}
        polygonLabel={polygonLabel}
        onPolygonClick={handlePolygonClick}
        onPolygonHover={handlePolygonHover}
        arcsData={mode === 'bounties' ? [] : (HUB_ARCS as HubArcDatum[])}
        arcColor={() => ['rgba(124, 58, 237, 0.28)', 'rgba(111, 216, 255, 0.28)']}
        arcDashLength={1}
        arcDashGap={0}
        arcDashAnimateTime={0}
        arcsTransitionDuration={0}
        arcCurveResolution={14}
        arcAltitudeAutoScale={0.2}
        ringsData={ringsData}
        ringColor={(ring: object) => {
          const datum = ring as GlobeRingDatum;
          if (datum.kind === 'selected') {
            return mode === 'bounties' ? 'rgba(255, 215, 0, 0.95)' : 'rgba(111, 216, 255, 0.9)';
          }

          return mode === 'bounties' ? 'rgba(255, 215, 0, 0.45)' : 'rgba(111, 216, 255, 0.32)';
        }}
        ringMaxRadius={(ring: object) => {
          const datum = ring as GlobeRingDatum;
          return datum.kind === 'selected' ? 1.3 : 0.86;
        }}
        ringPropagationSpeed={(ring: object) => {
          const datum = ring as GlobeRingDatum;
          return datum.kind === 'selected' ? 1.5 : 0.55;
        }}
        ringRepeatPeriod={(ring: object) => {
          const datum = ring as GlobeRingDatum;
          return datum.kind === 'selected' ? 820 : 0;
        }}
        ringResolution={18}
        pointsData={[]}
        customLayerData={mode === 'bounties' ? opportunities : []}
        customThreeObject={(obj: object) => {
          const opportunity = obj as Opportunity;
          const height = Math.max(0.05, Math.min(opportunity.rewardAmount / 8000, 1.1));

          const geometry = new THREE.CylinderGeometry(0.25, 0.25, height, 6);
          geometry.translate(0, height / 2, 0);
          geometry.rotateX(Math.PI / 2);

          const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color('#FFD700'),
            transparent: true,
            opacity: 0.82,
            emissive: new THREE.Color('#FFD700'),
            emissiveIntensity: 0.45,
          });

          return new THREE.Mesh(geometry, material);
        }}
        customThreeObjectUpdate={(obj, datum) => {
          const opportunity = datum as Opportunity;
          const coords = globeRef.current?.getCoords(opportunity.coordinates.lat, opportunity.coordinates.lng, 0.02);
          if (coords) {
            Object.assign(obj.position, coords);
          }
        }}
        customLayerLabel={(obj: object) => {
          const opportunity = obj as Opportunity;
          return `
            <div style="
              background: rgba(18, 18, 18, 0.96);
              border: 1px solid rgba(255, 215, 0, 0.75);
              padding: 12px;
              border-radius: 10px;
              color: white;
              min-width: 220px;
            ">
              <div style="font-size: 10px; color: #FFD700; text-transform: uppercase; letter-spacing: 0.08em;">
                ${opportunity.sponsorName}
              </div>
              <div style="font-size: 14px; font-weight: 700; margin: 6px 0 4px;">
                ${opportunity.title}
              </div>
              <div style="font-size: 12px; color: #e5e5e5;">
                ${opportunity.rewardLabel}
              </div>
            </div>
          `;
        }}
      />
    </div>
  );
}
