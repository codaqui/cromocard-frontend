import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserMenu } from './UserMenu';

function renderMenu(onSelect = vi.fn()) {
  render(
    <>
      <UserMenu
        name="Ana"
        caption="Cliente"
        actions={[{ label: 'Sair', icon: 'logout', onSelect }]}
      />
      <p>fora</p>
    </>,
  );
  return screen.getByRole('button', { name: /Ana/ });
}

describe('UserMenu', () => {
  it('abre as ações no clique e fecha ao escolher uma', async () => {
    const onSelect = vi.fn();
    const trigger = renderMenu(onSelect);

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
  });

  it('fecha com Esc e com clique fora', async () => {
    const trigger = renderMenu();

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('fora'));
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();
  });
});
