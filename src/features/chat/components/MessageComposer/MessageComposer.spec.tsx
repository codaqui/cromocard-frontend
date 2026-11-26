import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MessageComposer } from './MessageComposer';

const field = () => screen.getByRole('textbox', { name: 'Mensagem' });

describe('MessageComposer', () => {
  it('CA16: envia com Enter, sem os espaços das pontas, e limpa o campo', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<MessageComposer recipient="@marcos_tcg" onSend={onSend} />);

    expect(field()).toHaveAttribute('placeholder', 'Digite sua mensagem para @marcos_tcg...');
    await userEvent.type(field(), '  Combinado, compro pelo anúncio.  {Enter}');

    expect(onSend).toHaveBeenCalledWith('Combinado, compro pelo anúncio.');
    expect(field()).toHaveValue('');
  });

  it('R18: envia pelo botão Enviar e Shift+Enter só quebra a linha', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<MessageComposer recipient="@marcos_tcg" onSend={onSend} />);

    await userEvent.type(field(), 'Oi{Shift>}{Enter}{/Shift}tudo bem?');
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSend).toHaveBeenCalledWith('Oi\ntudo bem?');
  });

  it('CA16: se o envio falhar, o texto continua no campo e a tela avisa', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('fora do ar'));
    render(<MessageComposer recipient="@marcos_tcg" onSend={onSend} />);

    await userEvent.type(field(), 'Combinado{Enter}');

    expect(
      await screen.findByText('A mensagem não foi enviada. Tente de novo.'),
    ).toBeInTheDocument();
    expect(field()).toHaveValue('Combinado');
  });

  it('R18: não envia mensagem vazia e mostra o aviso de compras', async () => {
    const onSend = vi.fn();
    render(<MessageComposer recipient="@marcos_tcg" onSend={onSend} />);

    await userEvent.type(field(), '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    expect(
      screen.getByText('Faça compras e pagamentos só pelo marketplace da CromoCard.'),
    ).toBeInTheDocument();
  });
});
