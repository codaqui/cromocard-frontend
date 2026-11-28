import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { HelpCenterPage } from './HelpCenterPage';

const routes = [
  { path: paths.help, element: <HelpCenterPage /> },
  { path: paths.howItWorks, element: <h1>Como funciona</h1> },
];

const renderPage = () => renderWithProviders({ routes, initialPath: paths.help });

const questionList = () => screen.getByRole('list', { name: 'Perguntas frequentes' });
const questionsShown = () =>
  within(questionList())
    .getAllByRole('button')
    .map((button) => button.textContent);
const topic = (name: string) => screen.getByRole('button', { name, pressed: true });

describe('HelpCenterPage', () => {
  it('CA1: abre com Primeiros passos selecionado e as perguntas fechadas', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Como podemos ajudar?' })).toBeInTheDocument();
    expect(topic('Primeiros passos')).toBeInTheDocument();
    expect(questionsShown()).toHaveLength(5);
    const question = screen.getByRole('button', { name: 'Como o frete é calculado?' });
    expect(question).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(question);

    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/calculado pela Melhor Envio/)).toBeInTheDocument();
  });

  it('CA2: Pagamentos mostra só as perguntas dele e fica destacado', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Pagamentos' }));

    expect(topic('Pagamentos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primeiros passos', pressed: false })).toBeVisible();
    expect(questionsShown()).toEqual([
      'Quais formas de pagamento posso usar?',
      'Quando o vendedor recebe o dinheiro?',
      'Posso pedir o dinheiro de volta?',
      'O boleto demora para ser confirmado?',
    ]);
  });

  it('CA3 e CA14: a busca procura em todos os tópicos e tira o destaque do tópico', async () => {
    renderPage();

    await userEvent.type(screen.getByRole('searchbox'), 'frete');

    expect(questionsShown()).toEqual(['Como o frete é calculado?']);
    expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument();

    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'bloquear');
    expect(questionsShown()).toEqual(['Posso bloquear alguém no chat?']);
  });

  it('CA14: sem resultado, avisa e mantém o cartão do suporte', async () => {
    renderPage();

    await userEvent.type(screen.getByRole('searchbox'), 'xyz');

    expect(
      screen.getByRole('heading', { name: 'Nenhuma pergunta encontrada para “xyz”.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enviar e-mail' })).toBeInTheDocument();
  });

  it('CA14: escolher um tópico limpa a busca', async () => {
    renderPage();
    await userEvent.type(screen.getByRole('searchbox'), 'xyz');

    await userEvent.click(screen.getByRole('button', { name: 'Álbuns digitais' }));

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(questionsShown()).toHaveLength(4);
  });

  it('CA15: duas perguntas ficam abertas e clicar de novo recolhe', async () => {
    renderPage();
    const first = screen.getByRole('button', { name: 'Como o frete é calculado?' });
    const second = screen.getByRole('button', { name: 'Como sei se um vendedor é confiável?' });

    await userEvent.click(first);
    await userEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('CA16: o link útil da resposta leva ao Como funciona', async () => {
    renderPage();

    await userEvent.click(
      screen.getByRole('button', { name: 'Preciso pagar para criar conta ou anunciar?' }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'Ver como funciona' }));

    expect(await screen.findByRole('heading', { name: 'Como funciona' })).toBeInTheDocument();
  });
});
