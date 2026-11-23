import type { Period, PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';

import type { EvolutionBucket, EvolutionPoint } from '../../dashboard.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const MAX_AXIS_LABELS = 7;
const MAX_MONTH_LABELS = 5;
const MAX_POINTS_WITH_WEEKDAY = 8;

const keyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BRASILIA_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  timeZone: BRASILIA_TIME_ZONE,
});

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  timeZone: BRASILIA_TIME_ZONE,
});

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function partsOf(at: Date) {
  const parts = keyFormatter.formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return { year: part('year'), month: part('month'), day: part('day'), hour: part('hour') };
}

const keyLength: Record<EvolutionBucket, number> = { hour: 13, day: 10, month: 7 };

function bucketKey(at: Date, bucket: EvolutionBucket): string {
  const { year, month, day, hour } = partsOf(at);
  return `${year}-${month}-${day}T${hour}`.slice(0, keyLength[bucket]);
}

const isCurrent = (at: string, bucket: EvolutionBucket, now: Date) =>
  bucketKey(new Date(at), bucket) === bucketKey(now, bucket);

const weekdayOf = (at: Date) => capitalize(weekdayFormatter.format(at).replace('.', ''));

const monthOf = (at: Date) => capitalize(monthFormatter.format(at).replace('.', ''));

function dayMonth(at: Date): string {
  const { day, month } = partsOf(at);
  return `${day}/${month}`;
}

export function pointLabel(at: string, bucket: EvolutionBucket): string {
  const date = new Date(at);
  if (bucket === 'hour') return `${partsOf(date).hour}h`;
  if (bucket === 'month') return `${monthOf(date)}/${partsOf(date).year}`;
  return `${weekdayOf(date)} (${dayMonth(date)})`;
}

function axisText(at: string, bucket: EvolutionBucket, withWeekday: boolean): string {
  const date = new Date(at);
  if (bucket === 'hour') return `${partsOf(date).hour}h`;
  if (bucket === 'month') return `${monthOf(date)}/${partsOf(date).year.slice(2)}`;
  return withWeekday ? pointLabel(at, bucket) : dayMonth(date);
}

function currentText(at: string, bucket: EvolutionBucket, withWeekday: boolean): string {
  const date = new Date(at);
  if (bucket === 'hour') return `Agora (${partsOf(date).hour}h)`;
  if (bucket === 'month') return `${axisText(at, bucket, false)} (atual)`;
  return withWeekday ? `${weekdayOf(date)} (Hoje)` : `${dayMonth(date)} (HOJE)`;
}

function labelIndexes(count: number, maxLabels: number): number[] {
  const step = Math.max(1, Math.ceil((count - 1) / (maxLabels - 1)));
  const indexes = Array.from({ length: count }, (_, index) => index).filter(
    (index) => index % step === 0,
  );
  const last = count - 1;
  const lastPicked = indexes.at(-1) ?? last;
  if (lastPicked === last) return indexes;
  return [...indexes.slice(0, -1), last];
}

export interface AxisLabel {
  index: number;
  text: string;
  current: boolean;
  boxed: boolean;
}

export function axisLabels(
  points: EvolutionPoint[],
  bucket: EvolutionBucket,
  now: Date,
): AxisLabel[] {
  const withWeekday = points.length <= MAX_POINTS_WITH_WEEKDAY;
  const boxesToday = bucket === 'day' && withWeekday;
  const maxLabels = bucket === 'month' ? MAX_MONTH_LABELS : MAX_AXIS_LABELS;
  return labelIndexes(points.length, maxLabels).map((index) => {
    const at = points[index]?.at ?? '';
    const current = isCurrent(at, bucket, now);
    const text = current ? currentText(at, bucket, withWeekday) : axisText(at, bucket, withWeekday);
    return { index, text, current, boxed: current && boxesToday };
  });
}

const bucketNoun: Record<EvolutionBucket, string> = { hour: 'hora', day: 'dia', month: 'mês' };

const presetSubtitle: Record<PeriodPreset, string> = {
  today: 'Novos cadastros por hora hoje.',
  '7d': 'Novos cadastros por dia nos últimos 7 dias.',
  '30d': 'Novos cadastros por dia nos últimos 30 dias.',
  '1y': 'Novos cadastros por mês nos últimos 12 meses.',
};

export function evolutionSubtitle(period: Period, bucket: EvolutionBucket): string {
  if ('preset' in period) return presetSubtitle[period.preset];
  return `Novos cadastros por ${bucketNoun[bucket]} no período selecionado.`;
}
