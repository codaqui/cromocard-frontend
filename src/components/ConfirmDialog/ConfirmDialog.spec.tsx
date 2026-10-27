import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  open: true,
  title: 'Suspender usuário',
  message: 'Ana Colecionadora não poderá entrar enquanto estiver suspensa.',
  confirmLabel: 'Suspender',
};

describe('ConfirmDialog', () => {
  it('confirma sem motivo quando a ação não exige', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} onCancel={vi.fn()} />);

    expect(screen.queryByLabelText('Motivo')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('exige motivo de pelo menos 3 caracteres antes de confirmar', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} requireReason onConfirm={onConfirm} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Motivo'), 'ok');
    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(
      await screen.findByText('O motivo precisa ter pelo menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirma com o motivo sem espaços nas pontas', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} requireReason onConfirm={onConfirm} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Motivo'), '  Spam repetido  ');
    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(onConfirm).toHaveBeenCalledWith('Spam repetido');
  });

  it('cancela pelo botão e pelo Esc', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await userEvent.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('trava os botões enquanto confirma e mostra o erro da API', () => {
    render(
      <ConfirmDialog
        {...baseProps}
        isConfirming
        errorMessage="Usuário já está suspenso"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Aguarde…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Usuário já está suspenso');
  });

  it('não mostra nada fechado', () => {
    render(<ConfirmDialog {...baseProps} open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abre como alertdialog descrito pela mensagem', () => {
    render(<ConfirmDialog {...baseProps} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole('alertdialog', { name: 'Suspender usuário' }),
    ).toHaveAccessibleDescription(baseProps.message);
  });

  it('não fecha por Esc nem pelo × enquanto confirma', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} isConfirming onConfirm={vi.fn()} onCancel={onCancel} />);

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('limita o motivo a 500 caracteres no campo', () => {
    render(<ConfirmDialog {...baseProps} requireReason onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText('Motivo')).toHaveAttribute('maxlength', '500');
  });

  it('só confirma quando o texto digitado confere', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        title="Excluir usuário"
        confirmLabel="Excluir"
        confirmationText="Ana Colecionadora"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    const confirmation = screen.getByLabelText('Digite "Ana Colecionadora" para confirmar');

    await userEvent.type(confirmation, 'Ana');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(await screen.findByText('O texto digitado não confere')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.clear(confirmation);
    await userEvent.type(confirmation, 'Ana Colecionadora');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });
});
