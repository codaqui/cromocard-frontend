import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { sellerVerificationsApi } from '../../seller-verifications.api';
import type { SellerVerificationDetail } from '../../seller-verifications.types';
import { SellerVerificationPanel } from './SellerVerificationPanel';

vi.mock('../../seller-verifications.api', () => ({
  sellerVerificationsApi: {
    getById: vi.fn(),
    validateDocument: vi.fn(),
    addNote: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  },
}));

function buildDetail(overrides: Partial<SellerVerificationDetail> = {}): SellerVerificationDetail {
  return {
    id: 'ver-1',
    status: 'UNDER_REVIEW',
    legalName: 'Cards Kanto LTDA',
    tradeName: 'Cards Kanto',
    cnpj: '45.291.802/0001-93',
    stateRegistration: '112.409.812.110',
    openingDate: '2023-02-15T00:00:00.000Z',
    companySize: 'Microempresa (ME)',
    cnae: '4761-0/00',
    responsibleName: 'Victor Hugo Menezes',
    responsibleCpf: '41290823111',
    responsiblePhone: '11987654321',
    bankName: 'Banco do Brasil',
    bankBranch: '1234',
    bankAccount: '56789-0',
    pixKey: 'victor@cromocard.dev',
    rejectionReason: null,
    reviewedAt: null,
    createdAt: '2026-10-20T15:00:00Z',
    seller: { id: 'seller-1', name: 'Fábio TCG Store', email: 'fabio@cromocard.dev' },
    documents: [
      {
        id: 'doc-1',
        type: 'CNPJ_CARD',
        fileUrl: 'https://files.cromocard.dev/doc.pdf',
        fileSize: 240000,
        status: 'SUBMITTED',
        validatedAt: null,
        validatedById: null,
        createdAt: '2026-10-20T15:00:00Z',
      },
    ],
    notes: [],
    ...overrides,
  };
}

function renderPanel(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SellerVerificationPanel id="ver-1" onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SellerVerificationPanel', () => {
  it('CA2: mostra empresa, responsável, dados bancários e documentos', async () => {
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(buildDetail());
    renderPanel();

    expect(await screen.findByText('Cards Kanto LTDA')).toBeInTheDocument();
    expect(screen.getByText('Victor Hugo Menezes')).toBeInTheDocument();
    expect(screen.getByText('Banco do Brasil')).toBeInTheDocument();
    expect(screen.getByText('Cartão CNPJ')).toBeInTheDocument();
  });

  it('CA3: valida um documento enviado', async () => {
    const detail = buildDetail();
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(detail);
    vi.mocked(sellerVerificationsApi.validateDocument).mockResolvedValue({
      ...detail,
      documents: [{ ...detail.documents[0]!, status: 'VALIDATED', validatedAt: '2026-11-13T12:00:00Z' }],
    });
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(sellerVerificationsApi.validateDocument).toHaveBeenCalledWith('ver-1', 'doc-1');
    expect(await screen.findByText('Documento validado com sucesso.')).toBeInTheDocument();
  });

  it('CA4: aprova o credenciamento', async () => {
    const detail = buildDetail();
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(detail);
    vi.mocked(sellerVerificationsApi.approve).mockResolvedValue({ ...detail, status: 'APPROVED' });
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Validar Lojista' }));

    expect(sellerVerificationsApi.approve).toHaveBeenCalledWith('ver-1', {});
    expect(await screen.findByText('Credenciamento aprovado com sucesso.')).toBeInTheDocument();
  });

  it('CA5: rejeita com motivo e notifica o vendedor', async () => {
    const detail = buildDetail();
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(detail);
    vi.mocked(sellerVerificationsApi.reject).mockResolvedValue({ ...detail, status: 'REJECTED' });
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Rejeitar' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo da rejeição'), 'Documento ilegível');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rejeitar' }));

    expect(sellerVerificationsApi.reject).toHaveBeenCalledWith('ver-1', { reason: 'Documento ilegível' });
    expect(await screen.findByText('Credenciamento reprovado com sucesso.')).toBeInTheDocument();
  });

  it('R7: registra a anotação interna', async () => {
    const detail = buildDetail();
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(detail);
    vi.mocked(sellerVerificationsApi.addNote).mockResolvedValue({
      ...detail,
      notes: [
        { id: 'note-1', content: 'Lojista já atua há 2 anos', createdAt: '2026-11-13T12:00:00Z', author: { id: 'admin-1', name: 'Admin' } },
      ],
    });
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.type(
      screen.getByLabelText('Nova anotação interna'),
      'Lojista já atua há 2 anos',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }));

    expect(sellerVerificationsApi.addNote).toHaveBeenCalledWith('ver-1', {
      content: 'Lojista já atua há 2 anos',
    });
    expect(await screen.findByText('Anotação registrada com sucesso.')).toBeInTheDocument();
  });

  it('R7: não registra uma anotação vazia', async () => {
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(buildDetail());
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar anotação' }));

    expect(await screen.findByText('Escreva uma anotação')).toBeInTheDocument();
    expect(sellerVerificationsApi.addNote).not.toHaveBeenCalled();
  });

  it('CA6: confirmar a rejeição sem motivo não chama a API', async () => {
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(buildDetail());
    renderPanel();
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Rejeitar' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rejeitar' }));

    expect(
      await within(dialog).findByText('O motivo precisa ter pelo menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(sellerVerificationsApi.reject).not.toHaveBeenCalled();
  });

  it('R10: fechar o dossiê sem decidir não chama nenhuma API de decisão', async () => {
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(buildDetail());
    const onClose = vi.fn();
    renderPanel(onClose);
    await screen.findByText('Cards Kanto LTDA');

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalled();
    expect(sellerVerificationsApi.approve).not.toHaveBeenCalled();
    expect(sellerVerificationsApi.reject).not.toHaveBeenCalled();
  });

  it('credenciamento já decidido não mostra os botões de decisão', async () => {
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue(
      buildDetail({ status: 'APPROVED', reviewedAt: '2026-11-10T10:00:00Z' }),
    );
    renderPanel();

    await screen.findByText('Cards Kanto LTDA');
    expect(screen.queryByRole('button', { name: 'Validar Lojista' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rejeitar' })).not.toBeInTheDocument();
  });
});
