'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { HUB_ARCS, type Member, COUNTRY_COORDS } from '@/lib/mock-data';
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
    __rawCountry?: string | null;
    __canonicalCountry?: string | null;
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
  members: Member[];
  onCountryClick?: (countryName: string) => void;
  onCountryHover?: (countryName: string | null) => void;
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
  kind: 'selected';
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
const MAX_DEVICE_PIXEL_RATIO = 1.25;
const EMPTY_MEMBERS: Member[] = [];
const EMPTY_OPPORTUNITIES: Opportunity[] = [];
const COUNTRY_DATA_URL = '/data/custom.geo.json';
const COUNTRY_POLYGON_ALTITUDE = 0.005;
const SELECTED_POLYGON_ALTITUDE = 0.0064;
const POLYGON_TRANSITION_DURATION_MS = 260;
const GLOBE_TEXTURE_URL = '/textures/earth-blue-marble.jpg';
const GLOBE_BUMP_URL = '/textures/earth-topology.png';
const GLOBE_BACKGROUND_URL = '/textures/night-sky.png';

let cachedCountries: GeoFeature[] | null = null;
let countriesPromise: Promise<GeoFeature[]> | null = null;

function preprocessCountries(data: GeoJSON): GeoFeature[] {
  return data.features
    .map((feature) => {
      const rawCountry = getGeoCountryName(feature);
      const canonicalCountry = normalizeCountry(rawCountry);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          __rawCountry: rawCountry,
          __canonicalCountry: canonicalCountry,
        },
      };
    })
    .filter((feature) => feature.properties.__canonicalCountry && feature.properties.__canonicalCountry !== 'Antarctica');
}

function loadCountries(): Promise<GeoFeature[]> {
  if (cachedCountries) {
    return Promise.resolve(cachedCountries);
  }

  if (!countriesPromise) {
    countriesPromise = fetch(COUNTRY_DATA_URL)
      .then((res) => res.json())
      .then((data: GeoJSON) => {
        cachedCountries = preprocessCountries(data);
        return cachedCountries;
      });
  }

  return countriesPromise;
}

