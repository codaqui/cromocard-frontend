import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { ImportErrorList } from './ImportErrorList';

describe('ImportErrorList', () => {
  it('R13: lista cada linha recusada com a coluna', () => {
    const error = new ApiError({
      status: 422,
      code: 'CSV_INVALID',
      message: 'O arquivo tem linhas com erro',
      details: [{ field: '12.rarity', message: '"Ultra" não existe em raridades' }],
    });
    render(<ImportErrorList error={error} />);

    expect(screen.getByRole('list', { name: 'Linhas com erro' })).toHaveTextContent(
      'Linha 12 · Raridade: "Ultra" não existe em raridades',
    );
  });

  it('R13: sem linhas para listar, não mostra nada', () => {
    const { container } = render(
      <>
        <ImportErrorList error={null} />
        <ImportErrorList error={new Error('Falha de rede')} />
        <ImportErrorList error={new ApiError({ status: 500, code: 'X', message: 'Erro' })} />
      </>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
