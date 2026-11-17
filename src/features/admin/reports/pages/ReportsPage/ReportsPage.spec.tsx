import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadFile } from '@/lib/download-file';

import { reportsApi } from '../../reports.api';
import type { ReportPreview, ReportType } from '../../reports.types';
import { ReportsPage } from './ReportsPage';

vi.mock('../../reports.api', () => ({
  PREVIEW_SIZE: 4,
  reportsApi: { preview: vi.fn(), export: vi.fn() },
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
    vi.mocked(reportsApi.preview).mockImplementation((type) => Promise.resolve(previews[type]));
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
    expect(within(panel).getByText('Nome, E-mail, Papel, Cadastro')).toBeInTheDocument();
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
      within(dialog).getByText(/Novos cadastros • Últimos 30 dias \(.*\) • 4\.218 registros\./),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Exportar CSV' }));

    expect(reportsApi.export).toHaveBeenCalledWith('signups', 'csv', { period: '30d' });
    expect(downloadFile).toHaveBeenCalledWith(file, 'cromocard-signups-2026-10-18-2026-11-16.csv');
    expect(await screen.findByText('Relatório exportado')).toBeInTheDocument();
    expect(screen.getByText('Novos cadastros (CSV) foi baixado.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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

  it('L10: a seção de histórico aparece, ainda vazia', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Histórico de relatórios' })).toBeInTheDocument();
    expect(screen.getByText('O histórico de exportações chega em breve')).toBeInTheDocument();
  });
});
