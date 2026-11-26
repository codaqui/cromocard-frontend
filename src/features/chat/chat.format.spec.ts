import { describe, expect, it } from 'vitest';

import {
  activeLabel,
  commonGroupsLabel,
  dayLabel,
  handleOf,
  initialOf,
  initialsOf,
  listedLabel,
  previewTime,
  sameDay,
  timeOf,
} from './chat.format';

const NOW = new Date(2026, 9, 31, 16, 0);
const at = (day: number, hour = 15, minute = 42) =>
  new Date(2026, 9, day, hour, minute).toISOString();

describe('chat.format', () => {
  it('CA1: hora na prévia de hoje, "Ontem" e o dia com o mês abreviado nas antigas', () => {
    expect(previewTime(at(31), NOW)).toBe('15:42');
    expect(previewTime(at(30), NOW)).toBe('Ontem');
    expect(previewTime(at(27), NOW)).toBe('27 Out');
  });

  it('CA1: separador "Hoje, 31 de Outubro", "Ontem, …" e a data nos dias anteriores', () => {
    expect(dayLabel(at(31), NOW)).toBe('Hoje, 31 de Outubro');
    expect(dayLabel(at(30), NOW)).toBe('Ontem, 30 de Outubro');
    expect(dayLabel(at(27), NOW)).toBe('27 de Outubro');
  });

  it('hora da mensagem com dois dígitos e o mesmo dia', () => {
    expect(timeOf(at(31, 9, 5))).toBe('09:05');
    expect(sameDay(at(31, 1), at(31, 23))).toBe(true);
    expect(sameDay(at(31), at(30))).toBe(false);
  });

  it('CA12: rodapé "N de N conversas listadas" e o vazio "Nenhuma conversa"', () => {
    expect(listedLabel(1, 4)).toBe('1 de 4 conversas listadas');
    expect(listedLabel(1, 1)).toBe('1 de 1 conversa listada');
    expect(listedLabel(0, 0)).toBe('Nenhuma conversa');
  });

  it('selo "N ativas", inicial e @', () => {
    expect(activeLabel(4)).toBe('4 ativas');
    expect(activeLabel(1)).toBe('1 ativa');
    expect(initialOf(' marcos')).toBe('M');
    expect(handleOf('marcos_tcg')).toBe('@marcos_tcg');
    expect(handleOf(null)).toBe('');
  });

  it('CA14: iniciais de duas palavras e o resumo dos grupos em comum', () => {
    expect(initialsOf('Renata Valente')).toBe('RV');
    expect(initialsOf('Rei das Cartas BR')).toBe('RB');
    expect(initialsOf('thiago')).toBe('T');
    expect(commonGroupsLabel(['Pokémon TCG São Paulo'])).toBe('Pokémon TCG São Paulo');
    expect(commonGroupsLabel(['A', 'B'])).toBe('2 grupos em comum');
    expect(commonGroupsLabel([])).toBe('');
  });
});
