import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodFilter } from './PeriodFilter';

describe('PeriodFilter', () => {
  it('mostra os períodos e marca o atual', () => {
    render(<PeriodFilter value={{ preset: '30d' }} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'Período' });
    expect(group).toHaveTextContent('Hoje7 dias30 dias1 anoPersonalizado');
    expect(screen.getByRole('button', { name: '30 dias' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '7 dias' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa a troca de período', async () => {
    const onChange = vi.fn();
    render(<PeriodFilter value={{ preset: '30d' }} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(onChange).toHaveBeenCalledWith({ preset: '7d' });
  });

  it('aplica um intervalo de datas personalizado', async () => {
    const onChange = vi.fn();
    render(<PeriodFilter value={{ preset: '30d' }} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Personalizado' }));
    await userEvent.type(screen.getByLabelText('De'), '2026-10-01');
    await userEvent.type(screen.getByLabelText('Até'), '2026-10-15');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-15' });
  });

  it('não aplica intervalo com a data final antes da inicial', async () => {
    render(<PeriodFilter value={{ from: '2026-10-15', to: '2026-10-20' }} onChange={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText('Até'));
    await userEvent.type(screen.getByLabelText('Até'), '2026-10-01');

    expect(
      screen.getByText('A data final precisa ser igual ou depois da inicial'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Personalizado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
