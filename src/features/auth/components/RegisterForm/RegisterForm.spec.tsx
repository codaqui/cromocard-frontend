import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { RegisterForm } from './RegisterForm';

function renderForm(isSubmitting = false) {
  const onSubmit = vi.fn();
  const element = <RegisterForm isSubmitting={isSubmitting} apiError={null} onSubmit={onSubmit} />;
  renderWithProviders({ routes: [{ path: paths.register, element }], initialPath: paths.register });
  return onSubmit;
}

interface FillOptions {
  password?: string;
  confirm?: string;
  terms?: boolean;
}

async function fill({ password = 'Senha@Forte12', confirm, terms = true }: FillOptions = {}) {
  await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Colecionadora');
  await userEvent.type(
    screen.getByLabelText('E-mail institucional ou pessoal'),
    'Ana@CromoCard.dev',
  );
  await userEvent.click(screen.getByLabelText(/Vendedor/));
  await userEvent.type(screen.getByLabelText('Sua melhor senha'), password);
  await userEvent.type(screen.getByLabelText('Confirmar senha'), confirm ?? password);
  if (terms) await userEvent.click(screen.getByLabelText(/Concordo com os Termos de Uso/));
}

const submitButton = () => screen.getByRole('button', { name: 'Criar Conta' });

describe('RegisterForm', () => {
  it('CA1: envia os dados com o tipo escolhido e o aceite dos termos', async () => {
    const onSubmit = renderForm();

    await fill();
    await userEvent.click(submitButton());

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: 'Ana Colecionadora',
        email: 'ana@cromocard.dev',
        role: 'SELLER',
        password: 'Senha@Forte12',
        confirmPassword: 'Senha@Forte12',
        termsAccepted: true,
      },
      expect.anything(),
    );
  });

  it('CA7: o tipo de conta oferece só Cliente e Vendedor', () => {
    renderForm();

    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual([
      'CUSTOMER',
      'SELLER',
    ]);
  });

  it('CA3: mostra a regra de senha e a confirmação diferente no campo', async () => {
    const onSubmit = renderForm();

    await fill({ password: 'senhafraca', confirm: 'outra' });
    await userEvent.click(submitButton());

    expect(await screen.findByText('A senha precisa ter pelo menos um número')).toBeInTheDocument();
    expect(screen.getByText('As senhas não são iguais')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('CA4: sem o aceite dos termos, pede o aceite e não envia', async () => {
    const onSubmit = renderForm();

    await fill({ terms: false });
    await userEvent.click(submitButton());

    expect(
      await screen.findByText('Aceite os termos de uso para criar a conta'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mostra a força da senha enquanto a pessoa digita', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText('Sua melhor senha'), 'Senha@Forte12');

    expect(screen.getByText('Forte & Segura')).toBeInTheDocument();
  });

  it('CA11: desabilita o botão enquanto cria a conta', () => {
    renderForm(true);

    expect(screen.getByRole('button', { name: 'Criando conta…' })).toBeDisabled();
  });
});
