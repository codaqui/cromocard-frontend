import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bruno, conversation } from '../../test/chat-fixtures';
import { ConversationListItem } from './ConversationListItem';

function renderItem(props: Partial<Parameters<typeof ConversationListItem>[0]> = {}) {
  const onSelect = vi.fn();
  render(
    <ul>
      <ConversationListItem
        conversation={conversation()}
        active={false}
        online={false}
        onSelect={onSelect}
        {...props}
      />
    </ul>,
  );
  return onSelect;
}

describe('ConversationListItem', () => {
  it('CA1 e CA2: mostra nome, @, prévia com "Você: " e a hora', () => {
    renderItem();

    expect(screen.getByText('Elisa Cartas Raras')).toBeInTheDocument();
    expect(screen.getByText('@elisa.raras')).toBeInTheDocument();
    expect(screen.getByText('Você: Combinado, compro pelo anúncio.')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('time')).toHaveTextContent(/^\d{2}:\d{2}$/);
  });

  it('CA3: mostra o contador de não lidas', () => {
    renderItem({ conversation: bruno });

    expect(screen.getByLabelText('1 não lidas')).toHaveTextContent('1');
    expect(screen.queryByText(/^Você:/)).not.toBeInTheDocument();
  });

  it('CA15: selo Verificado e o ponto online', () => {
    renderItem({ online: true });

    expect(screen.getByTitle('Verificado')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Online' })).toBeInTheDocument();
  });

  it('CA15: sem selo e com o ponto offline', () => {
    renderItem({ conversation: bruno });

    expect(screen.queryByTitle('Verificado')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Offline' })).toBeInTheDocument();
  });

  it('marca a conversa aberta e avisa a seleção', async () => {
    const onSelect = renderItem({ active: true });

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true');
    expect(onSelect).toHaveBeenCalledWith('c-elisa');
  });

  it('conversa nova, sem mensagem, não tem prévia nem hora', () => {
    renderItem({ conversation: conversation({ lastMessage: null }) });

    expect(screen.getByRole('button').querySelector('time')).toBeNull();
    expect(screen.queryByText(/compro/)).not.toBeInTheDocument();
  });
});
