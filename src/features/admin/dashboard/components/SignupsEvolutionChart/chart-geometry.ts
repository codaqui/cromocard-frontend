export const CHART_WIDTH = 1000;
export const CHART_HEIGHT = 288;
const TOP_INSET = 16;
const SIDE_INSET = 12;

export interface ChartPoint {
  x: number;
  y: number;
}

interface TangentPoint extends ChartPoint {
  tangent: number;
}

interface Segment<T> {
  from: T;
  to: T;
}

export function xOf(index: number, count: number): number {
  if (count === 1) return SIDE_INSET;
  return SIDE_INSET + index * ((CHART_WIDTH - SIDE_INSET * 2) / (count - 1));
}

export function toChartPoints(values: number[], highest: number): ChartPoint[] {
  const series = values.length === 1 ? [...values, ...values] : values;
  const usableHeight = CHART_HEIGHT - TOP_INSET;
  return series.map((value, index) => ({
    x: xOf(index, series.length),
    y: CHART_HEIGHT - (value / highest) * usableHeight,
  }));
}

function segmentsOf<T>(items: T[]): Segment<T>[] {
  return items.flatMap((from, index) => {
    const to = items[index + 1];
    return to === undefined ? [] : [{ from, to }];
  });
}

const slopeOf = ({ from, to }: Segment<ChartPoint>) => (to.y - from.y) / (to.x - from.x);

function tangentAt(slopes: number[], index: number): number {
  const before = slopes[index - 1];
  const after = slopes[index];
  if (before === undefined) return after ?? 0;
  if (after === undefined) return before;
  if (before * after <= 0) return 0;
  return (2 * before * after) / (before + after);
}

function withTangents(points: ChartPoint[]): TangentPoint[] {
  const slopes = segmentsOf(points).map(slopeOf);
  return points.map((point, index) => ({ ...point, tangent: tangentAt(slopes, index) }));
}

function curveTo({ from, to }: Segment<TangentPoint>): string {
  const third = (to.x - from.x) / 3;
  const startY = from.y + from.tangent * third;
  const endY = to.y - to.tangent * third;
  return `C ${from.x + third} ${startY} ${to.x - third} ${endY} ${to.x} ${to.y}`;
}

export function smoothLine(points: ChartPoint[]): string {
  const [first] = points;
  if (!first) return '';
  const curves = segmentsOf(withTangents(points)).map(curveTo);
  return [`M ${first.x} ${first.y}`, ...curves].join(' ');
}

export function areaUnder(points: ChartPoint[]): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return '';
  return `${smoothLine(points)} L ${last.x} ${CHART_HEIGHT} L ${first.x} ${CHART_HEIGHT} Z`;
}
