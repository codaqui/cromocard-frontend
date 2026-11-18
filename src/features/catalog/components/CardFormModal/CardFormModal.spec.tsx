import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type * as CatalogImage from '../../catalog.image';
import { readImageSize } from '../../catalog.image';
import type { Card } from '../../catalog.types';
import {
  album,
  albumCategory,
  card,
  cardCategory,
  language,
  pageOf,
  rarity,
} from '../../test/catalogFixtures';
import { CardFormModal } from './CardFormModal';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    createCard: vi.fn(),
    updateCard: vi.fn(),
    uploadImage: vi.fn(),
    listAlbums: vi.fn(),
    listCategories: vi.fn(),
    listRarities: vi.fn(),
    listLanguages: vi.fn(),
  },
}));

vi.mock('../../catalog.image', async (importOriginal) => ({
  ...(await importOriginal<typeof CatalogImage>()),
  readImageSize: vi.fn(),
  localPreviewUrl: vi.fn(() => 'blob:previa-local'),
  releasePreviewUrl: vi.fn(),
}));

const FRONT_IMAGE_URL = 'https://hml-api.cromocard.com.br/uploads/cards/nova.webp';
const CREATE = 'Cadastrar Carta no Catálogo';
const onSaved = vi.fn();

function renderModal(editing?: Card) {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: <CardFormModal card={editing} onClose={vi.fn()} onSaved={onSaved} />,
      },
    ],
    initialPath: '/',
  });
}

const frontImage = () => new File(['imagem'], 'frente.webp', { type: 'image/webp' });

async function chooseOption(label: string, name: string) {
  await screen.findByRole('option', { name });
  const select = screen.getByLabelText(label);
  await userEvent.selectOptions(select, within(select).getByRole('option', { name }));
}

async function fillNewCard({ rarityName = rarity.name }: { rarityName?: string } = {}) {
  await userEvent.type(screen.getByLabelText('Nome da carta *'), 'Garrincha');
  await chooseOption('Franquia *', cardCategory.name);
  await chooseOption('Álbum', album.title);
  await userEvent.type(screen.getByLabelText('Numeração'), '10');
  if (rarityName) await chooseOption('Raridade *', rarityName);
  await chooseOption('Idioma *', language.name);
  await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), frontImage());
  await screen.findByRole('img', { name: 'Prévia: Imagem da frente' });
}

