import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/hooks/useAuth';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import { COMING_SOON_MESSAGE, useCardProfileActions } from './useCardProfileActions';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

function renderActions(user: AuthenticatedUser | null) {
  vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>);
  return renderHook(() => useCardProfileActions());
}

describe('useCardProfileActions', () => {
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('CA4 e CA5: o visitante abre o modal de login ao favoritar ou adicionar', () => {
    const { result } = renderActions(null);

    act(() => result.current.onFavorite());
    expect(result.current.loginOpen).toBe(true);
    act(() => result.current.closeLogin());
    act(() => result.current.onAddToCollection());

    expect(result.current.loginOpen).toBe(true);
    expect(result.current.notice).toBeNull();
  });

  it('CA6: o cliente logado vê o aviso de em breve e pode fechá-lo', () => {
    const { result } = renderActions({ id: 'u1', role: 'CUSTOMER' });

    act(() => result.current.onFavorite());
    expect(result.current.loginOpen).toBe(false);
    expect(result.current.notice).toBe(COMING_SOON_MESSAGE);
    act(() => result.current.dismissNotice());

    expect(result.current.notice).toBeNull();
  });

  it.each([
    [null, true, false],
    [{ id: 'u1', role: 'CUSTOMER' } as const, false, false],
    [{ id: 'u2', role: 'SELLER' } as const, false, true],
  ])('R10 e R12: diz quem é visitante e quem pode anunciar (%o)', (user, isGuest, canCreate) => {
    const { result } = renderActions(user);

    expect(result.current.isGuest).toBe(isGuest);
    expect(result.current.canCreateListing).toBe(canCreate);
  });

  it('R15: Ver anúncios rola até a seção de anúncios', () => {
    const section = document.createElement('section');
    section.id = 'anuncios';
    const scrollIntoView = vi.fn();
    section.scrollIntoView = scrollIntoView;
    document.body.append(section);
    const { result } = renderActions(null);

    result.current.onSeeListings();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('R15: sem a seção na página, Ver anúncios não quebra', () => {
    const { result } = renderActions(null);
    expect(() => result.current.onSeeListings()).not.toThrow();
  });
});
