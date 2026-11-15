import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFile } from '@/lib/download-file';

const OBJECT_URL = 'blob:http://localhost/modelo';

describe('downloadFile', () => {
  const createObjectURL = vi.fn(() => OBJECT_URL);
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('baixa o arquivo com o nome pedido e libera a URL temporária', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const blob = new Blob(['album_title;number']);

    downloadFile(blob, 'modelo.csv');
    const link = click.mock.contexts[0] as HTMLAnchorElement;

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(link.download).toBe('modelo.csv');
    expect(link.href).toBe(OBJECT_URL);
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });
});
