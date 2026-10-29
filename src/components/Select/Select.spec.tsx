import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button/Button';
import { z } from '@/lib/zod';

import { Select } from './Select';

const schema = z.object({ role: z.string().min(1, { error: 'Escolha o tipo' }) });

const roleOptions = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'ADMIN', label: 'Administrador' },
];

function RoleForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: '' },
  });

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Select
        label="Tipo"
        placeholder="Selecione"
        options={roleOptions}
        error={formState.errors.role?.message}
        {...register('role')}
      />
      <Button type="submit">Salvar</Button>
    </form>
  );
}

describe('Select', () => {
  it('envia a opção escolhida pelo React Hook Form', async () => {
    const onSubmit = vi.fn();
    render(<RoleForm onSubmit={onSubmit} />);

    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'Administrador');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ role: 'ADMIN' }, expect.anything());
  });

  it('mostra o erro ligado ao campo quando nada foi escolhido', async () => {
    render(<RoleForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    const select = screen.getByLabelText('Tipo');
    expect(await screen.findByText('Escolha o tipo')).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Escolha o tipo');
  });
});
