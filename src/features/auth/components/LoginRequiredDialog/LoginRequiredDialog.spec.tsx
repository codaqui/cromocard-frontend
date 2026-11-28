import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PENDING_REDIRECT_KEY } from '@/routes/guards/loginRedirect';
import { renderWithProviders } from '@/test/renderWithProviders';

import { LoginRequiredDialog } from './LoginRequiredDialog';

function renderDialog(props: { open?: boolean; message?: string } = {}) {
  const onClose = vi.fn();
  const router = renderWithProviders({
    initialPath: '/cartas/c1?aba=anuncios',
    routes: [
      {
        path: '/cartas/:id',
        element: (
          <LoginRequiredDialog
            open={props.open ?? true}
            onClose={onClose}
            message={props.message}
          />
        ),
      },
      { path: '/login', element: <p>Tela de login</p> },
      { path: '/login/google', element: <p>Google em construção</p> },
      { path: '/cadastro', element: <p>Tela de cadastro</p> },
    ],
  });
  return { router, onClose };
}

const dialog = () => screen.getByRole('dialog', { name: 'Entre para continuar' });

describe('LoginRequiredDialog', () => {
  it('CA4: mostra a mensagem padrão, as opções e os termos', () => {
    renderDialog();

    expect(
      within(dialog()).getByText('Faça login para continuar. É rápido e grátis.'),
    ).toBeVisible();
    expect(within(dialog()).getByRole('link', { name: 'Continuar com Google' })).toBeVisible();
    expect(within(dialog()).getByText(/Termos de Uso e a Política de Privacidade/)).toBeVisible();
  });

  it('aceita uma mensagem própria', () => {
    renderDialog({ message: 'Entre para favoritar.' });
    expect(within(dialog()).getByText('Entre para favoritar.')).toBeVisible();
  });

  it('não aparece fechado', () => {
    renderDialog({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('CA4: e-mail e senha leva ao login com a volta para a página atual', async () => {
    const { router } = renderDialog();

    await userEvent.click(
      within(dialog()).getByRole('link', { name: 'Entrar com e-mail e senha' }),
    );

    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe('?redirect=%2Fcartas%2Fc1%3Faba%3Danuncios');
    expect(sessionStorage.getItem(PENDING_REDIRECT_KEY)).toBeNull();
  });

  it('L18: Continuar com Google leva à página em construção, sem guardar a origem', async () => {
    const { router } = renderDialog();

    await userEvent.click(within(dialog()).getByRole('link', { name: 'Continuar com Google' }));

    expect(router.state.location.pathname).toBe('/login/google');
    expect(sessionStorage.getItem(PENDING_REDIRECT_KEY)).toBeNull();
  });

  it('L16: Criar conta grátis guarda a página atual para depois do login', async () => {
    renderDialog();

    await userEvent.click(within(dialog()).getByRole('link', { name: 'Criar conta grátis' }));

    expect(await screen.findByText('Tela de cadastro')).toBeVisible();
    expect(sessionStorage.getItem(PENDING_REDIRECT_KEY)).toContain(
      '"path":"/cartas/c1?aba=anuncios"',
    );
  });

  it('fecha pelo botão Fechar', async () => {
    const { onClose } = renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
