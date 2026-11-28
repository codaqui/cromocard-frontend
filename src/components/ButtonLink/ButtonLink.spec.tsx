import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ButtonLink } from './ButtonLink';

function renderLink(variant?: 'primary' | 'secondary') {
  render(
    <MemoryRouter>
      <ButtonLink to="/destino" variant={variant}>
        Ir
      </ButtonLink>
    </MemoryRouter>,
  );
  return screen.getByRole('link', { name: 'Ir' });
}

describe('ButtonLink', () => {
  it('é um link para o destino, com o visual do botão primário por padrão', () => {
    const link = renderLink();

    expect(link).toHaveAttribute('href', '/destino');
    expect(link).toHaveAttribute('data-variant', 'primary');
  });

  it('usa a variante pedida', () => {
    expect(renderLink('secondary')).toHaveAttribute('data-variant', 'secondary');
  });
});
