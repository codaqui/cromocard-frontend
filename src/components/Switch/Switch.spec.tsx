import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('Switch', () => {
  it('mostra o estado e avisa o novo valor ao ser selecionada', async () => {
    const onChange = vi.fn();
    render(<Switch label="E-mail" checked onChange={onChange} />);

    const control = screen.getByRole('switch', { name: 'E-mail' });
    expect(control).toBeChecked();
    await userEvent.click(control);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('desativada, não muda', async () => {
    const onChange = vi.fn();
    render(<Switch label="E-mail" checked={false} disabled onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch', { name: 'E-mail' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
