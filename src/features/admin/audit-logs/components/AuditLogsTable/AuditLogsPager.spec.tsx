import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuditLogsPager } from './AuditLogsPager';

describe('AuditLogsPager', () => {
  it('não aparece com uma página só', () => {
    const { container } = render(<AuditLogsPager page={1} totalPages={1} onPageChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('marca a página atual, mostra os intervalos e troca de página', async () => {
    const onPageChange = vi.fn();
    render(<AuditLogsPager page={5} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getAllByText('…')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Página 6' }));
    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(onPageChange.mock.calls).toEqual([[6], [4], [6]]);
  });

  it('desabilita as setas nas pontas', () => {
    const { rerender } = render(<AuditLogsPager page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();

    rerender(<AuditLogsPager page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });
});
