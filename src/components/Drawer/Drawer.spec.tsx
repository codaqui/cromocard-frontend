import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('abre como diálogo com o título e o conteúdo', () => {
    render(
      <Drawer open title="Detalhe do log" onClose={vi.fn()}>
        <p>USER_SUSPENDED</p>
      </Drawer>,
    );

    expect(screen.getByRole('dialog', { name: 'Detalhe do log' })).toHaveFocus();
    expect(screen.getByText('USER_SUSPENDED')).toBeInTheDocument();
  });

  it('fecha com Esc e pelo botão Fechar', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Detalhe do log" onClose={onClose}>
        conteúdo
      </Drawer>,
    );

    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('não mostra nada fechado', () => {
    render(
      <Drawer open={false} title="Detalhe do log" onClose={vi.fn()}>
        conteúdo
      </Drawer>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
