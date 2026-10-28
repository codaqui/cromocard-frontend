import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { RegisterPanel } from './RegisterPanel';

vi.mock('../../auth.api', () => ({ authApi: { register: vi.fn() } }));

const routes = [
  { path: paths.register, element: <RegisterPanel /> },
  { path: paths.checkEmail, element: <p>Confirme seu e-mail</p> },
];

async function submitRegistration() {
  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana');
  await userEvent.type(
    screen.getByLabelText('E-mail institucional ou pessoal'),
    'ana@cromocard.dev',
  );
  await userEvent.click(screen.getByLabelText(/Cliente/));
  await userEvent.type(screen.getByLabelText('Sua melhor senha'), 'Senha@Forte1');
  await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha@Forte1');
  await userEvent.click(screen.getByLabelText(/Concordo com os Termos de Uso/));
  await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
}

function rejectWith(code: string, message: string) {
  vi.mocked(authApi.register).mockRejectedValue(new ApiError({ status: 409, code, message }));
}

describe('RegisterPanel', () => {
  beforeEach(() => {
    vi.mocked(authApi.register).mockReset();
  });

  it('CA2: depois do cadastro, abre "Confirme seu e-mail"', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER',
      emailVerified: false,
    });
    const router = renderWithProviders({ routes, initialPath: paths.register });

    await submitRegistration();

    expect(await screen.findByText('Confirme seu e-mail')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?email=ana%40cromocard.dev');
    expect(vi.mocked(authApi.register).mock.calls[0]?.[0]).toEqual({
      name: 'Ana',
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER',
      password: 'Senha@Forte1',
      termsAccepted: true,
    });
  });

  it('CA5: e-mail já cadastrado mostra a mensagem e oferece entrar ou reenviar', async () => {
    rejectWith('EMAIL_ALREADY_REGISTERED', 'Este e-mail já tem cadastro.');
    renderWithProviders({ routes, initialPath: paths.register });

    await submitRegistration();

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já tem cadastro.');
    expect(screen.getByRole('link', { name: 'Reenviar confirmação' })).toHaveAttribute(
      'href',
      `${paths.checkEmail}?email=ana%40cromocard.dev`,
    );
    expect(screen.getByRole('link', { name: 'Entrar na conta' })).toBeInTheDocument();
  });

  it('CA6: e-mail de conta excluída sugere a reativação', async () => {
    rejectWith(
      'ACCOUNT_DELETED',
      'Este e-mail é de uma conta excluída. Você pode pedir a reativação.',
    );
    renderWithProviders({ routes, initialPath: paths.register });

    await submitRegistration();

    expect(await screen.findByRole('alert')).toHaveTextContent('pedir a reativação');
  });
});
