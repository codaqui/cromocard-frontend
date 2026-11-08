import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ImageUploadField } from './ImageUploadField';

const IMAGE_URL = 'http://localhost:3000/uploads/albums/capa.png';

function renderField(props: { value: string; removable?: boolean }) {
  const onChange = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ImageUploadField label="Capa (opcional)" folder="albums" onChange={onChange} {...props} />
    </QueryClientProvider>,
  );
  return onChange;
}

describe('ImageUploadField', () => {
  it('remove a imagem de um campo opcional', async () => {
    const onChange = renderField({ value: IMAGE_URL, removable: true });

    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('não oferece remover num campo obrigatório nem sem imagem', () => {
    renderField({ value: IMAGE_URL });
    renderField({ value: '', removable: true });

    expect(screen.queryByRole('button', { name: 'Remover imagem' })).not.toBeInTheDocument();
  });
});
