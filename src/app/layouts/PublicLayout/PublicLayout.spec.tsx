import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PublicLayout } from './PublicLayout';

describe('PublicLayout', () => {
  it('CCD003 R2: a Home oferece Cadastrar e Entrar', () => {
    renderWithProviders({
      routes: [{ path: paths.home, element: <PublicLayout /> }],
      initialPath: paths.home,
    });

    expect(screen.getByRole('link', { name: 'Cadastrar' })).toHaveAttribute('href', paths.register);
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', paths.login);
  });
});
