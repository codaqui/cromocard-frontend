import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { message } from '@/test/chat/chat-fixtures';
import type { ChatMessage } from '../../chat.types';
import { MessageBubble } from './MessageBubble';

function setup(changes: Partial<ChatMessage> = {}, menuOpen = false) {
  const handlers = { onOpenMenu: vi.fn(), onCloseMenu: vi.fn(), onReply: vi.fn() };
  const sent = message(changes);
  render(
    <ul>
      <MessageBubble message={sent} mine unread={false} menuOpen={menuOpen} {...handlers} />
    </ul>,
  );
  return { sent, ...handlers };
}

describe('MessageBubble', () => {
  it('CA1: a resposta mostra "Respondendo a @autor" e o começo da mensagem citada acima do texto', () => {
    setup({
      content: 'Opa! Quero sim.',
      replyTo: {
        id: 'm1',
        authorUsername: 'marcos_tcg',
        content: 'Olá Gabriel! Vi que você favoritou o meu Zekrom-EX.',
        unavailable: false,
      },
    });

    const quote = screen.getByRole('blockquote');
    expect(quote).toHaveTextContent('Respondendo a @marcos_tcg');
    expect(quote).toHaveTextContent('"Olá Gabriel! Vi que você favoritou o meu Zekrom-EX."');
    expect(screen.getByText('Opa! Quero sim.')).toBeInTheDocument();
  });

  it('CA12: citação de mensagem excluída mostra "Mensagem indisponível"', () => {
    setup({ replyTo: { id: 'm1', authorUsername: 'marcos_tcg', unavailable: true } });

    expect(screen.getByRole('blockquote')).toHaveTextContent(
      'Respondendo a @marcos_tcgMensagem indisponível',
    );
  });

  it('sem @ do autor, a citação diz só "Responder"', () => {
    setup({ replyTo: { id: 'm1', authorUsername: null, content: 'Oi', unavailable: false } });

    expect(screen.getByRole('blockquote')).toHaveTextContent('Responder"Oi"');
  });

  it('mensagem sem citação não mostra o bloco', () => {
    setup();

    expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
  });

  it('R2: clicar ou dar Enter/Espaço abre o menu; outras teclas não', () => {
    const { onOpenMenu } = setup();
    const bubble = screen.getByRole('button', { name: /Olá Ana!/ });

    fireEvent.click(bubble);
    fireEvent.keyDown(bubble, { key: 'Enter' });
    fireEvent.keyDown(bubble, { key: ' ' });
    fireEvent.keyDown(bubble, { key: 'a' });

    expect(onOpenMenu).toHaveBeenCalledTimes(3);
    expect(bubble).toHaveAttribute('aria-expanded', 'false');
  });

  it('R2: com o menu aberto, Responder devolve a mensagem', () => {
    const { sent, onReply } = setup({}, true);

    fireEvent.click(screen.getByRole('menuitem', { name: /Responder/ }));

    expect(onReply).toHaveBeenCalledWith(sent);
    expect(screen.getByRole('button', { name: /Olá Ana!/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
