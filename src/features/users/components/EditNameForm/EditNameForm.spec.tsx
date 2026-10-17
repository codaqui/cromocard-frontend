import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EditNameForm } from './EditNameForm';

function renderForm(onSubmit = vi.fn()) {
  render(<EditNameForm defaultName="Ana" isSubmitting={false} onSubmit={onSubmit} />);
  return { onSubmit, nameInput: screen.getByLabelText('Nome') };
}

describe('EditNameForm', () => {
  it('envia o nome sem espaços nas pontas', async () => {
    const { onSubmit, nameInput } = renderForm();

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '  Ana Souza  ');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana Souza' }, expect.anything());
  });

  it('mostra o erro e não envia nome curto demais', async () => {
    const { onSubmit, nameInput } = renderForm();

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'A');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('O nome precisa ter pelo menos 2 caracteres'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('mostra a mensagem de erro vinda da API', () => {
    render(
      <EditNameForm
        defaultName="Ana"
        isSubmitting={false}
        errorMessage="Usuário não encontrado"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Usuário não encontrado')).toBeInTheDocument();
  });
});
