import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import { ImportCsvModal } from './ImportCsvModal';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    importCards: vi.fn(),
    downloadImportTemplate: vi.fn(),
  },
}));

const IMPORTED_CARDS = 50;
const csvFile = new File(['album_title;number;name;rarity;language;category'], 'cartas.csv', {
  type: 'text/csv',
});
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
  await userEvent.click(screen.getByRole('button', { name: 'Importar' }));
}

describe('ImportCsvModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.importCards).mockReset().mockResolvedValue({ created: IMPORTED_CARDS });
    vi.mocked(catalogApi.downloadImportTemplate)
      .mockReset()
      .mockResolvedValue(new Blob(['csv']));
    onImported.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('R13: só libera a importação depois de escolher o arquivo', async () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Importar' })).toBeDisabled();
    await userEvent.upload(screen.getByLabelText('Arquivo CSV'), csvFile);
    expect(screen.getByRole('button', { name: 'Importar' })).toBeEnabled();
  });

  it('CA5: importa o CSV válido e mostra o resumo com as cartas criadas', async () => {
    renderModal();
    await importCsv();

    await vi.waitFor(() =>
      expect(onImported).toHaveBeenCalledWith('50 cartas importadas com sucesso.'),
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

    expect(await screen.findByRole('alert')).toHaveTextContent('nenhuma carta foi importada');
    const lines = within(screen.getByRole('list', { name: 'Linhas com erro' })).getAllByRole(
      'listitem',
    );
    expect(lines.map((line) => line.textContent)).toEqual([
      'Linha 3 · Nome: Informe o nome da carta',
      'Linha 5 · Raridade: Raridade não encontrada',
    ]);
    expect(onImported).not.toHaveBeenCalled();
  });

  it('R13: baixa o modelo do CSV', async () => {
    const createObjectURL = vi.fn(() => 'blob:modelo');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Baixar modelo' }));

    await vi.waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(catalogApi.downloadImportTemplate).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
  });
});
