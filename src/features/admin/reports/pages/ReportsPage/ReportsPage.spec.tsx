import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { downloadFile } from '@/lib/download-file';

import { reportsApi } from '../../reports.api';
import type { ReportExport, ReportPreview, ReportType } from '../../reports.types';
import { ReportsPage } from './ReportsPage';

vi.mock('../../reports.api', () => ({
  PREVIEW_SIZE: 4,
  EXPORTS_PAGE_SIZE: 10,
  reportsApi: { preview: vi.fn(), export: vi.fn(), listExports: vi.fn(), downloadExport: vi.fn() },
}));

vi.mock('@/lib/download-file', () => ({ downloadFile: vi.fn() }));

const PERIOD = { from: '2026-10-18T03:00:00.000Z', to: '2026-11-16T15:00:00.000Z' };

const signupsPreview: ReportPreview = {
  type: 'signups',
  title: 'Novos cadastros',
  period: PERIOD,
  columns: [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Papel' },
    { key: 'createdAt', label: 'Cadastro' },
  ],
  rows: [
    {
      name: 'Ana Lima',
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER',
      createdAt: '2026-11-11T13:00:00.000Z',
    },
    {
      name: 'Bruno Sato',
      email: 'bruno@cromocard.dev',
      role: 'SELLER',
      createdAt: '2026-11-10T13:00:00.000Z',
    },
  ],
  total: 4218,
};

const catalogPreview: ReportPreview = {
  type: 'catalog',
  title: 'Catálogo',
  period: PERIOD,
  columns: [
    { key: 'kind', label: 'Tipo' },
    { key: 'name', label: 'Nome' },
    { key: 'franchise', label: 'Franquia' },
    { key: 'createdAt', label: 'Cadastro' },
  ],
  rows: [{ kind: 'CARD', name: 'Pikachu', franchise: null, createdAt: '2026-11-12T13:00:00.000Z' }],
  total: 1,
};

const previews: Record<ReportType, ReportPreview> = {
  signups: signupsPreview,
  catalog: catalogPreview,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  );
}

const exportItem: ReportExport = {
  id: '0198f0c2-7a3b-7c1d-8e2f-1a2b3c4d9482',
  type: 'signups',
  format: 'pdf',
  fileSize: 5_033_165,
  filters: { period: '30d', from: '2026-10-18T03:00:00.000Z', to: '2026-11-16T15:00:00.000Z' },
  requestedBy: { name: 'Marcos Admin', username: 'marcos_admin' },
  createdAt: '2026-08-05T12:20:00.000Z',
  expiresAt: '2027-02-16T17:38:00.000Z',
  expired: false,
};

const expiredItem: ReportExport = {
  ...exportItem,
  id: '0198f0c2-7a3b-7c1d-8e2f-1a2b3c4d9469',
  format: 'csv',
  filters: { period: '7d', from: '2026-07-29T03:00:00.000Z', to: '2026-08-05T15:00:00.000Z' },
  expired: true,
};

function historyPage(items: ReportExport[], meta = { page: 1, totalPages: 1 }) {
  return { data: items, meta: { ...meta, pageSize: 10, total: items.length } };
}

const historyPanel = () => screen.getByRole('region', { name: 'Histórico de relatórios' });

const previewPanel = () => screen.getByRole('region', { name: 'Pré-visualização' });

