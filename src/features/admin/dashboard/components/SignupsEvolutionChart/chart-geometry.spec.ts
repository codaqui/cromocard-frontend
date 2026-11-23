import { describe, expect, it } from 'vitest';

import {
  areaUnder,
  CHART_HEIGHT,
  CHART_WIDTH,
  smoothLine,
  toChartPoints,
  xOf,
} from './chart-geometry';

describe('chart-geometry', () => {
  it('espalha os pontos na largura do gráfico, com um único ponto no começo', () => {
    expect(xOf(0, 1)).toBe(12);
    expect(xOf(0, 3)).toBe(12);
    expect(xOf(2, 3)).toBe(CHART_WIDTH - 12);
  });

  it('um único valor vira uma reta de ponta a ponta', () => {
    const points = toChartPoints([5], 10);

    expect(points.map(({ x }) => x)).toEqual([12, CHART_WIDTH - 12]);
    expect(points[0]?.y).toBe(points[1]?.y);
  });

  it('o maior valor fica perto do topo e o zero na base', () => {
    const [low, high] = toChartPoints([0, 10], 10);

    expect(low?.y).toBe(CHART_HEIGHT);
    expect(high?.y).toBe(16);
  });

  it('a curva achata nos picos e acompanha a subida contínua', () => {
    const peak = smoothLine(toChartPoints([0, 10, 0], 10));
    const rising = smoothLine(toChartPoints([0, 5, 10], 10));

    expect(peak.startsWith('M 12 ')).toBe(true);
    expect(peak.match(/C/g)).toHaveLength(2);
    expect(rising).not.toBe(peak);
  });

  it('a área fecha na base e não existe sem pontos', () => {
    const area = areaUnder(toChartPoints([1, 2], 2));

    expect(area.endsWith(`L 12 ${CHART_HEIGHT} Z`)).toBe(true);
    expect(areaUnder([])).toBe('');
  });
});