function BuilderGlobeComponent({
  members,
  onCountryClick,
  onCountryHover,
  onGlobeReady,
  selectedCountry,
  globeRef: externalGlobeRef,
  activeFilter,
  mode = 'builders',
  opportunities = EMPTY_OPPORTUNITIES,
}: BuilderGlobeProps) {
  const internalGlobeRef = useRef<GlobeMethods | undefined>(undefined);
  const globeRef = externalGlobeRef || internalGlobeRef;

  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [hoverCountry, setHoverCountry] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedPulseCountry, setSelectedPulseCountry] = useState<string | null>(null);

  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const hasSignaledReady = useRef(false);
  const loggedResolutionMisses = useRef(new Set<string>());
  const pulseTimeoutRef = useRef<number | null>(null);
  const lastReportedHoverRef = useRef<string | null>(null);

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

    return {
      rawCountry: feature?.properties.__rawCountry || null,
      canonicalCountry: feature?.properties.__canonicalCountry || null,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadCountries()
      .then((data) => {
        if (!cancelled) {
          setCountries(data);
        }
      })
      .catch((error) => console.error('Failed to load country polygons:', error));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateDimensions = () => {
      frame = 0;
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;

      setDimensions((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    const onResize = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(updateDimensions);
    };

    updateDimensions();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current || countries.length === 0) {
      return;
    }

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !normalizedSelectedCountry;
      controls.autoRotateSpeed = 0.16;
      controls.enableZoom = true;
      controls.minDistance = 185;
      controls.maxDistance = 360;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = 0.62;
      controls.zoomSpeed = 0.75;
    }

    const renderer = globeRef.current.renderer();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO));
    }

    globeRef.current.pointOfView({ lat: 20, lng: 30, altitude: 2.02 }, 0);
  }, [countries.length, globeRef, normalizedSelectedCountry]);

  useEffect(() => {
    if (!normalizedSelectedCountry || !globeRef.current) {
      return;
    }

    const coords =
      COUNTRY_COORDS[normalizedSelectedCountry] ||
      opportunities.find((item) => normalizeCountry(item.country) === normalizedSelectedCountry)?.coordinates;

    if (coords) {
      globeRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.72 }, 900);
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
    const onVisibilityChange = () => {
      if (!globeRef.current) {
        return;
      }

      if (document.hidden) {
        globeRef.current.pauseAnimation();
        return;
      }

      globeRef.current.resumeAnimation();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [globeRef]);

  useEffect(() => {
    return () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  const membersInCurrentFilter = useMemo(() => {
    if (mode === 'bounties') {
      return EMPTY_MEMBERS;
    }

    return activeFilter
      ? members.filter((member) => getMemberSkills(member).includes(activeFilter))
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

  const palette = useMemo(() => {
    if (mode === 'bounties') {
      return {
        idleFill: 'rgba(12, 11, 8, 0.82)',
        activeFill: 'rgba(58, 40, 8, 0.88)',
        hoverFillIdle: 'rgba(255, 255, 255, 0.12)',
        hoverFillActive: 'rgba(255, 215, 0, 0.2)',
        selectedFill: 'rgba(255, 215, 0, 0.42)',
        idleStroke: 'rgba(255,255,255,0.08)',
        activeStroke: 'rgba(255,215,0,0.16)',
        hoverStrokeIdle: 'rgba(255,255,255,0.26)',
        hoverStrokeActive: 'rgba(255,215,0,0.74)',
        selectedStroke: 'rgba(255,215,0,0.98)',
        sideColor: 'rgba(0,0,0,0.18)',
      };
    }

    return {
      idleFill: 'rgba(10, 12, 19, 0.82)',
      activeFill: 'rgba(10, 12, 19, 0.82)',
      hoverFillIdle: 'rgba(255, 255, 255, 0.08)',
      hoverFillActive: 'rgba(111, 216, 255, 0.18)',
      selectedFill: 'rgba(111, 216, 255, 0.34)',
      idleStroke: 'rgba(255,255,255,0.08)',
      activeStroke: 'rgba(255,255,255,0.08)',
      hoverStrokeIdle: 'rgba(255,255,255,0.24)',
      hoverStrokeActive: 'rgba(111,216,255,0.78)',
      selectedStroke: 'rgba(255,255,255,0.98)',
      sideColor: 'rgba(0,0,0,0.18)',
    };
  }, [mode]);

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
    if (!selectedPulseCountry || normalizedSelectedCountry !== selectedPulseCountry) {
      return [];
    }

    const selectedCoords = COUNTRY_COORDS[selectedPulseCountry];
    if (!selectedCoords) {
      return [];
    }

    return [
      {
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        kind: 'selected',
      } satisfies GlobeRingDatum,
    ];
  }, [normalizedSelectedCountry, selectedPulseCountry]);

  const polygonCapColor = useCallback(
    (polygon: object) => {
      const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

      if (!rawCountry || !canonicalCountry) {
        maybeLogResolutionMiss(rawCountry);
        return palette.idleFill;
      }

      const interactive = isInteractiveCountry(canonicalCountry);
      const isHovered = hoverCountry === canonicalCountry;

      if (normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry) {
        return palette.selectedFill;
      }

      if (isHovered) {
        return interactive ? palette.hoverFillActive : palette.hoverFillIdle;
      }

      return interactive ? palette.activeFill : palette.idleFill;
    },
    [hoverCountry, isInteractiveCountry, maybeLogResolutionMiss, normalizedSelectedCountry, palette, resolvePolygonCountry]
  );

  const polygonStrokeColor = useCallback(
    (polygon: object) => {
      const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

      if (!rawCountry || !canonicalCountry) {
        return palette.idleStroke;
      }

      const interactive = isInteractiveCountry(canonicalCountry);
      const isHovered = hoverCountry === canonicalCountry;
      const isSelected = normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry;

      if (isSelected) {
        return palette.selectedStroke;
      }

      if (isHovered) {
        return interactive ? palette.hoverStrokeActive : palette.hoverStrokeIdle;
      }

      return interactive ? palette.activeStroke : palette.idleStroke;
    },
    [hoverCountry, isInteractiveCountry, normalizedSelectedCountry, palette, resolvePolygonCountry]
  );

  const polygonLabel = useCallback(
    (polygon: object) => {
      const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

      if (!rawCountry || !canonicalCountry) {
        return '';
      }

      if (normalizedSelectedCountry && normalizedSelectedCountry === canonicalCountry) {
        return '';
      }

      const count = getCountryCount(canonicalCountry);
      const metricLabel =
        count > 0
          ? mode === 'bounties'
            ? `${count.toLocaleString()} open opportunities`
            : `${count.toLocaleString()} builders`
          : mode === 'bounties'
            ? 'No live opportunities'
            : 'No builders yet';

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
    },
    [getCountryCount, mode, normalizedSelectedCountry, resolvePolygonCountry]
  );

  const handlePolygonClick = useCallback(
    (polygon: object) => {
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
      }, 1200);

      onCountryClick?.(canonicalCountry);
    },
    [isInteractiveCountry, maybeLogResolutionMiss, onCountryClick, resolvePolygonCountry]
  );

  const handlePolygonHover = (polygon: object | null) => {
    const { rawCountry, canonicalCountry } = resolvePolygonCountry(polygon);

    if (polygon && (!rawCountry || !canonicalCountry)) {
      maybeLogResolutionMiss(rawCountry);
    }

    const nextHoverCountry = canonicalCountry || null;

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

  const opportunityMarkers = useMemo(() => {
    if (mode !== 'bounties') {
      return EMPTY_OPPORTUNITIES;
    }

    return opportunities;
  }, [mode, opportunities]);

  const hubArcs = useMemo(() => {
    if (mode === 'bounties' || normalizedSelectedCountry) {
      return [] as HubArcDatum[];
    }

    return HUB_ARCS as HubArcDatum[];
  }, [mode, normalizedSelectedCountry]);

  if (dimensions.width === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        onGlobeReady={signalGlobeReady}
        animateIn={false}
        waitForGlobeReady={false}
        rendererConfig={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        globeCurvatureResolution={4}
        enablePointerInteraction={true}
        pointerEventsFilter={(_obj: object, data?: object) => {
          const datum = data as Record<string, unknown> | undefined;
          if (!datum) {
            return false;
          }

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

          return (
            Object.prototype.hasOwnProperty.call(datum, 'geometry') &&
            Object.prototype.hasOwnProperty.call(datum, 'properties')
          );
        }}
        showPointerCursor={(_objType: string, objData: object) => {
          const { canonicalCountry } = resolvePolygonCountry(objData);
          return isInteractiveCountry(canonicalCountry);
        }}
        lineHoverPrecision={0.2}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl={GLOBE_BACKGROUND_URL}
        globeImageUrl={GLOBE_TEXTURE_URL}
        bumpImageUrl={GLOBE_BUMP_URL}
        atmosphereColor={mode === 'bounties' ? '#f3c46d' : '#8ddfff'}
        atmosphereAltitude={0.11}
        polygonsData={countries}
        polygonCapCurvatureResolution={4}
        polygonsTransitionDuration={POLYGON_TRANSITION_DURATION_MS}
        polygonAltitude={(polygon: object) => {
          const { canonicalCountry } = resolvePolygonCountry(polygon);

          if (normalizedSelectedCountry && canonicalCountry === normalizedSelectedCountry) {
            return SELECTED_POLYGON_ALTITUDE;
          }

          return COUNTRY_POLYGON_ALTITUDE;
        }}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => palette.sideColor}
        polygonStrokeColor={polygonStrokeColor}
        polygonLabel={polygonLabel}
        onPolygonClick={handlePolygonClick}
        onPolygonHover={handlePolygonHover}
        arcsData={hubArcs}
        arcColor={() => ['rgba(124, 58, 237, 0.24)', 'rgba(111, 216, 255, 0.24)']}
        arcDashLength={1}
        arcDashGap={0}
        arcDashAnimateTime={0}
        arcsTransitionDuration={0}
        arcCurveResolution={8}
        arcAltitudeAutoScale={0.18}
        ringsData={ringsData}
        ringColor={(ring: object) => {
          const datum = ring as GlobeRingDatum;
          return datum.kind === 'selected'
            ? mode === 'bounties'
              ? 'rgba(255, 215, 0, 0.95)'
              : 'rgba(111, 216, 255, 0.9)'
            : 'rgba(111, 216, 255, 0.32)';
        }}
        ringMaxRadius={() => 1.15}
        ringPropagationSpeed={() => 1.35}
        ringRepeatPeriod={() => 760}
        ringResolution={12}
        pointsData={opportunityMarkers}
        pointLat={(point) => (point as Opportunity).coordinates.lat}
        pointLng={(point) => (point as Opportunity).coordinates.lng}
        pointAltitude={(point) => Math.max(0.02, Math.min((point as Opportunity).rewardAmount / 55000, 0.15))}
        pointRadius={0.24}
        pointColor={(point) => {
          const opportunity = point as Opportunity;

          if (opportunity.urgency === 'critical') {
            return '#FFD700';
          }

          return '#E2A336';
        }}
        pointsMerge={true}
        pointResolution={6}
        pointsTransitionDuration={0}
      />
    </div>
  );
}

const BuilderGlobe = memo(BuilderGlobeComponent);

export default BuilderGlobe;
