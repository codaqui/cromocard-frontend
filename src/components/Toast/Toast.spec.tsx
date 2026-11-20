import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Toast } from './Toast';

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('anuncia a mensagem de sucesso como status', () => {
    render(<Toast message="Notificação enviada para 120 usuários" onDismiss={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Notificação enviada para 120 usuários');
  });

  it('mostra o detalhe abaixo da mensagem', () => {
    render(
      <Toast
        message="Carta cadastrada no catálogo"
        detail="Charizard foi publicada e já aparece nas buscas."
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carta cadastrada no catálogoCharizard foi publicada e já aparece nas buscas.',
    );
  });

  it('tinge o fundo do cartão quando pedido', () => {
    render(
      <Toast
        message="Solicitação aprovada"
        detail="Pikachu entrou no catálogo."
        tinted
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('Solicitação aprovada').closest('div')?.className).toMatch(/tinted/);
  });

  it('anuncia o erro como alerta', () => {
    render(<Toast tone="danger" message="Não foi possível enviar" onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível enviar');
  });

  it('some sozinho depois do tempo definido', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Salvo" durationMs={3000} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('mantém a região de aviso montada e vazia sem mensagem', () => {
    render(<Toast message={null} onDismiss={vi.fn()} />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('fecha pelo botão e esvazia a região sem mensagem', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast message="Salvo" onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(onDismiss).toHaveBeenCalledOnce();

    rerender(<Toast message={null} onDismiss={onDismiss} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('no alto, o aviso com detalhe vira o cartão do Figma, com o ícone do tom', () => {
    const { container } = render(
      <Toast
        message="Carta cadastrada no catálogo"
        detail="Charizard foi publicada e já aparece nas buscas."
        placement="top"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Carta cadastrada no catálogo');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('o aviso de uma linha só não ganha o ícone', () => {
    const { container } = render(<Toast message="Salvo" tone="danger" onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Salvo');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
