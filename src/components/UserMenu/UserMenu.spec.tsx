import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserMenu } from './UserMenu';

function renderMenu(onSelect = vi.fn()) {
  render(
    <>
      <UserMenu
        name="Ana"
        initial="A"
        avatarFirst
        actions={[
          { label: 'Meu perfil', icon: 'person', onSelect: vi.fn() },
          { label: 'Sair', icon: 'logout', onSelect },
        ]}
      />
      <p>fora</p>
    </>,
  );
  return screen.getByRole('button', { name: 'Ana' });
}

describe('UserMenu', () => {
  it('abre o menu com o foco no primeiro item e fecha ao escolher uma ação', async () => {
    const onSelect = vi.fn();
    const trigger = renderMenu(onSelect);

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Meu perfil' })).toHaveFocus();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('navega pelos itens com as setas', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: 'Ana' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Meu perfil' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
  });

  it('fecha com Esc e com clique fora', async () => {
    const trigger = renderMenu();

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('fora'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
