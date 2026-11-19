import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { sellerVerificationsApi } from '../../seller-verifications.api';
import type { PendingNoticeTarget } from '../../seller-verifications.types';
import { PendingNoticeModal } from './PendingNoticeModal';

vi.mock('../../seller-verifications.api', () => ({
  sellerVerificationsApi: {
    getPendingTemplates: vi.fn(),
    sendPendingNotice: vi.fn(),
  },
}));

const target: PendingNoticeTarget = {
  id: 'ver-1',
  sellerId: 'seller-1',
  sellerName: 'Fábio TCG Store',
  sellerEmail: 'fabio@cromocard.dev',
  cnpj: '45.291.802/0001-93',
};

const templates = [
  {
    key: 'pix_key_mismatch',
    title: 'Chave Pix divergente do CNPJ',
    body: 'Olá, {nome}! Corrija a chave Pix do CNPJ {cnpj} em até {prazo}.',
  },
];

function renderModal(onClose = vi.fn(), onBackToDashboard = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PendingNoticeModal
          target={target}
          onClose={onClose}
          onBackToDashboard={onBackToDashboard}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PendingNoticeModal', () => {
  it('CA1: mostra o destinatário e os canais de notificação', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();

    expect(
      await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)'),
    ).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Canais de disparo' })).toHaveTextContent(
      'Notificação no SiteE-mail Transacional',
    );
  });

  it('CA2: escolher um modelo preenche o corpo com nome, CNPJ e prazo', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    await userEvent.click(
      await screen.findByRole('option', { name: 'Chave Pix divergente do CNPJ' }),
    );

    expect(screen.getByLabelText('Corpo da mensagem transacional')).toHaveValue(
      'Olá, Fábio TCG Store! Corrija a chave Pix do CNPJ 45.291.802/0001-93 em até 48 horas.',
    );
  });

  it('L1: trocar o prazo refaz o texto do modelo com o prazo novo', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();
    await userEvent.click(
      await screen.findByRole('option', { name: 'Chave Pix divergente do CNPJ' }),
    );

    await userEvent.selectOptions(screen.getByLabelText('Prazo para regularização (SLA)'), '168');

    expect(screen.getByLabelText('Corpo da mensagem transacional')).toHaveValue(
      'Olá, Fábio TCG Store! Corrija a chave Pix do CNPJ 45.291.802/0001-93 em até 7 dias.',
    );
  });

  it('R5: trocar o prazo não apaga o que o admin já editou no texto', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();
    await userEvent.click(
      await screen.findByRole('option', { name: 'Chave Pix divergente do CNPJ' }),
    );
    await userEvent.type(screen.getByLabelText('Corpo da mensagem transacional'), ' Obrigado.');

    await userEvent.selectOptions(screen.getByLabelText('Prazo para regularização (SLA)'), '24');

    expect(screen.getByLabelText('Corpo da mensagem transacional')).toHaveValue(
      'Olá, Fábio TCG Store! Corrija a chave Pix do CNPJ 45.291.802/0001-93 em até 48 horas. Obrigado.',
    );
  });

  it('CA2: clicar de novo no modelo ativo desmarca o modelo', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();
    const option = await screen.findByRole('option', { name: 'Chave Pix divergente do CNPJ' });

    await userEvent.click(option);
    expect(option).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(option);

    expect(option).toHaveAttribute('aria-selected', 'false');
  });

  it('CA3: envia o modelo escolhido e o prazo de 72 horas', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    vi.mocked(sellerVerificationsApi.sendPendingNotice).mockResolvedValue({
      sentAt: '2026-11-14T12:00:00.000Z',
      channels: ['SITE', 'EMAIL'],
      emailDelivered: true,
    });
    renderModal();
    await userEvent.click(
      await screen.findByRole('option', { name: 'Chave Pix divergente do CNPJ' }),
    );
    await userEvent.selectOptions(screen.getByLabelText('Prazo para regularização (SLA)'), '72');

    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    );

    expect(sellerVerificationsApi.sendPendingNotice).toHaveBeenCalledWith('ver-1', {
      templateKey: 'pix_key_mismatch',
      message:
        'Olá, Fábio TCG Store! Corrija a chave Pix do CNPJ 45.291.802/0001-93 em até 72 horas.',
      deadlineHours: 72,
    });
  });

  it('mostra o erro da API no formulário quando o envio falha', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    vi.mocked(sellerVerificationsApi.sendPendingNotice).mockRejectedValue(
      new Error('Este credenciamento já foi decidido'),
    );
    renderModal();
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    await userEvent.type(
      screen.getByLabelText('Corpo da mensagem transacional'),
      'Corrija a chave Pix',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    );

    expect(await screen.findByText('Este credenciamento já foi decidido')).toBeInTheDocument();
  });

  it('CA5: o botão Enviar fica desabilitado com o corpo vazio', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    renderModal();
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    expect(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    ).toBeDisabled();
  });

  it('CA3/CA4: envia a notificação e mostra a confirmação', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    vi.mocked(sellerVerificationsApi.sendPendingNotice).mockResolvedValue({
      sentAt: '2026-11-14T12:00:00.000Z',
      channels: ['SITE', 'EMAIL'],
      emailDelivered: true,
    });
    renderModal();
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    await userEvent.type(
      screen.getByLabelText('Corpo da mensagem transacional'),
      'Corrija a chave Pix',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    );

    expect(sellerVerificationsApi.sendPendingNotice).toHaveBeenCalledWith('ver-1', {
      templateKey: undefined,
      message: 'Corrija a chave Pix',
      deadlineHours: 48,
    });
    expect(await screen.findByText('Notificação enviada')).toBeInTheDocument();
    expect(screen.getByText('Notificação no site e E-mail')).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}\/11\/2026,? \d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver perfil do lojista' })).toBeInTheDocument();
  });

  it('R9: "Voltar ao Dashboard" na confirmação fecha o dossiê', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    vi.mocked(sellerVerificationsApi.sendPendingNotice).mockResolvedValue({
      sentAt: '2026-11-14T12:00:00.000Z',
      channels: ['SITE', 'EMAIL'],
      emailDelivered: true,
    });
    const onBackToDashboard = vi.fn();
    renderModal(vi.fn(), onBackToDashboard);
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');
    await userEvent.type(
      screen.getByLabelText('Corpo da mensagem transacional'),
      'Corrija a chave Pix',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Voltar ao Dashboard' }));

    expect(onBackToDashboard).toHaveBeenCalledOnce();
  });

  it('CA6: avisa quando o e-mail não é entregue', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    vi.mocked(sellerVerificationsApi.sendPendingNotice).mockResolvedValue({
      sentAt: '2026-11-14T12:00:00.000Z',
      channels: ['SITE', 'EMAIL'],
      emailDelivered: false,
    });
    renderModal();
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    await userEvent.type(
      screen.getByLabelText('Corpo da mensagem transacional'),
      'Corrija a chave Pix',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Notificação & Registrar Log' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('O e-mail não foi entregue');
  });

  it('R10: cancelar fecha sem enviar', async () => {
    vi.mocked(sellerVerificationsApi.getPendingTemplates).mockResolvedValue(templates);
    const onClose = vi.fn();
    renderModal(onClose);
    await screen.findByText('Destinatário: Fábio TCG Store (fabio@cromocard.dev)');

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(sellerVerificationsApi.sendPendingNotice).not.toHaveBeenCalled();
  });
});
