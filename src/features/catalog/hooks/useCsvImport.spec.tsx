import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, ReactNode } from 'react';
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
});
