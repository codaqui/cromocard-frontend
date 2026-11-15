import type { UseMutationResult } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useConfirmedSave } from './useConfirmedSave';

function mutationStub() {
  return {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as UseMutationResult<unknown, Error, string>;
}

describe('useConfirmedSave', () => {
  it('R8: confirmar sem nada para revisar não grava', () => {
    const mutation = mutationStub();
    const { result } = renderHook(() => useConfirmedSave(mutation, vi.fn()));

    act(() => result.current.confirm());

    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it('R8: revisar, voltar e revisar de novo mantém o último valor', () => {
    const mutation = mutationStub();
    const { result } = renderHook(() => useConfirmedSave(mutation, vi.fn()));

    act(() => result.current.review('primeiro'));
    act(() => result.current.back());
    expect(result.current.isReviewing).toBe(false);
    act(() => result.current.review('segundo'));
    act(() => result.current.confirm());

    expect(mutation.mutate).toHaveBeenCalledWith('segundo', expect.any(Object));
  });
});
