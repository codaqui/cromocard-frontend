import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useObjectUrl } from './useObjectUrl';

describe('useObjectUrl', () => {
  afterEach(() => vi.restoreAllMocks());

  it('cria o endereço do arquivo e o libera ao sair da tela', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:print-1');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const { result, unmount } = renderHook(() => useObjectUrl(new Blob(['png'])));

    expect(result.current).toBe('blob:print-1');
    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:print-1');
  });

  it('sem arquivo ainda, não cria endereço', () => {
    const create = vi.spyOn(URL, 'createObjectURL');

    const { result } = renderHook(() => useObjectUrl(undefined));

    expect(result.current).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});
