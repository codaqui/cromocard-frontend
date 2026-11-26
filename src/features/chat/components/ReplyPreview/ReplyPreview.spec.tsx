import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { message } from '@/test/chat/chat-fixtures';
import { ReplyPreview } from './ReplyPreview';

const long =
  'Mandei as fotos do verso agora. Pode comprar pelo anúncio que o pagamento fica retido.';

describe('ReplyPreview (R3, R13)', () => {
  it('CA2: mostra o autor e a mensagem entre aspas (o corte em "..." é do CSS, conferido no navegador)', () => {
    render(
      <ReplyPreview
        message={message({
          author: { id: 'marcos', name: 'Marcos', username: 'marcos_tcg' },
          content: long,
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Respondendo a @marcos_tcg:')).toBeInTheDocument();
    expect(screen.getByText(`"${long}"`)).toBeInTheDocument();
  });

  it('usa o nome quando o autor não tem @', () => {
    render(
      <ReplyPreview
        message={message({ author: { id: 'b', name: 'Bruno Figurinhas', username: null } })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Respondendo a Bruno Figurinhas:')).toBeInTheDocument();
  });

  it('CA11: o "×" cancela a resposta', async () => {
    const onCancel = vi.fn();
    render(<ReplyPreview message={message()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar resposta' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
