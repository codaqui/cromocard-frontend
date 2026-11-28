import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { message } from '@/test/chat/chat-fixtures';
import type { ChatMessage } from '../../chat.types';
import { SendMessageError } from '../../hooks/useSendMessage';
import { MessageComposer } from './MessageComposer';

const field = () => screen.getByRole('textbox', { name: 'Mensagem' });
const sendButton = () => screen.getByRole('button', { name: 'Enviar' });

const quoted = message({
  id: 'm5',
  author: { id: 'marcos', name: 'Marcos Vinicius', username: 'marcos_tcg' },
  content: 'Mandei as fotos do verso agora. Pode comprar pelo anúncio que o pagamento fica retido.',
});

function setup(
  onSend = vi.fn().mockResolvedValue(undefined),
  replyingTo: ChatMessage | null = null,
) {
  const onCancelReply = vi.fn();
  render(
    <MessageComposer
      recipient="@marcos_tcg"
      replyingTo={replyingTo}
      onCancelReply={onCancelReply}
      onSend={onSend}
    />,
  );
  return { onSend, onCancelReply };
}

describe('MessageComposer', () => {
  it('CA16: envia com Enter, sem os espaços das pontas, e limpa o campo', async () => {
    const { onSend } = setup();

    expect(field()).toHaveAttribute('placeholder', 'Digite sua mensagem para @marcos_tcg...');
    await userEvent.type(field(), '  Combinado, compro pelo anúncio.  {Enter}');

    expect(onSend).toHaveBeenCalledWith('Combinado, compro pelo anúncio.');
    expect(field()).toHaveValue('');
  });

  it('R18: envia pelo botão Enviar e Shift+Enter só quebra a linha', async () => {
    const { onSend } = setup();

    await userEvent.type(field(), 'Oi{Shift>}{Enter}{/Shift}tudo bem?');
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.click(sendButton());

    expect(onSend).toHaveBeenCalledWith('Oi\ntudo bem?');
  });

  it('CA16: se o envio falhar, o texto continua no campo e a tela avisa', async () => {
    setup(vi.fn().mockRejectedValue(new Error('fora do ar')));

    await userEvent.type(field(), 'Combinado{Enter}');

    expect(
      await screen.findByText('A mensagem não foi enviada. Tente de novo.'),
    ).toBeInTheDocument();
    expect(field()).toHaveValue('Combinado');
  });

  it('CA3: com o campo vazio, "Enviar" fica ativo e avisa sem enviar, e o aviso some ao digitar', async () => {
    const { onSend } = setup(vi.fn(), quoted);

    expect(sendButton()).toBeEnabled();
    await userEvent.click(sendButton());
    await userEvent.type(field(), '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByText('Digite uma mensagem antes de enviar')).toBeInTheDocument();
    await userEvent.type(field(), 'O');
    expect(screen.queryByText('Digite uma mensagem antes de enviar')).not.toBeInTheDocument();
    expect(
      screen.getByText('Faça compras e pagamentos só pelo marketplace da CromoCard.'),
    ).toBeInTheDocument();
  });

  it('CA1: mostra o bloco da resposta e, ao enviar, fecha o bloco', async () => {
    const { onSend, onCancelReply } = setup(undefined, quoted);

    expect(screen.getByText('Respondendo a @marcos_tcg:')).toBeInTheDocument();
    await userEvent.type(field(), 'Recebi!{Enter}');

    expect(onSend).toHaveBeenCalledWith('Recebi!');
    expect(onCancelReply).toHaveBeenCalledOnce();
  });

  it('CA4: citação indisponível avisa, tira o bloco e mantém o texto', async () => {
    const unavailable = new SendMessageError('indisponível', 'REPLY_TARGET_UNAVAILABLE');
    const { onCancelReply } = setup(vi.fn().mockRejectedValue(unavailable), quoted);

    await userEvent.type(field(), 'Quero sim{Enter}');

    expect(
      await screen.findByText('A mensagem que você está respondendo não está mais disponível.'),
    ).toBeInTheDocument();
    expect(onCancelReply).toHaveBeenCalledOnce();
    expect(field()).toHaveValue('Quero sim');
  });

  it('CA7: outro erro do envio mantém a resposta em andamento', async () => {
    const blocked = new SendMessageError('bloqueado', 'CONTACT_BLOCKED');
    const { onCancelReply } = setup(vi.fn().mockRejectedValue(blocked), quoted);

    await userEvent.type(field(), 'Quero sim{Enter}');

    expect(
      await screen.findByText('A mensagem não foi enviada. Tente de novo.'),
    ).toBeInTheDocument();
    expect(onCancelReply).not.toHaveBeenCalled();
  });

  it('CA11: Esc no campo cancela a resposta e mantém o texto', async () => {
    const { onCancelReply } = setup(undefined, quoted);

    await userEvent.type(field(), 'Ainda pensando{Escape}');

    expect(onCancelReply).toHaveBeenCalledOnce();
    expect(field()).toHaveValue('Ainda pensando');
  });
});