async function openExport(format: 'PDF' | 'CSV') {
  await screen.findByRole('cell', { name: 'Ana Lima' });
  await userEvent.click(screen.getByRole('button', { name: `Exportar ${format}` }));
  return screen.findByRole('alertdialog', { name: `Exportar o relatório em ${format}?` });
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.mocked(reportsApi.preview).mockReset();
    vi.mocked(reportsApi.export).mockReset();
    vi.mocked(downloadFile).mockReset();
    vi.mocked(reportsApi.downloadExport).mockReset();
    vi.mocked(reportsApi.preview).mockImplementation((type) => Promise.resolve(previews[type]));
    vi.mocked(reportsApi.listExports).mockReset().mockResolvedValue(historyPage([]));
  });

  it('CA1: mostra a grade dos 4 relatórios e a prévia de novos cadastros de 30 dias', async () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Exportar Relatórios', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novos cadastros/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const panel = previewPanel();
    expect(await within(panel).findByRole('cell', { name: 'Ana Lima' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'Vendedor' })).toBeInTheDocument();
    expect(within(panel).getByText('Últimos 30 dias')).toBeInTheDocument();
    expect(within(panel).getByText('4.218 registros')).toBeInTheDocument();
    expect(within(panel).getByText('Nome, e-mail, papel, cadastro')).toBeInTheDocument();
    expect(reportsApi.preview).toHaveBeenCalledWith('signups', { period: '30d' });
  });

  it('L9: Auditoria de Lojistas e Volume aparecem desabilitados, com "Em breve"', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /Auditoria de Lojistas/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Volume Transacionado/ })).toBeDisabled();
    expect(screen.getAllByText('Em breve')).toHaveLength(2);
  });

  it('R4/R13: trocar o relatório e o período refaz a consulta', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: /Catálogo/ }));
    expect(
      await within(previewPanel()).findByRole('cell', { name: 'Pikachu' }),
    ).toBeInTheDocument();
    expect(within(previewPanel()).getByRole('cell', { name: '—' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));
    expect(reportsApi.preview).toHaveBeenLastCalledWith('catalog', { period: '7d' });
  });

  it('não deixa exportar enquanto a prévia do novo relatório carrega', async () => {
    renderPage();
    await screen.findByRole('cell', { name: 'Ana Lima' });
    vi.mocked(reportsApi.preview).mockReturnValue(new Promise(() => undefined));

    await userEvent.click(screen.getByRole('button', { name: /Catálogo/ }));

    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled();
  });

  it('CA4: período sem dados mostra a mensagem e desabilita a exportação', async () => {
    vi.mocked(reportsApi.preview).mockResolvedValue({ ...signupsPreview, rows: [], total: 0 });
    renderPage();

    expect(
      await screen.findByText('Não foram encontrados dados para os filtros selecionados.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled();
  });

  it('CA2: confirma a exportação em CSV, baixa o arquivo e avisa', async () => {
    const file = new Blob(['Nome;E-mail']);
    vi.mocked(reportsApi.export).mockResolvedValue(file);
    renderPage();

    const dialog = await openExport('CSV');
    expect(
      within(dialog).getByText(
        /Novos cadastros • Últimos 30 dias \(.*\) • 4\.218 registros\. O arquivo fica no histórico por 90 dias\./,
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exportar CSV' }));

    expect(reportsApi.export).toHaveBeenCalledWith('signups', 'csv', { period: '30d' });
    expect(downloadFile).toHaveBeenCalledWith(file, 'cromocard-signups-2026-10-18-2026-11-16.csv');
    expect(await screen.findByText('Relatório exportado')).toBeInTheDocument();
    expect(
      screen.getByText('Novos cadastros (CSV) foi baixado e está no topo do histórico.'),
    ).toBeInTheDocument();
    expect(reportsApi.listExports).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByText('Relatório exportado')).not.toBeInTheDocument();
  });

  it('R5: com intervalo de datas, a prévia e a confirmação mostram as datas', async () => {
    const custom = { from: '2026-10-01T03:00:00.000Z', to: '2026-11-01T02:59:59.999Z' };
    vi.mocked(reportsApi.preview).mockResolvedValue({ ...signupsPreview, period: custom });
    renderPage();
    await screen.findByRole('cell', { name: 'Ana Lima' });

    await userEvent.click(screen.getByRole('button', { name: 'Personalizado' }));
    await userEvent.type(screen.getByLabelText('De'), '2026-10-01');
    await userEvent.type(screen.getByLabelText('Até'), '2026-10-31');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(reportsApi.preview).toHaveBeenLastCalledWith('signups', {
      from: '2026-10-01T03:00:00.000Z',
      to: '2026-11-01T02:59:59.999Z',
    });
    expect(within(previewPanel()).getByText('01/10/2026 a 31/10/2026')).toBeInTheDocument();
    const dialog = await openExport('PDF');
    expect(
      within(dialog).getByText(
        'Novos cadastros • 01 Out - 31 Out, 2026 • 4.218 registros. O arquivo fica no histórico por 90 dias.',
      ),
    ).toBeInTheDocument();
  });

  it('CA5: cancelar a confirmação não gera o arquivo', async () => {
    renderPage();

    const dialog = await openExport('PDF');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(reportsApi.export).not.toHaveBeenCalled();
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('mostra o erro da exportação no diálogo', async () => {
    vi.mocked(reportsApi.export).mockRejectedValue(
      new Error('Não foram encontrados dados para os filtros selecionados'),
    );
    renderPage();

    const dialog = await openExport('PDF');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exportar PDF' }));

    expect(
      await within(dialog).findByText('Não foram encontrados dados para os filtros selecionados'),
    ).toBeInTheDocument();
    expect(downloadFile).not.toHaveBeenCalled();
  });

  it('mostra o erro quando a prévia falha', async () => {
    vi.mocked(reportsApi.preview).mockRejectedValue(new Error('Falha ao carregar a prévia'));
    renderPage();

    expect(await screen.findByText('Falha ao carregar a prévia')).toBeInTheDocument();
  });

  it('CCD107 CA5: histórico vazio mostra a mensagem', async () => {
    renderPage();

    expect(
      await within(historyPanel()).findByText(
        'Ainda não há relatórios exportados. Os relatórios que a equipe exportar aparecem aqui por 90 dias.',
      ),
    ).toBeInTheDocument();
  });

  it('CCD107 CA1: mostra código, relatório, solicitante, data, formato e validade', async () => {
    vi.mocked(reportsApi.listExports).mockResolvedValue(historyPage([exportItem, expiredItem]));
    renderPage();

    const panel = historyPanel();
    expect(await within(panel).findByRole('cell', { name: '#REP-9482' })).toBeInTheDocument();
    expect(within(panel).getAllByText('Novos cadastros')).toHaveLength(2);
    expect(within(panel).getByText('Últimos 30 dias')).toBeInTheDocument();
    expect(within(panel).getAllByText('@marcos_admin')).toHaveLength(2);
    expect(within(panel).getAllByRole('cell', { name: '05/08/2026 · 09:20' })).toHaveLength(2);
    expect(within(panel).getByRole('cell', { name: 'PDF • 4,8 MB' })).toBeInTheDocument();
    expect(within(panel).getByText('16/02/2027')).toBeInTheDocument();
    expect(within(panel).getByText('Expirado')).toBeInTheDocument();
    expect(reportsApi.listExports).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('CCD107 CA2: "Baixar" entrega o mesmo arquivo da exportação', async () => {
    const file = new Blob(['%PDF-']);
    vi.mocked(reportsApi.listExports).mockResolvedValue(historyPage([exportItem]));
    vi.mocked(reportsApi.downloadExport).mockResolvedValue(file);
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Baixar #REP-9482' }));

    expect(reportsApi.downloadExport).toHaveBeenCalledWith(exportItem.id);
    expect(downloadFile).toHaveBeenCalledWith(file, 'cromocard-signups-2026-10-18-2026-11-16.pdf');
  });

  it('CCD107 CA3: arquivo expirado oferece gerar de novo com os mesmos filtros', async () => {
    const file = new Blob(['Nome;E-mail']);
    vi.mocked(reportsApi.listExports).mockResolvedValue(historyPage([expiredItem]));
    vi.mocked(reportsApi.export).mockResolvedValue(file);
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Baixar #REP-9469' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Este arquivo expirou' });
    expect(
      within(dialog).getByText(
        'O relatório #REP-9469 (Novos cadastros, últimos 7 dias) passou dos 90 dias e foi apagado. Você pode gerar de novo com os mesmos filtros.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Gerar de novo' }));

    expect(reportsApi.downloadExport).not.toHaveBeenCalled();
    expect(reportsApi.export).toHaveBeenCalledWith('signups', 'csv', { period: '7d' });
    expect(downloadFile).toHaveBeenCalledWith(file, 'cromocard-signups-2026-07-29-2026-08-05.csv');
    expect(
      await screen.findByText('Novos cadastros (CSV) foi baixado e está no topo do histórico.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('CCD107 CA3: download que responde 410 abre o aviso de expirado, e "Fechar" o fecha', async () => {
    vi.mocked(reportsApi.listExports).mockResolvedValue(historyPage([exportItem]));
    vi.mocked(reportsApi.downloadExport).mockRejectedValue(
      new ApiError({
        status: 410,
        code: 'EXPORT_EXPIRED',
        message: 'O arquivo passou dos 90 dias',
      }),
    );
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Baixar #REP-9482' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Este arquivo expirou' });
    await userEvent.click(within(dialog).getByText('Fechar', { selector: 'button' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(reportsApi.export).not.toHaveBeenCalled();
  });

  it('mostra o erro de um download que falha por outro motivo', async () => {
    vi.mocked(reportsApi.listExports).mockResolvedValue(historyPage([exportItem]));
    vi.mocked(reportsApi.downloadExport).mockRejectedValue(new Error('Servidor fora do ar'));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Baixar #REP-9482' }));

    expect(await within(historyPanel()).findByRole('alert')).toHaveTextContent(
      'Servidor fora do ar',
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('L8: pagina o histórico de 10 em 10', async () => {
    vi.mocked(reportsApi.listExports).mockResolvedValue(
      historyPage([exportItem], { page: 1, totalPages: 2 }),
    );
    renderPage();

    await userEvent.click(await within(historyPanel()).findByRole('button', { name: 'Próximo' }));

    expect(reportsApi.listExports).toHaveBeenLastCalledWith({ page: 2, pageSize: 10 });
  });

  it('mostra o erro quando o histórico não carrega', async () => {
    vi.mocked(reportsApi.listExports).mockRejectedValue(new Error('Falha no histórico'));
    renderPage();

    expect(await within(historyPanel()).findByText('Falha no histórico')).toBeInTheDocument();
  });
});
