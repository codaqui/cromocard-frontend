import { useId, useState } from 'react';

import { formatCount } from '../../dashboard.format';
import type { EvolutionBucket, EvolutionPoint } from '../../dashboard.types';
import {
  areaUnder,
  CHART_HEIGHT,
  CHART_WIDTH,
  type ChartPoint,
  smoothLine,
  toChartPoints,
  xOf,
} from './chart-geometry';
import { pointLabel } from './evolution-labels';
import styles from './SignupsEvolutionChart.module.css';

type Tone = 'collectors' | 'sellers';

interface EvolutionPlotProps {
  points: EvolutionPoint[];
  bucket: EvolutionBucket;
}

const HEADROOM = 1.25;
const GRID_LINES = [0.25, 0.5, 0.75];
const PERCENT = 100;

const plural = (count: number, singular: string, many: string) =>
  `${formatCount(count)} ${count === 1 ? singular : many}`;

const collectorsText = (count: number) => plural(count, 'novo cadastro', 'novos cadastros');

const sellersText = (count: number) =>
  plural(count, 'lojista certificado', 'lojistas certificados');

const pointSummary = (point: EvolutionPoint, bucket: EvolutionBucket) =>
  `${pointLabel(point.at, bucket)}: ${collectorsText(point.collectors)} e ${sellersText(point.sellers)}`;

function seriesOf(points: EvolutionPoint[], tone: Tone): ChartPoint[] {
  const values = points.map((point) => point[tone]);
  return toChartPoints(values, Math.max(1, ...values) * HEADROOM);
}

function Series({ points, tone, fillId }: { points: ChartPoint[]; tone: Tone; fillId?: string }) {
  const last = points.at(-1);

  return (
    <g>
      {fillId && <path d={areaUnder(points)} fill={`url(#${fillId})`} />}
      <path d={smoothLine(points)} className={styles[`${tone}Line`]} />
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r={12} className={styles[`${tone}Halo`]} />
          <circle cx={last.x} cy={last.y} r={6} className={styles[`${tone}Dot`]} />
        </>
      )}
    </g>
  );
}

function Gradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" className={styles.fillStart} />
        <stop offset="1" className={styles.fillEnd} />
      </linearGradient>
    </defs>
  );
}

function GridLines() {
  return GRID_LINES.map((ratio) => (
    <line
      key={ratio}
      x1={0}
      x2={CHART_WIDTH}
      y1={CHART_HEIGHT * ratio}
      y2={CHART_HEIGHT * ratio}
      className={styles.grid}
    />
  ));
}

interface HoverBandsProps extends EvolutionPlotProps {
  onSelect: (index: number | null) => void;
}

function HoverBands({ points, bucket, onSelect }: HoverBandsProps) {
  const width = CHART_WIDTH / points.length;

  return points.map((point, index) => (
    <rect
      key={point.at}
      x={xOf(index, points.length) - width / 2}
      y={0}
      width={width}
      height={CHART_HEIGHT}
      className={styles.band}
      tabIndex={0}
      role="img"
      aria-label={pointSummary(point, bucket)}
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      onMouseLeave={() => onSelect(null)}
      onBlur={() => onSelect(null)}
    />
  ));
}

interface TooltipProps {
  point: EvolutionPoint;
  bucket: EvolutionBucket;
  anchor: ChartPoint;
}

const keepInsidePlot = (ratio: number) => (tooltip: HTMLDivElement | null) => {
  if (!tooltip) return;
  const plotWidth = tooltip.parentElement?.clientWidth ?? 0;
  const centered = ratio * plotWidth - tooltip.offsetWidth / 2;
  const left = Math.min(Math.max(0, centered), plotWidth - tooltip.offsetWidth);
  tooltip.style.left = `${Math.max(0, left)}px`;
};

function Tooltip({ point, bucket, anchor }: TooltipProps) {
  const top = `${(anchor.y / CHART_HEIGHT) * PERCENT}%`;

  return (
    <div
      ref={keepInsidePlot(anchor.x / CHART_WIDTH)}
      role="tooltip"
      className={styles.tooltip}
      style={{ top }}
    >
      <p className={styles.tooltipTitle}>{pointLabel(point.at, bucket)}</p>
      <p className={styles.tooltipCollectors}>{collectorsText(point.collectors)}</p>
      <p className={styles.tooltipSellers}>{sellersText(point.sellers)}</p>
    </div>
  );
}

export function EvolutionPlot({ points, bucket }: EvolutionPlotProps) {
  const fillId = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const collectors = seriesOf(points, 'collectors');
  const sellers = seriesOf(points, 'sellers');
  const point = selected === null ? undefined : points[selected];
  const anchor = selected === null ? undefined : collectors[selected];

  return (
    <div className={styles.plot}>
      <svg
        role="group"
        aria-label="Pontos do gráfico"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className={styles.svg}
      >
        <Gradient id={fillId} />
        <GridLines />
        <Series points={collectors} tone="collectors" fillId={fillId} />
        <Series points={sellers} tone="sellers" />
        <HoverBands points={points} bucket={bucket} onSelect={setSelected} />
      </svg>
      {point && anchor && <Tooltip point={point} bucket={bucket} anchor={anchor} />}
    </div>
  );
}
