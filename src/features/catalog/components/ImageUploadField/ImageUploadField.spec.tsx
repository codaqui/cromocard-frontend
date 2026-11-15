import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { catalogApi } from '../../catalog.api';
import type * as CatalogImage from '../../catalog.image';
import { CARD_IMAGE_MIN_SIZE, readImageSize, releasePreviewUrl } from '../../catalog.image';
import { ImageUploadField, type ImageUploadFieldProps } from './ImageUploadField';

vi.mock('../../catalog.api', () => ({ catalogApi: { uploadImage: vi.fn() } }));

vi.mock('../../catalog.image', async (importOriginal) => ({
  ...(await importOriginal<typeof CatalogImage>()),
  readImageSize: vi.fn(),
  localPreviewUrl: vi.fn(() => 'blob:previa-local'),
  releasePreviewUrl: vi.fn(),
}));

const IMAGE_URL = 'http://localhost:3000/uploads/albums/capa%20nova.png';
const UPLOADED_URL = 'http://localhost:3000/uploads/cards/frente.webp';
const onChange = vi.fn();

function renderField(props: Partial<ImageUploadFieldProps> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ImageUploadField
        label="Imagem da frente"
        folder="cards"
        value=""
        onChange={onChange}
        {...props}
      />
    </QueryClientProvider>,
  );
}

const imageFile = () => new File(['x'.repeat(2048)], 'charizard.webp', { type: 'image/webp' });

describe('ImageUploadField', () => {
  beforeEach(() => {
    onChange.mockReset();
    vi.mocked(catalogApi.uploadImage)
      .mockReset()
      .mockResolvedValue({ key: 'cards/frente.webp', url: UPLOADED_URL });
    vi.mocked(readImageSize).mockReset().mockResolvedValue({ width: 2400, height: 3360 });
  });

  it('R12: sem imagem, oferece escolher o arquivo e marca o campo obrigatório', () => {
    renderField({ required: true });

    expect(screen.getByRole('group', { name: 'Imagem da frente *' })).toBeInTheDocument();
    expect(screen.getByLabelText('Escolher imagem da frente')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remover imagem da frente' }),
    ).not.toBeInTheDocument();
  });

  it('R12: envia a imagem que atende ao mínimo e mostra que o tamanho foi atendido', async () => {
    renderField({ minSize: CARD_IMAGE_MIN_SIZE });
    await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), imageFile());

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(UPLOADED_URL));
    expect(catalogApi.uploadImage).toHaveBeenCalledWith('cards', expect.any(File));
    expect(screen.getByText('Tamanho mínimo atendido')).toBeInTheDocument();
  });

  it('R12: abaixo do mínimo, não envia e explica o tamanho exigido', async () => {
    vi.mocked(readImageSize).mockResolvedValue({ width: 800, height: 1000 });
    renderField({ minSize: CARD_IMAGE_MIN_SIZE });
    await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), imageFile());

    expect(await screen.findByText('Abaixo do mínimo')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A imagem precisa ter no mínimo 1200×1600 px.',
    );
    expect(catalogApi.uploadImage).not.toHaveBeenCalled();
  });

  it('R12: sem tamanho mínimo, envia e mostra o tamanho do arquivo, sem o selo do mínimo', async () => {
    renderField({ label: 'Capa do álbum', folder: 'albums' });
    await userEvent.upload(screen.getByLabelText('Escolher capa do álbum'), imageFile());

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(UPLOADED_URL));
    expect(screen.queryByText('Tamanho mínimo atendido')).not.toBeInTheDocument();
  });

  it('R12: abaixo do mínimo, mostra a prévia local em vermelho e remover limpa a escolha', async () => {
    vi.mocked(readImageSize).mockResolvedValue({ width: 800, height: 1000 });
    const view = renderField({ minSize: CARD_IMAGE_MIN_SIZE });
    await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), imageFile());

    expect(await screen.findByRole('img', { name: 'Prévia: Imagem da frente' })).toHaveAttribute(
      'src',
      'blob:previa-local',
    );
    expect(screen.getByText('2 KB • 800 × 1000 px (mínimo 1200×1600 px)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem da frente' }));

    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByText('Abaixo do mínimo')).not.toBeInTheDocument();
    expect(releasePreviewUrl).toHaveBeenCalledWith('blob:previa-local');
    view.unmount();
  });

  it('R12: aceita a imagem arrastada para a área de envio', async () => {
    renderField({ label: 'Capa do álbum', folder: 'albums' });
    const dropzone = screen.getByText('Arraste a imagem ou clique para escolher');

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [imageFile()] } });

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(UPLOADED_URL));
  });

  it('R12: o verso vazio mostra a linha com a nuvem, e por ela escolhe o arquivo', async () => {
    renderField({ label: 'Imagem do verso', compact: true });

    expect(screen.getByText('Nenhuma imagem enviada')).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText('Escolher imagem do verso'), imageFile());

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(UPLOADED_URL));
  });

  it('R12: com imagem salva, mostra a prévia com o nome do arquivo e permite remover', async () => {
    renderField({ label: 'Capa do álbum', folder: 'albums', value: IMAGE_URL });

    expect(screen.getByRole('img', { name: 'Prévia: Capa do álbum' })).toHaveAttribute(
      'src',
      IMAGE_URL,
    );
    expect(screen.getByText('capa nova.png')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover capa do álbum' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('R12: substituir mostra o nome, o tamanho e as dimensões do arquivo novo', async () => {
    renderField({ value: IMAGE_URL, minSize: CARD_IMAGE_MIN_SIZE });
    await userEvent.upload(screen.getByLabelText('Substituir imagem da frente'), imageFile());

    expect(await screen.findByText('charizard.webp')).toBeInTheDocument();
    expect(screen.getByText('2 KB • 2400 × 3360 px')).toBeInTheDocument();
  });

  it('R12: mostra o erro do envio e o erro de validação do formulário', async () => {
    vi.mocked(catalogApi.uploadImage).mockRejectedValue(
      new ApiError({ status: 413, code: 'FILE_TOO_LARGE', message: 'Arquivo acima de 4 MB' }),
    );
    renderField({ error: 'Envie a imagem.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Envie a imagem.');

    await userEvent.upload(screen.getByLabelText('Escolher imagem da frente'), imageFile());

    expect(await screen.findByText('Arquivo acima de 4 MB')).toBeInTheDocument();
  });

  it('R12: a versão compacta, como o verso no Figma, também mostra a prévia', async () => {
    renderField({ label: 'Imagem do verso', value: UPLOADED_URL, compact: true });

    expect(screen.getByRole('img', { name: 'Prévia: Imagem do verso' })).toBeInTheDocument();
    expect(screen.getByText('frente.webp')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem do verso' }));
    expect(onChange).toHaveBeenCalledWith('');
    await userEvent.upload(screen.getByLabelText('Substituir imagem do verso'), imageFile());
    await vi.waitFor(() => expect(catalogApi.uploadImage).toHaveBeenCalled());
  });

  it('R12: arrastar uma imagem para a prévia ou para a linha do verso também substitui', async () => {
    renderField({ label: 'Imagem do verso', value: UPLOADED_URL, compact: true });
    const row = screen.getByText('frente.webp');

    fireEvent.dragOver(row);
    fireEvent.drop(row, { dataTransfer: { files: [imageFile()] } });

    await vi.waitFor(() => expect(catalogApi.uploadImage).toHaveBeenCalled());
  });
});
