import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { listingsApi } from '../../listings.api';
import { ListingPhotosField } from './ListingPhotosField';

vi.mock('../../listings.api', () => ({ listingsApi: { uploadPhoto: vi.fn() } }));

const onChange = vi.fn();
const urlOf = (name: string) => `http://localhost:3000/uploads/listings/${name}`;
const png = (name: string, bytes = 1024) =>
  new File(['x'.repeat(bytes)], name, { type: 'image/png' });

function Field({ initial }: { initial: string[] }) {
  const [photos, setPhotos] = useState(initial);
  const change = (value: string[]) => {
    onChange(value);
    setPhotos(value);
  };
  return <ListingPhotosField value={photos} onChange={change} />;
}

function renderField(initial: string[] = []) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Field initial={initial} />
    </QueryClientProvider>,
  );
}

describe('ListingPhotosField', () => {
  beforeEach(() => {
    onChange.mockReset();
    vi.mocked(listingsApi.uploadPhoto)
      .mockReset()
      .mockImplementation((file) => Promise.resolve({ key: file.name, url: urlOf(file.name) }));
  });

  it('R8: começa com os 2 espaços do frame e envia a foto frontal', async () => {
    renderField();
    expect(screen.getAllByLabelText(/^Enviar/)).toHaveLength(2);

    await userEvent.upload(screen.getByLabelText('Enviar Foto Frontal'), png('frente.png'));

    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith([urlOf('frente.png')]));
    expect(screen.getByText('Foto 1 Carregada')).toBeInTheDocument();
  });

  it('R3: com os 2 espaços preenchidos, abre mais espaços até 4', () => {
    const view = renderField([urlOf('a.png'), urlOf('b.png')]);
    expect(screen.getByLabelText('Enviar Foto 3')).toBeInTheDocument();
    view.unmount();

    renderField([urlOf('a.png'), urlOf('b.png'), urlOf('c.png'), urlOf('d.png')]);

    expect(screen.getAllByLabelText(/^Enviar/)).toHaveLength(4);
  });

  it('CA6: recusa PDF e arquivo maior que 4 MB sem enviar', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderField();
    const front = screen.getByLabelText('Enviar Foto Frontal');

    await user.upload(front, new File(['%PDF'], 'carta.pdf', { type: 'application/pdf' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Envie uma imagem PNG, JPG ou WEBP de até 4 MB.',
    );
    await userEvent.upload(front, png('grande.png', 5 * 1024 * 1024));

    expect(listingsApi.uploadPhoto).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('R8: remover tira a foto e mantém a ordem das outras', async () => {
    renderField([urlOf('a.png'), urlOf('b.png')]);

    await userEvent.click(screen.getByRole('button', { name: 'Remover Foto Frontal' }));

    expect(onChange).toHaveBeenCalledWith([urlOf('b.png')]);
  });

  it('R8: aceita a foto arrastada e mostra o erro do envio', async () => {
    vi.mocked(listingsApi.uploadPhoto).mockRejectedValueOnce(
      new ApiError({ status: 413, code: 'FILE_TOO_LARGE', message: 'Arquivo acima de 4 MB' }),
    );
    renderField();
    const back = screen.getByText('Foto do Verso');

    fireEvent.dragOver(back);
    fireEvent.drop(back, { dataTransfer: { files: [png('verso.png')] } });

    expect(await screen.findByRole('alert')).toHaveTextContent('Arquivo acima de 4 MB');
  });

  it('R8: mostra o envio em andamento e ignora quando nenhum arquivo foi solto', async () => {
    vi.mocked(listingsApi.uploadPhoto).mockReturnValue(new Promise(() => undefined));
    renderField();
    fireEvent.drop(screen.getByText('Foto do Verso'), { dataTransfer: { files: [] } });
    expect(listingsApi.uploadPhoto).not.toHaveBeenCalled();

    await userEvent.upload(screen.getByLabelText('Enviar Foto Frontal'), png('frente.png'));

    expect(await screen.findByText('Enviando a foto…')).toBeInTheDocument();
  });
});
