'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WorldMap, { regions, type CountryContext, type DataItem, type ISOCode } from 'react-svg-worldmap';

const COUNTRY_TO_ISO: Record<string, string> = {
  'India': 'in',
  'Turkey': 'tr',
  'Vietnam': 'vn',
  'Germany': 'de',
  'United Kingdom': 'gb',
  'UAE': 'ae',
  'Nigeria': 'ng',
  'Brazil': 'br',
  'Philippines': 'ph',
  'Malaysia': 'my',
  'Balkans': 'rs',
  'Japan': 'jp',
  'France': 'fr',
  'Canada': 'ca',
  'Singapore': 'sg',
  'South Korea': 'kr',
  'Indonesia': 'id',
  'Ireland': 'ie',
  'Kazakhstan': 'kz',
  'Netherlands': 'nl',
  'Poland': 'pl',
  'Georgia': 'ge',
  'Spain': 'es',
  'Ukraine': 'ua',
  'Mexico': 'mx',
  'USA': 'us',
  'Australia': 'au',
  'Israel': 'il',
};

const SUPPORTED_ISO_CODES = new Set(regions.map((region) => region.code.toLowerCase()));

interface InteractiveWorldMapProps {
  onCountryClick?: (countryName: string) => void;
  onReady?: () => void;
}

export function InteractiveWorldMap({ onCountryClick, onReady }: InteractiveWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mapData, setMapData] = useState<DataItem<number>[]>([]);
  const readyFired = useRef(false);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data && data.countries) {
          const formattedData: DataItem<number>[] = data.countries
            .map((countryRecord: { country: string; count: number }) => {
              const country = COUNTRY_TO_ISO[countryRecord.country];

              if (!country || !SUPPORTED_ISO_CODES.has(country)) {
                return null;
              }

              return {
                country: country as ISOCode,
                value: countryRecord.count,
              };
            })
            .filter((item: DataItem<number> | null): item is DataItem<number> => Boolean(item));
            
          setMapData(formattedData);
        }
      } catch (error) {
        console.error('Failed to load map data', error);
      }
    }
    
    fetchMapData();
  }, []);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setMapWidth(Math.round(containerWidth * 1.05));
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (mapWidth && !readyFired.current) {
      const timer = setTimeout(() => {
        setIsReady(true);
        readyFired.current = true;
        onReady?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapWidth, onReady]);

  const styleFunction = useCallback(
    (context: CountryContext<number>): React.CSSProperties => {
      const { countryValue, minValue, maxValue } = context;

      if (countryValue === undefined) {
        return {
          fill: '#111114',
          stroke: '#18181c',
          strokeWidth: 0.4,
          cursor: 'default',
          opacity: 1,
        };
      }

      const value = typeof countryValue === 'number' ? countryValue : 0;
      const range = maxValue - minValue || 1;
      const normalized = range > 0 ? (value - minValue) / range : 1;

      const minR = 0x1c, minG = 0x17, minB = 0x08;
      const maxR = 0xe2, maxG = 0xa3, maxB = 0x36;

      const r = Math.round(minR + (maxR - minR) * normalized);
      const g = Math.round(minG + (maxG - minG) * normalized);
      const b = Math.round(minB + (maxB - minB) * normalized);

      const fillColor = `rgb(${r}, ${g}, ${b})`;

      return {
        fill: fillColor,
        stroke: '#09090B',
        strokeWidth: 0.5,
        cursor: 'pointer',
        opacity: 0.85 + normalized * 0.15,
      };
    },
    []
  );

  const handleClick = useCallback(
    (context: CountryContext<number> & { event: React.MouseEvent<SVGElement, Event> }) => {
      if (context.countryValue !== undefined && onCountryClick) {
        onCountryClick(context.countryName);
      }
    },
    [onCountryClick]
  );

  const tooltipTextFunction = useCallback((context: CountryContext<number>): string => {
    if (context.countryValue === undefined) return '';
    return String(context.countryValue);
  }, []);

  return (
    <div
      ref={containerRef}
      className="interactive-world-map w-full flex items-center justify-center overflow-hidden"
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {mapWidth && mapData.length > 0 && (
        <div
          style={{
            width: `${mapWidth}px`,
            flexShrink: 0,
          }}
        >
          <style>
            {`
              .interactive-world-map svg path[fill]:not([fill="#111114"]):hover {
                fill: #E2A336 !important;
                opacity: 1 !important;
                transition: fill 0.2s ease, opacity 0.2s ease;
              }
            `}
          </style>
          <WorldMap
            color="#E2A336"
            backgroundColor="transparent"
            borderColor="#18181c"
            size={mapWidth}
            data={mapData}
            tooltipBgColor="#18181B"
            tooltipTextColor="#E2A336"
            strokeOpacity={0.12}
            frame={false}
            richInteraction
            styleFunction={styleFunction}
            onClickFunction={handleClick}
            tooltipTextFunction={tooltipTextFunction}
          />
        </div>
      )}
    </div>
  );
}
