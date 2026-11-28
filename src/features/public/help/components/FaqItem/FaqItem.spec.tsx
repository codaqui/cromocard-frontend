import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { FaqItem } from './FaqItem';

const item = {
  id: 'fee',
  question: 'Preciso pagar para criar conta ou anunciar?',
  answer: 'Não. Criar conta e anunciar é grátis.',
  link: { label: 'Ver como funciona', to: '/como-funciona' },
};

function renderItem(open: boolean, onToggle = vi.fn()) {
  render(
    <MemoryRouter>
      <ul>
        <FaqItem item={item} open={open} onToggle={onToggle} />
      </ul>
    </MemoryRouter>,
  );
  return onToggle;
}

describe('FaqItem', () => {
  it('CA1: fechada, mostra só a pergunta e avisa que está recolhida', async () => {
    const onToggle = renderItem(false);

    const button = screen.getByRole('button', { name: item.question });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(item.answer)).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('CA1 e CA16: aberta, mostra a resposta e o link útil', () => {
    renderItem(true);

    expect(screen.getByRole('button', { name: item.question })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText(item.answer)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver como funciona' })).toHaveAttribute(
      'href',
      '/como-funciona',
    );
  });
});
