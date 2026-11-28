import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bruno, conversation } from '@/test/chat/chat-fixtures';
import { ConversationList, type ConversationListProps } from './ConversationList';

function renderList(changes: Partial<ConversationListProps> = {}) {
  const props: ConversationListProps = {
    conversations: [conversation(), bruno],
    totals: { all: 4, unread: 2 },
    filter: 'all',
    search: '',
    activeId: 'c-elisa',
    online: new Set(['elisa']),
    onFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
    onSelect: vi.fn(),
    onNewConversation: vi.fn(),
    onEndReached: vi.fn(),
    ...changes,
  };
  render(<ConversationList {...props} />);
  return props;
}

describe('ConversationList', () => {
  it('CA1: título, "4 ativas", as conversas e o rodapé', () => {
    renderList();

    expect(screen.getByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
    expect(screen.getByText('4 ativas')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('2 de 4 conversas listadas')).toBeInTheDocument();
  });

  it('CA12: abas Todas e Não Lidas com as quantidades', async () => {
    const props = renderList();

    expect(screen.getByRole('button', { name: 'Todas 4' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Não Lidas 2' }));

    expect(props.onFilterChange).toHaveBeenCalledWith('unread');
  });

  it('CA12: a busca avisa cada letra e o "/" leva o foco ao campo', async () => {
    const props = renderList();

    await userEvent.keyboard('/');
    expect(screen.getByRole('searchbox', { name: 'Buscar conversa' })).toHaveFocus();
    await userEvent.keyboard('r');

    expect(props.onSearchChange).toHaveBeenCalledWith('r');
  });

  it('o "/" digitado dentro de um campo não rouba o foco', () => {
    renderList();
    const other = document.createElement('input');
    document.body.append(other);
    other.focus();

    fireEvent.keyDown(other, { key: '/' });

    expect(other).toHaveFocus();
    other.remove();
  });

  it('R13: o botão Nova conversa abre o modal', async () => {
    const props = renderList();

    await userEvent.click(screen.getByRole('button', { name: 'Nova conversa' }));

    expect(props.onNewConversation).toHaveBeenCalled();
  });

  it('CA4: sem conversas, o rodapé diz "Nenhuma conversa", sem o selo e os números das abas', () => {
    renderList({ conversations: [], totals: { all: 0, unread: 0 } });

    expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
    expect(screen.queryByText('0 ativas')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
  });

  it('R3: rolar até o fim da lista pede a próxima página; antes do fim, não', () => {
    const props = renderList();
    const list = screen.getAllByRole('list')[0] as HTMLElement;
    Object.defineProperties(list, {
      scrollHeight: { value: 1000 },
      clientHeight: { value: 400 },
    });

    fireEvent.scroll(list, { target: { scrollTop: 100 } });
    expect(props.onEndReached).not.toHaveBeenCalled();

    fireEvent.scroll(list, { target: { scrollTop: 580 } });
    expect(props.onEndReached).toHaveBeenCalledTimes(1);
  });
});
