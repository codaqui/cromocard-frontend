import { describe, expect, it } from 'vitest';

import {
  compactTime,
  displayMessage,
  groupByDay,
  groupOf,
  relativeTime,
} from './notifications.format';

const NOW = new Date(2026, 10, 28, 15, 0);
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 10, day, hour, minute).toISOString();

describe('relativeTime', () => {
  it.each([
    { iso: at(28, 14, 59), text: 'Há 1 min' },
    { iso: at(28, 14, 45), text: 'Há 15 min' },
    { iso: at(28, 12, 30), text: 'Há 2 h' },
    { iso: at(27, 18, 40), text: 'Ontem, às 18:40' },
    { iso: at(26, 9), text: '2 dias atrás' },
  ])('$text', ({ iso, text }) => {
    expect(relativeTime(iso, NOW)).toBe(text);
  });

  it('menos de um minuto é "Agora"', () => {
    expect(relativeTime(new Date(NOW.getTime() - 20_000).toISOString(), NOW)).toBe('Agora');
  });

  it('no popup do sino, ontem aparece sem a hora', () => {
    expect(relativeTime(at(27, 18, 40), NOW, true)).toBe('Ontem');
  });
});

describe('groupOf', () => {
  it('separa as de hoje das anteriores pela data local', () => {
    expect(groupOf(at(28, 0, 5), NOW)).toBe('TODAY');
    expect(groupOf(at(27, 23, 55), NOW)).toBe('EARLIER');
  });
});

describe('groupByDay', () => {
  const items = [{ createdAt: at(28, 14) }, { createdAt: at(27, 10) }];

  it('separa HOJE de ANTERIORES e omite o grupo vazio', () => {
    expect(groupByDay(items, { allRead: false, now: NOW }).map(({ group }) => group)).toEqual([
      'TODAY',
      'EARLIER',
    ]);
    expect(
      groupByDay(items.slice(1), { allRead: false, now: NOW }).map(({ group }) => group),
    ).toEqual(['EARLIER']);
  });

  it('com todas lidas, tudo fica em ANTERIORES', () => {
    expect(groupByDay(items, { allRead: true, now: NOW })).toEqual([{ group: 'EARLIER', items }]);
  });
});

describe('compactTime', () => {
  it.each([
    { iso: new Date(NOW.getTime() - 20_000).toISOString(), text: 'agora' },
    { iso: at(28, 14, 57), text: '3 min' },
    { iso: at(28, 12), text: 'Há 3 h' },
    { iso: at(27, 18, 40), text: 'Ontem' },
  ])('no aviso flutuante, $text', ({ iso, text }) => {
    expect(compactTime(iso, NOW)).toBe(text);
  });
});

describe('displayMessage', () => {
  it('põe o trecho da mensagem nova entre aspas, como no Figma', () => {
    expect(displayMessage({ type: 'NEW_MESSAGE', message: 'Oi!' })).toBe('“Oi!”');
  });

  it('os outros tipos ficam como vieram', () => {
    expect(displayMessage({ type: 'GLOBAL', message: 'Manutenção' })).toBe('Manutenção');
  });
});
