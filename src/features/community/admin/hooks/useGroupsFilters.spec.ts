import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGroupsFilters } from './useGroupsFilters';

describe('useGroupsFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa na primeira página, sem busca nem status', () => {
    const { result } = renderHook(() => useGroupsFilters());

    expect(result.current.params).toEqual({ page: 1, pageSize: 10 });
  });

  it('volta para a primeira página ao mudar o status', () => {
    const { result } = renderHook(() => useGroupsFilters());

    act(() => result.current.changePage(3));
    act(() => result.current.changeStatus('SUSPENDED'));

    expect(result.current.params).toMatchObject({ page: 1, status: 'SUSPENDED' });
  });

  it('volta para a primeira página e só busca depois da pausa na digitação', () => {
    const { result } = renderHook(() => useGroupsFilters());

    act(() => result.current.changePage(2));
    act(() => result.current.changeSearch('  copa '));
    expect(result.current.params).toEqual({ page: 1, pageSize: 10 });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.params).toMatchObject({ q: 'copa', page: 1 });
  });
});
