import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button/Button';

import { Modal } from './Modal';

function ModalWithTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Novo usuário</Button>
      <Modal
        open={open}
        title="Adicionar usuário"
        onClose={() => setOpen(false)}
        footer={<Button onClick={() => setOpen(false)}>Salvar</Button>}
      >
        <input aria-label="Nome" />
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('não mostra nada fechado', () => {
    render(
      <Modal open={false} title="Adicionar usuário" onClose={vi.fn()}>
        conteúdo
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abre com o título como nome do diálogo e leva o foco para dentro', async () => {
    render(<ModalWithTrigger />);

    await userEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));

    const dialog = screen.getByRole('dialog', { name: 'Adicionar usuário' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
  });

  it('fecha com Esc e devolve o foco a quem abriu', async () => {
    render(<ModalWithTrigger />);
    const trigger = screen.getByRole('button', { name: 'Novo usuário' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('fecha pelo botão Fechar e pelo fundo, mas não pelo clique dentro', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Adicionar usuário" onClose={onClose}>
        <p>conteúdo</p>
      </Modal>,
    );

    await userEvent.click(screen.getByText('conteúdo'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await userEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('mantém o foco dentro do diálogo com Tab e Shift+Tab', async () => {
    render(<ModalWithTrigger />);
    await userEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));
    const closeButton = screen.getByRole('button', { name: 'Fechar' });
    const saveButton = screen.getByRole('button', { name: 'Salvar' });

    await userEvent.tab({ shift: true });
    expect(saveButton).toHaveFocus();

    await userEvent.tab();
    expect(closeButton).toHaveFocus();
  });
});
