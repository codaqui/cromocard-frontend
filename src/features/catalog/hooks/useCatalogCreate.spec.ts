import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCatalogCreate } from './useCatalogCreate';

const albumCreated = { title: 'Álbum cadastrado no catálogo', detail: 'Copa já aparece na lista.' };
const cardsImported = { title: '50 cartas importadas' };

describe('useCatalogCreate', () => {
  it('R4: abre e fecha o cadastro escolhido no cabeçalho', () => {
    const { result } = renderHook(() => useCatalogCreate());

    act(() => result.current.open('card'));
    expect(result.current.action).toBe('card');

    act(() => result.current.close());
    expect(result.current.action).toBeNull();
    expect(result.current.message).toBeNull();
  });

  it('R9: ao concluir, fecha o cadastro e mostra a mensagem, que some ao ser fechada', () => {
    const { result } = renderHook(() => useCatalogCreate());
    act(() => result.current.open('album'));

    act(() => result.current.finish(albumCreated));
    expect(result.current).toMatchObject({ action: null, message: albumCreated });

    act(() => result.current.clearMessage());
    expect(result.current.message).toBeNull();
  });

  it('R9: avisa uma mensagem sem abrir nenhum cadastro', () => {
    const { result } = renderHook(() => useCatalogCreate());

    act(() => result.current.notify(cardsImported));

    expect(result.current).toMatchObject({
      action: null,
      message: cardsImported,
    });
  });
});
