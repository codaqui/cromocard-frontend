import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('mostra o texto com o tom pedido', () => {
    render(<Badge tone="danger">Suspenso</Badge>);

    expect(screen.getByText('Suspenso')).toHaveAttribute('data-tone', 'danger');
  });

  it('usa o tom neutro por padrão', () => {
    render(<Badge>Pendente</Badge>);

    expect(screen.getByText('Pendente')).toHaveAttribute('data-tone', 'neutral');
  });
});
