import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { communityAdminApi } from './community-admin.api';
import {
  communityAdminKeys,
  useDeleteGroup,
  useDismissReport,
  useSuspendGroup,
} from './community-admin.queries';

vi.mock('./community-admin.api', () => ({
  communityAdminApi: {
    suspendGroup: vi.fn(() => Promise.resolve({})),
    deleteGroup: vi.fn(() => Promise.resolve()),
    dismissReport: vi.fn(() => Promise.resolve({})),
  },
}));

const action = { id: 'group-1', reason: 'Spam no grupo' };

function renderMutation<T>(useHook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const invalidatedKeys = () => invalidate.mock.calls.map(([filters]) => filters?.queryKey);
  return { ...renderHook(useHook, { wrapper }), invalidatedKeys };
}

describe('mutações da administração de comunidade', () => {
  it.each([
    ['suspender', useSuspendGroup],
    ['excluir', useDeleteGroup],
  ])('ao %s um grupo, recarrega os grupos e os indicadores', async (_label, useHook) => {
    const { result, invalidatedKeys } = renderMutation(useHook);

    await act(() => result.current.mutateAsync(action));

    expect(invalidatedKeys()).toEqual([communityAdminKeys.groups(), communityAdminKeys.summary()]);
  });

  it('ao dispensar uma denúncia, recarrega a fila e os indicadores', async () => {
    const { result, invalidatedKeys } = renderMutation(useDismissReport);

    await act(() => result.current.mutateAsync(action));

    expect(communityAdminApi.dismissReport).toHaveBeenCalledWith(action, expect.anything());
    expect(invalidatedKeys()).toEqual([communityAdminKeys.reports(), communityAdminKeys.summary()]);
  });
});
