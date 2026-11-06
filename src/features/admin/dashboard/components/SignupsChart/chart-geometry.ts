export const CHART_WIDTH = 1000;
export const CHART_HEIGHT = 288;
const TOP_INSET = 16;
const SIDE_INSET = 12;

export interface ChartPoint {
  x: number;
  y: number;
}

function xPositions(count: number): number[] {
  if (count === 1) return [SIDE_INSET, CHART_WIDTH - SIDE_INSET];
  const step = (CHART_WIDTH - SIDE_INSET * 2) / (count - 1);
  return Array.from({ length: count }, (_, index) => SIDE_INSET + index * step);
}

export function toChartPoints(values: number[], highest: number): ChartPoint[] {
  const series = values.length === 1 ? [values[0] ?? 0, values[0] ?? 0] : values;
  const xs = xPositions(values.length);
  const usableHeight = CHART_HEIGHT - TOP_INSET;
  return series.map((value, index) => ({
    x: xs[index] ?? 0,
    y: CHART_HEIGHT - (value / highest) * usableHeight,
  }));
}

function slopesBetween(points: ChartPoint[]): number[] {
  return points.slice(1).map((point, index) => {
    const previous = points[index] ?? point;
    return (point.y - previous.y) / (point.x - previous.x);
  });
}

function monotoneTangents(points: ChartPoint[]): number[] {
  const slopes = slopesBetween(points);
  return points.map((_, index) => {
    const before = slopes[index - 1];
    const after = slopes[index];
    if (before === undefined) return after ?? 0;
    if (after === undefined) return before;
    if (before * after <= 0) return 0;
    return (2 * before * after) / (before + after);
  });
}

export function smoothLine(points: ChartPoint[]): string {
  const tangents = monotoneTangents(points);
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1] ?? point;
    const third = (point.x - previous.x) / 3;
    const startY = previous.y + (tangents[index - 1] ?? 0) * third;
    const endY = point.y - (tangents[index] ?? 0) * third;
    return `${path} C ${previous.x + third} ${startY} ${point.x - third} ${endY} ${point.x} ${point.y}`;
  }, '');
}

export function areaUnder(points: ChartPoint[]): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return '';
  return `${smoothLine(points)} L ${last.x} ${CHART_HEIGHT} L ${first.x} ${CHART_HEIGHT} Z`;
}
