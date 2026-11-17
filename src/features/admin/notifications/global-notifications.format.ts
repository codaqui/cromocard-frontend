const TIME_ZONE = 'America/Sao_Paulo';
/** Brasília não tem horário de verão desde 2019: o agendamento usa UTC-3 (CCD100, R3). */
export const BRASILIA_OFFSET = '-03:00';

const countFormatter = new Intl.NumberFormat('pt-BR');

const partsOf = (iso: string, options: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, ...options })
      .formatToParts(new Date(iso))
      .map(({ type, value }) => [type, value]),
  );

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatCount = (value: number) => countFormatter.format(value);

export const usersLabel = (count: number) =>
  `${formatCount(count)} ${count === 1 ? 'usuário' : 'usuários'}`;

/** "13 Nov 2026 • 20:30", como no histórico do Figma. */
export function formatDispatchDate(iso: string): string {
  const { day, month, year, hour, minute } = partsOf(iso, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${day} ${capitalize((month ?? '').replace('.', ''))} ${year} • ${hour}:${minute}`;
}

/** "13/11/2026, 20:30" no resumo do agendamento. */
export function formatScheduleDate(iso: string): string {
  const { day, month, year, hour, minute } = partsOf(iso, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${day}/${month}/${year}, ${hour}:${minute}`;
}

/** "Sexta-feira, 13 de novembro de 2026" para o dia escolhido no calendário (AAAA-MM-DD). */
export function formatLongDay(day: string): string {
  const text = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${day}T12:00:00Z`));
  return capitalize(text);
}

/** "13/11/2026 às 20:30" no aviso antes de agendar. */
export const formatScheduleNotice = (day: string, time: string) =>
  `${day.split('-').reverse().join('/')} às ${time}`;

/** Dia de hoje em Brasília (AAAA-MM-DD). */
export function todayInBrasilia(now = new Date()): string {
  const { day, month, year } = partsOf(now.toISOString(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${year}-${month}-${day}`;
}

export const toScheduledAt = (day: string, time: string) =>
  new Date(`${day}T${time}:00${BRASILIA_OFFSET}`).toISOString();
