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

export function smoothLine(points: ChartPoint[]): string {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1] ?? point;
    const middle = (previous.x + point.x) / 2;
    return `${path} C ${middle} ${previous.y} ${middle} ${point.y} ${point.x} ${point.y}`;
  }, '');
}

export function areaUnder(points: ChartPoint[]): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return '';
  return `${smoothLine(points)} L ${last.x} ${CHART_HEIGHT} L ${first.x} ${CHART_HEIGHT} Z`;
}
