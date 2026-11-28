import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('deixa o texto para o leitor de tela', () => {
    render(
      <button type="button">
        ✓<VisuallyHidden>Verificado</VisuallyHidden>
      </button>,
    );

    expect(screen.getByRole('button', { name: '✓Verificado' })).toBeInTheDocument();
  });
});
