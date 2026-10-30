import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { installFakeGoogleIdentity } from '@/test/fakeGoogleIdentity';

import { GoogleButton } from './GoogleButton';

describe('GoogleButton', () => {
  afterEach(() => {
    delete window.google;
    document.head.querySelectorAll('script').forEach((script) => script.remove());
  });

  it('desenha o botão do Google com o client ID e o aviso dos termos', async () => {
    const google = installFakeGoogleIdentity();

    render(<GoogleButton clientId="cliente.apps" disabled={false} onCredential={vi.fn()} />);

    await waitFor(() => expect(google.renderButton).toHaveBeenCalledOnce());
    expect(google.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'cliente.apps' }),
    );
    expect(screen.getByText(/aceita os Termos de Uso/)).toBeInTheDocument();
  });

  it('CA9: entrega o id_token devolvido pelo Google', async () => {
    const google = installFakeGoogleIdentity();
    const onCredential = vi.fn();
    render(<GoogleButton clientId="cliente.apps" disabled={false} onCredential={onCredential} />);
    await waitFor(() => expect(google.initialize).toHaveBeenCalled());

    await act(async () => {
      google.signInWith('id-token-do-google');
      await Promise.resolve();
    });

    expect(onCredential).toHaveBeenCalledWith('id-token-do-google');
  });

  it('avisa quando o script do Google não carrega', async () => {
    render(<GoogleButton clientId="cliente.apps" disabled={false} onCredential={vi.fn()} />);

    const script = document.head.querySelector('script');
    await act(async () => {
      script?.dispatchEvent(new Event('error'));
      await Promise.resolve();
    });

    expect(
      await screen.findByText('O login com Google está indisponível no momento.'),
    ).toBeInTheDocument();
  });
});
