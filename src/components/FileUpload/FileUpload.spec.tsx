import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button/Button';
import { z } from '@/lib/zod';

import { FileUpload } from './FileUpload';

const schema = z.object({
  image: z.custom<FileList>((files) => files instanceof FileList && files.length > 0, {
    error: 'Escolha uma imagem',
  }),
});

function ImageForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <FileUpload
        label="Imagem da carta"
        hint="PNG, JPG ou WEBP até 4 MB"
        accept="image/png,image/jpeg,image/webp"
        error={formState.errors.image?.message}
        {...register('image')}
      />
      <Button type="submit">Enviar</Button>
    </form>
  );
}

const cardImage = () => new File(['imagem'], 'charizard.png', { type: 'image/png' });

describe('FileUpload', () => {
  it('mostra o nome do arquivo e envia o arquivo pelo React Hook Form', async () => {
    const onSubmit = vi.fn();
    render(<ImageForm onSubmit={onSubmit} />);

    await userEvent.upload(screen.getByLabelText('Imagem da carta'), cardImage());
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByText('charizard.png')).toBeInTheDocument();
    const [[values]] = onSubmit.mock.calls as [[{ image: FileList }]];
    expect(values.image[0]?.name).toBe('charizard.png');
  });

  it('mostra a dica e o erro quando nenhum arquivo foi escolhido', async () => {
    render(<ImageForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Escolha uma imagem')).toBeInTheDocument();
    expect(screen.getByText('Nenhum arquivo escolhido')).toBeInTheDocument();
    expect(screen.getByLabelText('Imagem da carta')).toHaveAccessibleDescription(
      'PNG, JPG ou WEBP até 4 MB Escolha uma imagem',
    );
  });
});
