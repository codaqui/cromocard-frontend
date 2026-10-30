import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { LoginForm } from './LoginForm';

function renderForm(props: Partial<Parameters<typeof LoginForm>[0]> = {}) {
  const onSubmit = vi.fn();
  const element = <LoginForm isSubmitting={false} apiError={null} onSubmit={onSubmit} {...props} />;
  renderWithProviders({ routes: [{ path: paths.login, element }], initialPath: paths.login });
  return onSubmit;
}

describe('LoginForm', () => {
  it('envia e-mail normalizado, senha e "lembrar de mim"', async () => {
    const onSubmit = renderForm();

    await userEvent.type(screen.getByLabelText('E-mail'), ' Ana@CromoCard.dev ');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@Forte1');
    await userEvent.click(screen.getByLabelText('Lembrar de mim por 30 dias'));
    await userEvent.click(screen.getByRole('button', { name: 'Entrar na Plataforma' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { email: 'ana@cromocard.dev', password: 'Senha@Forte1', rememberMe: true },
      expect.anything(),
    );
  });

  it('CA5: mostra no campo o erro de validação que vem da API', async () => {
    const apiError = new ApiError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: [{ field: 'email', message: 'Informe um e-mail válido' }],
    });
    renderForm({ apiError });

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra "Entrando…" e desabilita o botão enquanto envia', () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  });

  it('leva o link "Esqueceu a senha?" para a recuperação', () => {
    renderForm();

    expect(screen.getByRole('link', { name: 'Esqueceu a senha?' })).toHaveAttribute(
      'href',
      paths.forgotPassword,
    );
  });
});
