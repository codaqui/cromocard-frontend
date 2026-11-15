import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { downloadFile } from '@/lib/download-file';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import { ImportCsvModal } from './ImportCsvModal';

vi.mock('@/lib/download-file', () => ({ downloadFile: vi.fn() }));

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    importCards: vi.fn(),
    downloadImportTemplate: vi.fn(),
  },
}));

const IMPORTED_CARDS = 50;
const CSV_LINES = [
  'album_title;number;name;rarity;language;category',
  'Base;1;Pikachu;;;',
  'Base;2;Raichu;;;',
];
const csvFile = new File([CSV_LINES.join('\n')], 'cartas.csv', { type: 'text/csv' });
const onImported = vi.fn();

function renderModal() {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: <ImportCsvModal onClose={vi.fn()} onImported={onImported} />,
      },
    ],
    initialPath: '/',
  });
}

async function importCsv() {
  await userEvent.upload(screen.getByLabelText('Arquivo CSV'), csvFile);
  await userEvent.click(await screen.findByRole('button', { name: 'Importar 2 cartas' }));
}

describe('ImportCsvModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.importCards).mockReset().mockResolvedValue({ created: IMPORTED_CARDS });
    vi.mocked(catalogApi.downloadImportTemplate)
      .mockReset()
      .mockResolvedValue(new Blob(['csv']));
    vi.mocked(downloadFile).mockReset();
    onImported.mockReset();
  });

  it('R13: só libera a importação depois de escolher o arquivo', async () => {
    renderModal();

    expect(screen.getByText(/Envie um arquivo CSV com as colunas/)).toHaveTextContent(
      'album_title;number;name;rarity;language;category',
    );
    expect(screen.getByRole('button', { name: 'Importar' })).toBeDisabled();
    await userEvent.upload(screen.getByLabelText('Arquivo CSV'), csvFile);
    expect(await screen.findByRole('button', { name: 'Importar 2 cartas' })).toBeEnabled();
    expect(
      screen.getByText('2 linhas • 1 KB • escolha outro arquivo para substituir'),
    ).toBeInTheDocument();
  });

  it('CA5: importa o CSV válido e mostra o resumo com as cartas criadas', async () => {
    renderModal();
    await importCsv();

    await vi.waitFor(() =>
      expect(onImported).toHaveBeenCalledWith({
        title: '50 cartas importadas',
        detail: 'O arquivo cartas.csv foi importado no catálogo.',
      }),
    );
    expect(catalogApi.importCards).toHaveBeenCalledWith(csvFile);
  });

  it('CA6: lista as linhas com erro quando a API recusa o CSV', async () => {
    vi.mocked(catalogApi.importCards).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'CSV_INVALID',
        message: 'O arquivo tem linhas com erro e nenhuma carta foi importada',
        details: [
          { field: '3.name', message: 'Informe o nome da carta' },
          { field: '5.rarity', message: 'Raridade não encontrada' },
        ],
      }),
    );
    renderModal();
    await importCsv();

    expect(
      await screen.findByRole('dialog', { name: 'Nenhuma carta foi importada' }),
    ).toHaveTextContent(
      'O arquivo cartas.csv tem 2 linhas com erro. Corrija as linhas abaixo e envie o arquivo de novo.',
    );
    const lines = within(screen.getByRole('list', { name: 'Linhas com erro' })).getAllByRole(
      'listitem',
    );
    expect(lines.map((line) => line.textContent)).toEqual([
      'Linha 3 · Nome: Informe o nome da carta',
      'Linha 5 · Raridade: Raridade não encontrada',
    ]);
    expect(onImported).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar outro arquivo' }));
    expect(screen.getByRole('dialog', { name: 'Importar cartas por CSV' })).toBeInTheDocument();
  });

  it('R13: com uma carta no arquivo, o botão fala no singular e mostra que está importando', async () => {
    vi.mocked(catalogApi.importCards).mockReturnValue(new Promise(() => undefined));
    const oneCard = new File([CSV_LINES.slice(0, 2).join('\n')], 'uma.csv', { type: 'text/csv' });
    renderModal();
    await userEvent.upload(screen.getByLabelText('Arquivo CSV'), oneCard);
    await userEvent.click(await screen.findByRole('button', { name: 'Importar 1 carta' }));

    expect(await screen.findByRole('button', { name: 'Importando…' })).toBeDisabled();
  });

  it('R13: baixa o modelo do CSV', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Baixar modelo CSV' }));

    await vi.waitFor(() =>
      expect(downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'modelo-importacao-cartas.csv'),
    );
  });

  it('R13: mostra o motivo quando o modelo não pode ser baixado', async () => {
    vi.mocked(catalogApi.downloadImportTemplate).mockRejectedValue(
      new ApiError({
        status: 403,
        code: 'FORBIDDEN',
        message: 'Acesso restrito a administradores',
      }),
    );
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Baixar modelo CSV' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Acesso restrito a administradores');
  });
});
