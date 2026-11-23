import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notificationFormSchema, SCHEDULE_TOO_SOON } from './global-notifications.schemas';
import { notificationFormDefaults } from './hooks/useNotificationForm';

const NOW = new Date('2026-11-16T15:00:00Z');
const filled = () => ({ ...notificationFormDefaults(), title: ' Novo álbum ', content: 'Texto' });
const issuesOf = (values: object) => {
  const result = notificationFormSchema.safeParse(values);
  return result.success
    ? []
    : result.error.issues.map(({ path, message }) => [path.join('.'), message]);
};

describe('notificationFormSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('envia na hora sem link e sem horário', () => {
    expect(notificationFormSchema.parse(filled())).toEqual({
      title: 'Novo álbum',
      content: 'Texto',
      audience: 'ALL',
      channels: ['IN_APP'],
    });
  });

  it('CA2: título e mensagem obrigatórios e com limite', () => {
    expect(issuesOf({ ...filled(), title: '', content: ' ' })).toEqual([
      ['title', 'Informe o título.'],
      ['content', 'Informe a mensagem.'],
    ]);
    expect(issuesOf({ ...filled(), title: 'a'.repeat(121), content: 'b'.repeat(501) })).toEqual([
      ['title', 'Use até 120 caracteres.'],
      ['content', 'Use até 500 caracteres.'],
    ]);
  });

  it('CA9: link é caminho do site ou http(s)', () => {
    expect(notificationFormSchema.parse({ ...filled(), link: '/albuns/copa' }).link).toBe(
      '/albuns/copa',
    );
    expect(issuesOf({ ...filled(), link: 'albuns/copa' })).toEqual([
      ['link', 'Informe um caminho que comece com / ou um link http(s).'],
    ]);
  });

  it('CCD101 CA4: pelo menos um canal', () => {
    expect(issuesOf({ ...filled(), channels: [] })).toEqual([
      ['channels', 'Escolha pelo menos um canal.'],
    ]);
  });

  it('CCD100 CA1 e CA2: agenda no horário de Brasília com 5 minutos de antecedência', () => {
    const scheduled = { ...filled(), when: 'SCHEDULED', scheduleDay: '2026-11-16' };

    expect(
      notificationFormSchema.parse({ ...scheduled, scheduleHour: '12', scheduleMinute: '5' })
        .scheduledAt,
    ).toBe('2026-11-16T15:05:00.000Z');
    expect(issuesOf({ ...scheduled, scheduleHour: '12', scheduleMinute: '04' })).toEqual([
      ['scheduleDay', SCHEDULE_TOO_SOON],
    ]);
    expect(issuesOf({ ...scheduled, scheduleDay: '' })).toEqual([
      ['scheduleDay', 'Escolha o dia do envio.'],
    ]);
    expect(issuesOf({ ...scheduled, scheduleHour: '24' }).map(([field]) => field)).toEqual([
      'scheduleHour',
    ]);
  });
});
