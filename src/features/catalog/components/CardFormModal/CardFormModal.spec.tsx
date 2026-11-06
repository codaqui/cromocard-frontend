import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Card } from '../../catalog.types';
import { album, card, cardCategory, language, pageOf, rarity } from '../../test/catalogFixtures';
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

const FRONT_IMAGE_URL = 'https://hml-api.cromocard.com.br/uploads/cards/nova.webp';
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

async function fillNewCard() {
  await userEvent.type(screen.getByLabelText('Nome'), 'Garrincha');
  await userEvent.type(screen.getByLabelText('Número'), '10');
  await screen.findByRole('option', { name: album.title });
  await userEvent.selectOptions(screen.getByLabelText('Álbum'), album.id);
  const image = new File(['imagem'], 'frente.webp', { type: 'image/webp' });
  await userEvent.upload(screen.getByLabelText('Imagem da frente'), image);
  await screen.findByRole('img', { name: 'Prévia: Imagem da frente' });
}

async function saveAndConfirm() {
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
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
    onSaved.mockReset();
  });

  it('CA2: envia a imagem, confirma e cadastra a carta com nome, número e álbum', async () => {
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('Carta cadastrada com sucesso.'));
    expect(catalogApi.uploadImage).toHaveBeenCalledWith('cards', expect.any(File));
    expect(vi.mocked(catalogApi.createCard).mock.calls[0]?.[0]).toMatchObject({
      name: 'Garrincha',
      number: '10',
      albumId: album.id,
      frontImageUrl: FRONT_IMAGE_URL,
      backImageUrl: null,
      rarityId: null,
    });
  });

  it('R8: mostra os erros de cada campo e não pede confirmação com dados inválidos', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome da carta')).toBeInTheDocument();
    expect(screen.getByText('Envie a imagem')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
  });

  it('CA3: número repetido no álbum volta ao formulário com o motivo do 409', async () => {
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

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Já existe uma carta com este número no álbum',
    );
    expect(screen.getByLabelText('Nome')).toBeVisible();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('R4: edita a carta existente pelo id', async () => {
    renderModal(card);
    expect(screen.getByRole('dialog', { name: 'Editar carta' })).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Nome'));
    await userEvent.type(screen.getByLabelText('Nome'), 'Pelé Rei');
    await saveAndConfirm();

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('Carta atualizada com sucesso.'));
    expect(vi.mocked(catalogApi.updateCard).mock.calls[0]?.[0]).toBe(card.id);
  });

  it('R8: leva ao campo o erro que a API devolve em details', async () => {
    vi.mocked(catalogApi.createCard).mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: [{ field: 'number', message: 'O número pode ter no máximo 20 caracteres' }],
      }),
    );
    renderModal();
    await fillNewCard();
    await saveAndConfirm();

    expect(
      await screen.findByText('O número pode ter no máximo 20 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Número')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('R8: leva o foco ao Confirmar e o devolve ao Salvar no Voltar', async () => {
    renderModal(card);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    const confirm = await screen.findByRole('button', { name: 'Confirmar' });
    expect(confirm).toHaveFocus();
    expect(confirm).toHaveAccessibleDescription('Confirma salvar os dados da carta?');
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus();
  });

  it('R6: na edição, mantém o álbum da carta mesmo fora das opções carregadas', () => {
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(pageOf([]));
    renderModal(card);

    expect(screen.getByLabelText('Álbum')).toHaveValue(album.id);
    expect(screen.getByRole('option', { name: album.title })).toBeInTheDocument();
  });

  it('R12: só libera o Salvar depois que a imagem termina de subir', async () => {
    let finishUpload: (image: { key: string; url: string }) => void = () => undefined;
    vi.mocked(catalogApi.uploadImage).mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    renderModal(card);
    const image = new File(['imagem'], 'frente.webp', { type: 'image/webp' });
    await userEvent.upload(screen.getByLabelText('Imagem da frente'), image);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    finishUpload({ key: 'cards/nova.webp', url: FRONT_IMAGE_URL });
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled());
  });
});
