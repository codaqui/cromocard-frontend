import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { http } from '@/lib/http';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { HowItWorksPage } from './HowItWorksPage';

const routes = [{ path: paths.howItWorks, element: <HowItWorksPage /> }];
const renderPage = () => renderWithProviders({ routes, initialPath: paths.howItWorks });

const stepTitles = () =>
  within(screen.getByRole('tabpanel'))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);

describe('HowItWorksPage', () => {
  it('CA6: abre em Quero comprar com os passos, as garantias e o Quanto custa', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Como a CromoCard funciona', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Quero comprar' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByText(
        'Compre e venda cartas colecionáveis com o pagamento protegido do começo ao fim.',
      ),
    ).toBeInTheDocument();
    expect(stepTitles().slice(0, 4)).toEqual([
      'Encontre a carta',
      'Pague com proteção',
      'Receba e confira',
      'Colecione',
    ]);
    expect(screen.getByRole('heading', { name: 'Suas garantias' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quanto custa?' })).toBeInTheDocument();
  });

  it('CA7: Quero vender mostra os passos do vendedor e Por que vender aqui', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('tab', { name: 'Quero vender' }));

    expect(screen.getByRole('tab', { name: 'Quero vender' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(stepTitles().slice(0, 4)).toEqual([
      'Crie a conta de vendedor',
      'Conecte a conta de recebimento',
      'Anuncie e envie',
      'Receba',
    ]);
    expect(screen.getByRole('heading', { name: 'Por que vender aqui' })).toBeInTheDocument();
    expect(screen.getByText(/receba com segurança/)).toBeInTheDocument();
  });

  it('CA9: monta o conteúdo sem chamar a API', () => {
    const get = vi.spyOn(http, 'get');
    const post = vi.spyOn(http, 'post');

    renderPage();

    expect(get).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });
});
