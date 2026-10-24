import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button/Button';
import { z } from '@/lib/zod';

import { Checkbox } from './Checkbox';

const schema = z.object({
  enabled: z.boolean().refine(Boolean, { error: 'Confirme para continuar' }),
});

function BannerForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { enabled: false },
  });

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Checkbox
        label="Exibir banner"
        error={formState.errors.enabled?.message}
        {...register('enabled')}
      />
      <Button type="submit">Salvar</Button>
    </form>
  );
}

describe('Checkbox', () => {
  it('envia o valor marcado pelo React Hook Form', async () => {
    const onSubmit = vi.fn();
    render(<BannerForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByLabelText('Exibir banner'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ enabled: true }, expect.anything());
  });

  it('mostra o erro ligado à caixa de seleção', async () => {
    render(<BannerForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Confirme para continuar')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Exibir banner' })).toHaveAccessibleDescription(
      'Confirme para continuar',
    );
  });
});
