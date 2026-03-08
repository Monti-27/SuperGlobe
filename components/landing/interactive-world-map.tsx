'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WorldMap, { type CountryContext, type DataItem, type ISOCode } from 'react-svg-worldmap';

/**
 * Superteam country chapters — ISO alpha-2 codes.
 * Value = relative "builder density" for color intensity.
 */
const SUPERTEAM_COUNTRIES: DataItem<number>[] = [
  { country: 'in' as ISOCode, value: 2800 },
  { country: 'ng' as ISOCode, value: 950 },
  { country: 'vn' as ISOCode, value: 820 },
  { country: 'tr' as ISOCode, value: 750 },
  { country: 'de' as ISOCode, value: 680 },
  { country: 'gb' as ISOCode, value: 640 },
  { country: 'br' as ISOCode, value: 580 },
  { country: 'mx' as ISOCode, value: 520 },
  { country: 'ph' as ISOCode, value: 480 },
  { country: 'jp' as ISOCode, value: 440 },
  { country: 'kr' as ISOCode, value: 400 },
  { country: 'sg' as ISOCode, value: 380 },
  { country: 'ae' as ISOCode, value: 350 },
  { country: 'fr' as ISOCode, value: 320 },
  { country: 'us' as ISOCode, value: 1200 },
  { country: 'ca' as ISOCode, value: 300 },
  { country: 'id' as ISOCode, value: 280 },
  { country: 'ua' as ISOCode, value: 260 },
  { country: 'pl' as ISOCode, value: 240 },
  { country: 'ar' as ISOCode, value: 220 },
  { country: 'ke' as ISOCode, value: 200 },
  { country: 'eg' as ISOCode, value: 180 },
];

interface InteractiveWorldMapProps {
  onCountryClick?: (countryName: string) => void;
  onReady?: () => void;
}

export function InteractiveWorldMap({ onCountryClick, onReady }: InteractiveWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const readyFired = useRef(false);

  // Measure container width and set map to ~105% for a subtle spread
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

  // Once we have a valid width, mark as ready after a tick so the SVG has painted
  useEffect(() => {
    if (mapWidth && !readyFired.current) {
      // Small delay to let the SVG fully render before fading in
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

      // Countries NOT in the dataset — match page background exactly
      if (countryValue === undefined) {
        return {
          fill: '#111114',
          stroke: '#18181c',
          strokeWidth: 0.4,
          cursor: 'default',
          opacity: 1,
        };
      }

      // Countries WITH data — amber gradient based on value
      const value = typeof countryValue === 'number' ? countryValue : 0;
      const range = maxValue - minValue || 1;
      const normalized = (value - minValue) / range;

      // Interpolate from dim amber (#1c1708) to bright amber (#E2A336)
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
    return `${context.countryName}: ${Number(context.countryValue).toLocaleString()} builders`;
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
      {mapWidth && (
        <div
          style={{
            width: `${mapWidth}px`,
            flexShrink: 0,
          }}
        >
          <WorldMap
            color="#E2A336"
            backgroundColor="transparent"
            borderColor="#18181c"
            size={mapWidth}
            data={SUPERTEAM_COUNTRIES}
            valueSuffix="builders"
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
