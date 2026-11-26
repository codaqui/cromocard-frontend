import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { GroupMessageReport } from '../../community-admin.types';
import { ReportCard } from './ReportCard';

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
  evidences: [
    'http://localhost/uploads/report-evidences/1.png',
    'http://localhost/uploads/report-evidences/2.png',
  ],
};

function renderCard(report = chatReport) {
  const props = { report, onAction: vi.fn(), onSanctionAuthor: vi.fn() };
  render(<ReportCard {...props} />);
  return props;
}

describe('ReportCard da denúncia do chat pessoal (CCD047)', () => {
  it('CA18: mostra o contato, a origem, quem denunciou, o motivo, a descrição e os prints', () => {
    renderCard();

    const card = screen.getByRole('article', { name: 'Denúncia contra Marcos Vinicius' });
    expect(within(card).getByText('Chat pessoal')).toBeInTheDocument();
    expect(within(card).getByText('@gabriel')).toBeInTheDocument();
    expect(within(card).getByText('Golpe / pagamento externo')).toBeInTheDocument();
    expect(within(card).getByText('Pediu Pix fora da plataforma.')).toBeInTheDocument();
    const prints = within(card).getAllByRole('img', { name: /Print \d da conversa/ });
    expect(prints).toHaveLength(2);
    expect(within(card).getAllByRole('link')[0]).toHaveAttribute('href', chatReport.evidences[0]);
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
});
