import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { catalogApi } from '../catalog.api';
import { useCsvImport } from './useCsvImport';

vi.mock('../catalog.api', () => ({
  catalogApi: { importCards: vi.fn(), downloadImportTemplate: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const emptySelection = { target: { files: null } } as unknown as ChangeEvent<HTMLInputElement>;

describe('useCsvImport', () => {
  it('R13: sem arquivo escolhido, importar não chama a API', () => {
    const { result } = renderHook(() => useCsvImport(vi.fn()), { wrapper });

    act(() => result.current.selectFile(emptySelection));
    act(() => result.current.submit());

    expect(result.current.file).toBeNull();
    expect(catalogApi.importCards).not.toHaveBeenCalled();
  });

  it('R13: o arquivo arrastado para a área é escolhido e as linhas são contadas', async () => {
    const { result } = renderHook(() => useCsvImport(vi.fn()), { wrapper });
    const file = new File(['album_title;number\nBase;1\nBase;2\n'], 'cartas.csv');
    const preventDefault = vi.fn();
    const drop = { preventDefault, dataTransfer: { files: [file] } } as unknown as DragEvent;

    act(() => result.current.dropFile(drop));

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.file).toBe(file);
    await vi.waitFor(() => expect(result.current.rows).toBe(2));
  });

  it('R13: soltar sem arquivo não escolhe nada', () => {
    const { result } = renderHook(() => useCsvImport(vi.fn()), { wrapper });
    const drop = { preventDefault: vi.fn(), dataTransfer: { files: [] } } as unknown as DragEvent;

    act(() => result.current.dropFile(drop));

    expect(result.current.file).toBeNull();
  });
});
