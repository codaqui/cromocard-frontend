import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { conversation } from '@/test/chat/chat-fixtures';

import { contactModerationApi } from '../../moderation/contact-moderation.api';
import { ContactModerationDialog } from './ContactModerationDialog';

vi.mock('../../moderation/contact-moderation.api', () => ({
  contactModerationApi: { block: vi.fn(), unblock: vi.fn(), report: vi.fn(), listBlocks: vi.fn() },
}));

const marcos = conversation({
  id: 'c-marcos',
  contact: {
    id: 'marcos',
    name: 'Marcos Vinicius',
    username: 'marcos_tcg',
    avatarUrl: null,
    verified: false,
  },
  createdAt: '2026-10-05T12:00:00.000Z',
});
const print = (name = 'print.png', type = 'image/png') => new File(['png'], name, { type });

function renderDialog(summary = marcos) {
  const props = { conversation: summary, onClose: vi.fn(), onDone: vi.fn() };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ContactModerationDialog {...props} />
    </QueryClientProvider>,
  );
  return props;
}

const user = () => userEvent.setup({ applyAccept: false });
const action = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}$`) });
const attach = (files: File[]) => user().upload(screen.getByLabelText('+ Adicionar print'), files);

describe('ContactModerationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contactModerationApi.block).mockResolvedValue({ userId: 'marcos', blockedAt: '' });
    vi.mocked(contactModerationApi.report).mockResolvedValue({
      id: 'r1',
      status: 'PENDING',
      blocked: true,
    });
    vi.mocked(contactModerationApi.unblock).mockResolvedValue(undefined);
  });

  it('R2–R5: mostra o contato, as três opções com Bloquear e denunciar marcada e o rodapé', () => {
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: 'Bloquear ou denunciar @marcos_tcg' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Marcos Vinicius (@marcos_tcg)')).toBeInTheDocument();
    expect(screen.getByText(/@marcos_tcg • conversa desde out\. de 2026/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Bloquear e denunciar/ })).toBeChecked();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByText('Você pode desbloquear em Configurações.')).toBeInTheDocument();
    expect(action('Bloquear e denunciar')).toBeInTheDocument();
  });

  it('CA1: bloqueia e denuncia com o motivo, a descrição e o print, e avisa', async () => {
    const props = renderDialog();
    await user().click(screen.getByRole('button', { name: 'Golpe / pagamento externo' }));
    await user().type(screen.getByLabelText('Conte o que aconteceu'), 'Pediu Pix fora');
    const file = print();
    await attach([file]);

    await user().click(action('Bloquear e denunciar'));

    expect(contactModerationApi.report).toHaveBeenCalledWith({
      userId: 'marcos',
      reason: 'Golpe / pagamento externo',
      description: 'Pediu Pix fora',
      block: true,
      evidences: [file],
    });
    expect(props.onDone).toHaveBeenCalledWith({
      title: 'Contato bloqueado e denunciado',
      detail: 'A moderação vai analisar a conversa.',
    });
  });

  it('CA2: Somente bloquear esconde a denúncia e só bloqueia', async () => {
    const props = renderDialog();
    await user().click(screen.getByRole('radio', { name: /Somente bloquear/ }));

    expect(screen.queryByText('Motivo da denúncia')).not.toBeInTheDocument();
    await user().click(action('Bloquear'));

    expect(contactModerationApi.block).toHaveBeenCalledWith('marcos');
    expect(contactModerationApi.report).not.toHaveBeenCalled();
    expect(props.onDone).toHaveBeenCalledWith({
      title: 'Contato bloqueado',
      detail: 'Ele não poderá mais te enviar mensagens.',
    });
  });

  it('CA3: Somente denunciar denuncia sem bloquear', async () => {
    const props = renderDialog();
    await user().click(screen.getByRole('radio', { name: /Somente denunciar/ }));
    await user().click(screen.getByRole('button', { name: 'Spam' }));
    await attach([print()]);

    await user().click(action('Denunciar'));

    expect(contactModerationApi.report).toHaveBeenCalledWith(
      expect.objectContaining({ block: false, reason: 'Spam', description: undefined }),
    );
    expect(props.onDone).toHaveBeenCalledWith({
      title: 'Denúncia enviada',
      detail: 'A moderação vai analisar a conversa.',
    });
  });

  it('CA4: sem motivo e sem print, pede os dois e não chama a API', async () => {
    renderDialog();

    await user().click(action('Bloquear e denunciar'));

    expect(screen.getByText('Escolha o motivo da denúncia.')).toBeInTheDocument();
    expect(screen.getByText('Envie pelo menos um print da conversa.')).toBeInTheDocument();
    expect(contactModerationApi.report).not.toHaveBeenCalled();
  });

  it('CA15: recusa um GIF e some com o botão depois do terceiro print, e um print pode ser removido', async () => {
    renderDialog();
    await attach([print('a.gif', 'image/gif')]);
    expect(
      screen.getByText('Envie até 3 imagens PNG, JPG ou WEBP de até 4 MB cada.'),
    ).toBeInTheDocument();

    await attach([print('1.png'), print('2.png'), print('3.png')]);

    expect(screen.queryByLabelText('+ Adicionar print')).not.toBeInTheDocument();
    await user().click(screen.getByRole('button', { name: 'Remover o print 2' }));
    expect(screen.queryByText('2.png')).not.toBeInTheDocument();
    expect(screen.getByLabelText('+ Adicionar print')).toBeInTheDocument();
  });

  it('CA6: Cancelar e o fechar não chamam a API', async () => {
    const props = renderDialog();

    await user().click(screen.getByRole('button', { name: 'Cancelar' }));
    await user().click(screen.getByRole('button', { name: 'Fechar' }));

    expect(props.onClose).toHaveBeenCalledTimes(2);
    expect(contactModerationApi.block).not.toHaveBeenCalled();
    expect(contactModerationApi.report).not.toHaveBeenCalled();
  });

  it('CA17: denúncia repetida mostra o aviso da moderação e mantém o modal', async () => {
    vi.mocked(contactModerationApi.report).mockRejectedValue(
      new ApiError({ status: 409, code: 'REPORT_ALREADY_PENDING', message: 'x' }),
    );
    const props = renderDialog();
    await user().click(screen.getByRole('button', { name: 'Assédio' }));
    await attach([print()]);

    await user().click(action('Bloquear e denunciar'));

    expect(
      await screen.findByText('Você já denunciou este contato. A moderação está analisando.'),
    ).toBeInTheDocument();
    expect(props.onDone).not.toHaveBeenCalled();
  });

  it('CA19: com a API fora do ar, o modal continua com o que foi preenchido', async () => {
    vi.mocked(contactModerationApi.block).mockRejectedValue(new Error('offline'));
    renderDialog();
    await user().click(screen.getByRole('radio', { name: /Somente bloquear/ }));

    await user().click(action('Bloquear'));

    expect(
      await screen.findByText('Não foi possível concluir. Tente de novo.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Somente bloquear/ })).toBeChecked();
  });

  it('R12: com o contato já bloqueado, o escudo oferece Desbloquear', async () => {
    const props = renderDialog({ ...marcos, block: 'BY_ME' });

    expect(screen.getByText('@marcos_tcg está bloqueado')).toBeInTheDocument();
    await user().click(screen.getByRole('button', { name: 'Desbloquear' }));

    expect(contactModerationApi.unblock).toHaveBeenCalledWith('marcos');
    expect(props.onDone).toHaveBeenCalledWith({
      title: 'Contato desbloqueado',
      detail: 'Vocês podem conversar de novo.',
    });
  });

  it('R12: se o desbloqueio falhar, avisa e mantém o modal', async () => {
    vi.mocked(contactModerationApi.unblock).mockRejectedValue(new Error('offline'));
    renderDialog({ ...marcos, block: 'BY_ME' });

    await user().click(screen.getByRole('button', { name: 'Desbloquear' }));

    expect(
      await screen.findByText('Não foi possível concluir. Tente de novo.'),
    ).toBeInTheDocument();
  });
});
