import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeApi } from '../../finance.api';
import type { LedgerEntry, LedgerMeta } from '../../finance.types';
import { LedgerModal } from './LedgerModal';

vi.mock('../../finance.api', () => ({ financeApi: { getLedger: vi.fn() } }));

const entries: LedgerEntry[] = [
  {
    at: '2026-11-12T01:48:00Z',
    type: 'PAYMENT',
    orderId: '0193a1b2-c3d4-7e5f-8a9b-0c1d2e348211',
    buyer: 'lucas.tcg',
    seller: 'Geek Cards SP Hub',
    amountCents: 185000,
  },
  {
    at: '2026-11-12T01:31:00Z',
    type: 'RELEASE',
    orderId: '0193a1b2-c3d4-7e5f-8a9b-0c1d2e348190',
    buyer: 'ana_cards',
    seller: 'Alpha Graded Collectibles',
    amountCents: 242000,
  },
];

const meta: LedgerMeta = {
  page: 1,
  pageSize: 10,
  total: 12,
  totalPages: 2,
  totals: { receivedCents: 185000, releasedCents: 242000, retainedCents: 64235000 },
  day: { from: '2026-11-11T03:00:00.000Z', to: '2026-11-12T03:00:00.000Z' },
};

function renderModal(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LedgerModal open onClose={onClose} />
    </QueryClientProvider>,
  );
  return onClose;
}

describe('LedgerModal', () => {
  beforeEach(() => {
    vi.mocked(financeApi.getLedger).mockReset().mockResolvedValue({ data: entries, meta });
  });

  it('CA3: lista as movimentações do dia com hora, pedido, comprador, vendedor, tipo e valor', async () => {
    renderModal();

    const payment = await screen.findByRole('row', { name: /lucas\.tcg/ });
    expect(payment).toHaveTextContent('22h48');
    expect(payment).toHaveTextContent('#PED-48211');
    expect(payment).toHaveTextContent('Geek Cards SP Hub');
    expect(payment).toHaveTextContent('Pagamento recebido');
    expect(payment).toHaveTextContent(/R\$\s1\.850,00/);
    expect(screen.getByRole('row', { name: /ana_cards/ })).toHaveTextContent(
      'Liberação ao vendedor',
    );
  });

  it('CA3: mostra os totais do dia e o dia no subtítulo', async () => {
    renderModal();

    const dialog = await screen.findByRole('dialog', { name: 'Livro Razão de Hoje' });
    expect(await within(dialog).findByText(/em 11 Nov, 2026\./)).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Recebido hojeR\$\s1\.850,00/);
    expect(dialog).toHaveTextContent(/Liberado hojeR\$\s2\.420,00/);
    expect(dialog).toHaveTextContent(/Retido em garantiaR\$\s642\.350,00/);
    expect(dialog).toHaveTextContent('Mostrando 2 de 12 movimentações de hoje');
  });

  it('L10: pagina com 10 por página', async () => {
    renderModal();
    await screen.findByRole('row', { name: /lucas\.tcg/ });

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(financeApi.getLedger).toHaveBeenLastCalledWith({ page: 2 });
  });

  it('fecha pelo botão Fechar', async () => {
    const onClose = renderModal();
    await screen.findByRole('row', { name: /lucas\.tcg/ });

    const [, footerClose] = screen.getAllByRole('button', { name: 'Fechar' });
    await userEvent.click(footerClose!);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
