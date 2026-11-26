import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MessageMenu } from './MessageMenu';

function setup() {
  const onReply = vi.fn();
  const onClose = vi.fn();
  render(
    <div>
      <p>Fora do menu</p>
      <MessageMenu mine={false} onReply={onReply} onClose={onClose} />
    </div>,
  );
  return { onReply, onClose };
}

describe('MessageMenu (R2)', () => {
  it('CA1: mostra só "Responder", já com o foco, e responde ao escolher', async () => {
    const { onReply } = setup();

    const reply = screen.getByRole('menuitem', { name: /Responder/ });
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(reply).toHaveFocus();
    await userEvent.click(reply);

    expect(onReply).toHaveBeenCalledOnce();
  });

  it('fecha com Esc e com clique fora, mas não com clique no próprio menu', () => {
    const { onClose } = setup();

    fireEvent.mouseDown(screen.getByRole('menu'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByText('Fora do menu'));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('ignora as outras teclas', () => {
    const { onClose } = setup();

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
