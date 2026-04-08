'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph';
import { eachDayOfInterval, endOfYear, formatISO, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionActivity {
  totalLastYear: number;
  totalCurrentYear: number;
  maxDailyCount: number;
  days: GitHubContributionDay[];
}

interface GitHubContributionHeatmapProps {
  activity: GitHubContributionActivity;
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const graphToneClass =
  'stroke-[0.6px] ' +
  'data-[level="0"]:fill-emerald-950/20 data-[level="0"]:stroke-emerald-950/30 ' +
  'data-[level="1"]:fill-emerald-900 data-[level="1"]:stroke-emerald-800/70 ' +
  'data-[level="2"]:fill-emerald-700 data-[level="2"]:stroke-emerald-600/80 ' +
  'data-[level="3"]:fill-emerald-500 data-[level="3"]:stroke-emerald-400/90 ' +
  'data-[level="4"]:fill-emerald-300 data-[level="4"]:stroke-emerald-200';

export function GitHubContributionHeatmap({ activity, className }: GitHubContributionHeatmapProps) {
  const currentYear = new Date().getUTCFullYear();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const data = useMemo(() => {
    const currentYearDays = activity.days.filter((day) => day.date.startsWith(String(currentYear)));
    const byDate = new Map(currentYearDays.map((day) => [day.date, day]));
    const now = new Date(Date.UTC(currentYear, 0, 1));

    return eachDayOfInterval({
      start: startOfYear(now),
      end: endOfYear(now),
    }).map((date) => {
      const key = formatISO(date, { representation: 'date' });
      return (
        byDate.get(key) || {
          date: key,
          count: 0,
          level: 0,
        }
      );
    });
  }, [activity.days, currentYear]);

  const weekCount = useMemo(() => {
    if (data.length === 0) {
      return 0;
    }

    const firstDate = new Date(`${data[0].date}T00:00:00Z`);
    const offset = firstDate.getUTCDay();
    return Math.ceil((data.length + offset) / 7);
  }, [data]);

  const graphMetrics = useMemo(() => {
    const margin = containerWidth >= 1200 ? 4 : 3;
    const availableWidth = Math.max(containerWidth - 32, 0);
    const computedBlockSize =
      weekCount > 0 ? Math.floor((availableWidth - margin * (weekCount - 1)) / weekCount) : 10;
    const blockSize = clamp(computedBlockSize, 10, 16);

    return {
      blockSize,
      blockMargin: margin,
      blockRadius: Math.max(3, Math.floor(blockSize / 3)),
    };
  }, [containerWidth, weekCount]);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const update = () => {
      setContainerWidth(element.clientWidth);
    };

    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn('rounded-2xl border border-white/6 bg-black/30 p-4', className)}>
      <ContributionGraph
        data={data}
        totalCount={activity.totalCurrentYear}
        blockSize={graphMetrics.blockSize}
        blockMargin={graphMetrics.blockMargin}
        blockRadius={graphMetrics.blockRadius}
        className="w-full"
      >
        <ContributionGraphCalendar className="rounded-xl">
          {({ activity: day, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={day}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              className={graphToneClass}
            />
          )}
        </ContributionGraphCalendar>

        <ContributionGraphFooter className="mt-4 items-center text-[11px]">
          <ContributionGraphTotalCount className="text-muted-foreground" />
          <ContributionGraphLegend className="text-muted-foreground">
            {({ level }) => (
              <svg width={graphMetrics.blockSize} height={graphMetrics.blockSize} viewBox={`0 0 ${graphMetrics.blockSize} ${graphMetrics.blockSize}`} aria-hidden="true">
                <rect
                  data-level={level}
                  x="0.5"
                  y="0.5"
                  width={graphMetrics.blockSize - 1}
                  height={graphMetrics.blockSize - 1}
                  rx={graphMetrics.blockRadius}
                  className={graphToneClass}
                />
              </svg>
            )}
          </ContributionGraphLegend>
        </ContributionGraphFooter>
      </ContributionGraph>
    </div>
  );
}
