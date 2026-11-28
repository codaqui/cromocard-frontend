import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { communityAdminApi } from '../../community-admin.api';
import type { GroupMessageReport } from '../../community-admin.types';
import { ReportCard } from './ReportCard';

vi.mock('../../community-admin.api', () => ({
  communityAdminApi: { getReportEvidence: vi.fn() },
}));

const getReportEvidence = vi.mocked(communityAdminApi.getReportEvidence);

const chatReport: GroupMessageReport = {
  id: 'report-chat',
  reason: 'Golpe / pagamento externo',
  description: 'Pediu Pix fora da plataforma.',
  origin: 'CHAT',
  reporterName: 'Gabriel Nascimento',
  reporterUsername: 'gabriel',
  message: null,
  reportedUser: {
    id: 'marcos',
    name: 'Marcos Vinicius',
    username: 'marcos_tcg',
    accountAgeDays: 3,
    warnings: 1,
  },
  evidences: [{ id: 'print-1' }, { id: 'print-2' }],
};

beforeEach(() => {
  let created = 0;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
    created += 1;
    return `blob:print-${created}`;
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  getReportEvidence.mockReset();
  getReportEvidence.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
});

function renderCard(report = chatReport) {
  const props = { report, onAction: vi.fn(), onSanctionAuthor: vi.fn() };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ReportCard {...props} />
    </QueryClientProvider>,
  );
  return props;
}

describe('ReportCard da denúncia do chat pessoal (CCD047)', () => {
  it('CA18: mostra o contato, a origem, quem denunciou, o motivo, a descrição e os prints', async () => {
    renderCard();

    const card = screen.getByRole('article', { name: 'Denúncia contra Marcos Vinicius' });
    expect(within(card).getByText('Chat pessoal')).toBeInTheDocument();
    expect(within(card).getByText('@gabriel')).toBeInTheDocument();
    expect(within(card).getByText('Golpe / pagamento externo')).toBeInTheDocument();
    expect(within(card).getByText('Pediu Pix fora da plataforma.')).toBeInTheDocument();
    await waitFor(() =>
      expect(within(card).getAllByRole('img', { name: /Print \d da conversa/ })).toHaveLength(2),
    );
    expect(within(card).getAllByRole('link')[0]).toHaveAttribute('href', 'blob:print-1');
    expect(within(card).queryByText(/Remover Mensagem/)).not.toBeInTheDocument();
  });

  it('usa o nome de quem denunciou quando ele não tem @', () => {
    renderCard({ ...chatReport, reporterUsername: null, description: null });

    expect(screen.getByText('Gabriel Nascimento')).toBeInTheDocument();
  });

  it('CA18: dispensa a denúncia e aplica a sanção ao contato com o id da denúncia', async () => {
    const props = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Dispensar Denúncia' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sanção ao autor' }));

    expect(props.onAction).toHaveBeenCalledWith({
      kind: 'report',
      action: 'dismiss',
      report: chatReport,
    });
    expect(props.onSanctionAuthor).toHaveBeenCalledWith({
      id: 'marcos',
      name: 'Marcos Vinicius',
      username: 'marcos_tcg',
      warningsCount: 1,
      reportId: 'report-chat',
    });
  });

  it('L13: baixa cada print pela rota do admin, com o id da denúncia, nunca por uma URL pública', async () => {
    renderCard();

    await waitFor(() =>
      expect(screen.getAllByRole('img', { name: /Print \d da conversa/ })).toHaveLength(2),
    );
    expect(getReportEvidence).toHaveBeenCalledWith('report-chat', 'print-1');
    expect(getReportEvidence).toHaveBeenCalledWith('report-chat', 'print-2');
  });

  it('mostra o lugar do print enquanto ele carrega', () => {
    getReportEvidence.mockReturnValue(new Promise(() => undefined));
    renderCard();

    expect(screen.getByLabelText('Carregando Print 1 da conversa')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('avisa quando o print não pôde ser baixado', async () => {
    getReportEvidence.mockRejectedValue(new Error('404'));
    renderCard();

    expect(
      await screen.findByRole('img', { name: 'Print 1 da conversa indisponível' }),
    ).toHaveTextContent('Indisponível');
  });
});
