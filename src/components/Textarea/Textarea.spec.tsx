import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button/Button';
import { z } from '@/lib/zod';

import { Textarea } from './Textarea';

const schema = z.object({
  content: z.string().trim().min(3, { error: 'Escreva pelo menos 3 caracteres' }),
});

function ContentForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { content: '' },
  });

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Textarea
        label="Mensagem"
        hint="Até 500 caracteres"
        error={formState.errors.content?.message}
        {...register('content')}
      />
      <Button type="submit">Enviar</Button>
    </form>
  );
}

describe('Textarea', () => {
  it('envia o texto digitado pelo React Hook Form', async () => {
    const onSubmit = vi.fn();
    render(<ContentForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Mensagem'), 'Manutenção às 22h');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onSubmit).toHaveBeenCalledWith({ content: 'Manutenção às 22h' }, expect.anything());
  });

  it('mostra a dica e o erro como descrição do campo', async () => {
    render(<ContentForm onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Mensagem'), 'ok');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Escreva pelo menos 3 caracteres')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toHaveAccessibleDescription(
      'Até 500 caracteres Escreva pelo menos 3 caracteres',
    );
  });
});