async function saveAndConfirm(submit = CREATE) {
  await userEvent.click(screen.getByRole('button', { name: submit }));
  expect(await screen.findByText('Confirma salvar os dados da carta?')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
}

describe('CardFormModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.createCard).mockReset().mockResolvedValue(card);
    vi.mocked(catalogApi.updateCard).mockReset().mockResolvedValue(card);
    vi.mocked(catalogApi.uploadImage)
      .mockReset()
      .mockResolvedValue({ key: 'cards/nova.webp', url: FRONT_IMAGE_URL });
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(pageOf([album]));
    vi.mocked(catalogApi.listCategories).mockResolvedValue(pageOf([cardCategory]));
    vi.mocked(catalogApi.listRarities).mockResolvedValue([rarity]);
    vi.mocked(catalogApi.listLanguages).mockResolvedValue([language]);
    vi.mocked(readImageSize).mockReset().mockResolvedValue({ width: 2400, height: 3360 });
    onSaved.mockReset();
  });

  it('L11: escolher o álbum preenche a franquia dele; álbum sem franquia mantém a escolhida', async () => {
    const football = { ...album, id: `${album.id.slice(0, -2)}99`, title: 'Brasileirão 2026' };
    const withCategory = { ...football, categoryId: albumCategory.id, category: albumCategory };
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(pageOf([album, withCategory]));
    vi.mocked(catalogApi.listCategories).mockResolvedValue(pageOf([cardCategory, albumCategory]));
    renderModal();
    await chooseOption('Franquia *', cardCategory.name);

    await chooseOption('Álbum', album.title);
    expect(screen.getByLabelText('Franquia *')).toHaveValue(cardCategory.id);
    await chooseOption('Álbum', withCategory.title);
    expect(screen.getByLabelText('Franquia *')).toHaveValue(albumCategory.id);
  });

  it('CA2: envia a imagem, confirma e cadastra a carta com todos os campos de publicação', async () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Cadastrar nova carta' })).toBeInTheDocument();
    await fillNewCard();
    await saveAndConfirm();

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({
        title: 'Carta cadastrada no catálogo',
        detail: 'Garrincha foi publicada e já aparece nas buscas.',
      }),
    );
    expect(catalogApi.uploadImage).toHaveBeenCalledWith('cards', expect.any(File));
    expect(vi.mocked(catalogApi.createCard).mock.calls[0]?.[0]).toMatchObject({
      name: 'Garrincha',
      number: '10',
      albumId: album.id,
      categoryId: cardCategory.id,
      rarityId: rarity.id,
      languageId: language.id,
      frontImageUrl: FRONT_IMAGE_URL,
      backImageUrl: null,
    });
  });

  it('CA8: sem raridade, marca o campo e conta os campos destacados no rodapé', async () => {
    renderModal();
    await fillNewCard({ rarityName: '' });
    await userEvent.click(screen.getByRole('button', { name: CREATE }));

    expect(await screen.findByText('Selecione a raridade.')).toBeInTheDocument();
    expect(screen.getByLabelText('Raridade *')).toHaveAttribute('aria-invalid', 'true');
    expect(
      screen.getByText('Corrija o campo destacado para cadastrar a carta.'),
    ).toBeInTheDocument();
    expect(catalogApi.createCard).not.toHaveBeenCalled();
  });

  it('R8: mostra os erros de cada campo e não pede confirmação com dados inválidos', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: CREATE }));

    expect(await screen.findByText('Informe o nome da carta.')).toBeInTheDocument();
    expect(screen.getByText('Selecione a franquia.')).toBeInTheDocument();
    expect(screen.getByText('Envie a imagem.')).toBeInTheDocument();
    expect(
      screen.getByText('Corrija os 5 campos destacados para cadastrar a carta.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
  });

  it('CA3: número repetido no álbum volta ao campo Numeração com o motivo do 409', async () => {
    vi.mocked(catalogApi.createCard).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'CARD_NUMBER_TAKEN',
        message: 'Já existe uma carta com este número no álbum',
      }),
    );
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    expect(await screen.findByText('A numeração 10 já existe neste álbum.')).toBeInTheDocument();
    expect(screen.getByLabelText('Numeração')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('R7: o número de uma carta excluída mostra o motivo que a API devolve', async () => {
    vi.mocked(catalogApi.createCard).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'CARD_NUMBER_TAKEN',
        message: 'O número pertence a uma carta excluída deste álbum',
      }),
    );
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    expect(
      await screen.findByText('O número pertence a uma carta excluída deste álbum'),
    ).toBeInTheDocument();
  });

  it('R4: edita a carta existente pelo id e avisa a auditoria', async () => {
    renderModal(card);
    expect(screen.getByRole('dialog', { name: 'Editar carta' })).toBeInTheDocument();
    expect(screen.getByText(`Altere os dados de ${card.name}.`)).toBeInTheDocument();
    expect(screen.getByText('Alterações registradas no log de auditoria.')).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Nome da carta *'));
    await userEvent.type(screen.getByLabelText('Nome da carta *'), 'Pelé Rei');
    await saveAndConfirm('Salvar alterações');

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Carta atualizada no catálogo' }),
      ),
    );
    expect(vi.mocked(catalogApi.updateCard).mock.calls[0]?.[0]).toBe(card.id);
  });

  it('R8: leva ao campo o erro que a API devolve em details', async () => {
    vi.mocked(catalogApi.createCard).mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: [{ field: 'rarityId', message: 'Selecione a raridade.' }],
      }),
    );
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    expect(await screen.findByText('Selecione a raridade.')).toBeInTheDocument();
    expect(screen.getByLabelText('Raridade *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('R8: mostra no formulário o erro da API que não é de um campo', async () => {
    vi.mocked(catalogApi.createCard).mockRejectedValue(
      new ApiError({ status: 404, code: 'ALBUM_NOT_FOUND', message: 'Álbum não encontrado' }),
    );
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Álbum não encontrado');
  });

  it('R8: leva o foco ao Confirmar e o devolve ao Salvar no Voltar', async () => {
    renderModal(card);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    const confirm = await screen.findByRole('button', { name: 'Confirmar' });
    expect(confirm).toHaveFocus();
    expect(confirm).toHaveAccessibleDescription('Confirma salvar os dados da carta?');
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toHaveFocus();
  });

  it('R6: na edição, mantém o álbum da carta e mostra a numeração com o total do álbum', () => {
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(pageOf([]));
    renderModal(card);

    expect(screen.getByLabelText('Álbum')).toHaveValue(album.id);
    expect(screen.getByRole('option', { name: album.title })).toBeInTheDocument();
    expect(screen.getByLabelText('Total de cartas do álbum')).toHaveTextContent('670');
  });

  it('R6: na edição, mostra a raridade e o idioma da carta antes de as opções carregarem', () => {
    vi.mocked(catalogApi.listRarities).mockReturnValue(new Promise(() => undefined));
    vi.mocked(catalogApi.listLanguages).mockReturnValue(new Promise(() => undefined));
    renderModal(card);

    expect(screen.getByLabelText('Raridade *')).toHaveValue(rarity.id);
    expect(screen.getByLabelText('Idioma *')).toHaveValue(language.id);
  });

  it('L5: sem álbum, a numeração não tem total', async () => {
    renderModal();

    expect(await screen.findByLabelText('Total de cartas do álbum')).toHaveTextContent('—');
  });

  it('R12: só libera o salvar depois que a imagem termina de subir', async () => {
    let finishUpload: (image: { key: string; url: string }) => void = () => undefined;
    vi.mocked(catalogApi.uploadImage).mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    renderModal(card);
    await userEvent.upload(screen.getByLabelText('Substituir imagem da frente'), frontImage());

    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled(),
    );
    finishUpload({ key: 'cards/nova.webp', url: FRONT_IMAGE_URL });
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled(),
    );
  });

  it('R12: imagem abaixo de 1200×1600 px não é enviada e o campo explica o mínimo', async () => {
    vi.mocked(readImageSize).mockResolvedValue({ width: 800, height: 1000 });
    renderModal();
    await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), frontImage());

    expect(await screen.findByText('Abaixo do mínimo')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A imagem precisa ter no mínimo 1200×1600 px.',
    );
    expect(catalogApi.uploadImage).not.toHaveBeenCalled();
  });
});
