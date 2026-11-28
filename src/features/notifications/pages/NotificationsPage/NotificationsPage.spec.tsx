import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { notificationsApi } from '../../notifications.api';
import { aNotification, countsOf, minutesAgo, pageOf } from '../../notifications.fixtures';
import { notificationsRoutes } from '../../notifications.routes';

vi.mock('../../notifications.api', () => ({
  notificationsApi: { list: vi.fn(), markAsRead: vi.fn() },
}));

const list = vi.mocked(notificationsApi.list);
const markAsRead = vi.mocked(notificationsApi.markAsRead);

const YESTERDAY = 24 * 60 + 30;

const message = aNotification({
  id: 'n-msg',
  title: '@fabio.tcg',
  type: 'NEW_MESSAGE',
  category: 'MESSAGES',
  referenceLink: null,
  createdAt: minutesAgo(5),
});
const catalog = aNotification({ id: 'n-cat', createdAt: minutesAgo(30) });
const platform = aNotification({
  id: 'n-global',
  title: 'Manutenção programada no sábado',
  type: 'GLOBAL',
  referenceLink: null,
  createdAt: minutesAgo(60),
});
const older = aNotification({
  id: 'n-old',
  title: 'Novas regras para vendedores',
  type: 'GLOBAL',
  referenceLink: null,
  isRead: true,
  createdAt: minutesAgo(YESTERDAY),
});

const fourCounts = countsOf({ ALL: 4, UNREAD: 3, MESSAGES: 1, PLATFORM: 3 });

function Destination() {
  const { pathname, state } = useLocation() as { pathname: string; state: unknown };
  return <p>{`Destino ${pathname} ${JSON.stringify(state)}`}</p>;
}

function renderPage() {
  renderWithProviders({
    routes: [...notificationsRoutes, { path: '*', element: <Destination /> }],
    initialPath: '/notificacoes',
  });
}

const item = (name: string) => screen.findByRole('article', { name });
const groupNamed = (name: string) => screen.findByRole('region', { name });

describe('NotificationsPage', () => {
  beforeEach(() => {
    list.mockResolvedValue(pageOf([message, catalog, platform, older], fourCounts));
    markAsRead.mockResolvedValue({ ...catalog, isRead: true });
  });

  it('CA1: lista da mais recente para a mais antiga, em HOJE e ANTERIORES, com as não lidas destacadas', async () => {
    renderPage();

    const today = await groupNamed('HOJE');
    const titles = within(today)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual([
      '@fabio.tcg',
      'Sua sugestão foi aprovada',
      'Manutenção programada no sábado',
    ]);
    expect(within(await groupNamed('ANTERIORES')).getByRole('article')).toHaveTextContent(
      'Novas regras para vendedores',
    );
    expect(screen.getAllByRole('img', { name: 'Não lida' })).toHaveLength(3);
    expect(screen.getByText('3 Não Lidas')).toBeInTheDocument();
    expect(list).toHaveBeenCalledWith({ filter: 'ALL', limit: 50, cursor: undefined });
  });

  it('CA2: a ação marca como lida, leva ao destino avisando que veio da notificação e recarrega as contagens', async () => {
    renderPage();

    await userEvent.click(
      within(await item('Sua sugestão foi aprovada')).getByRole('button', {
        name: 'Ver no Catálogo',
      }),
    );

    expect(markAsRead).toHaveBeenCalledWith('n-cat');
    expect(
      await screen.findByText('Destino /albuns/brasileirao {"fromNotification":true}'),
    ).toBeInTheDocument();
  });

  it('CA3: sem destino, marca como lida e continua na central', async () => {
    renderPage();

    await userEvent.click(
      within(await item('@fabio.tcg')).getByRole('button', { name: '@fabio.tcg' }),
    );

    expect(markAsRead).toHaveBeenCalledWith('n-msg');
    expect(screen.getByRole('heading', { name: 'Notificações & Favoritos' })).toBeInTheDocument();
    await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(2));
  });

  it('abrir uma notificação já lida não chama a API de novo', async () => {
    renderPage();

    await userEvent.click(
      within(await item('Novas regras para vendedores')).getByRole('button', {
        name: 'Novas regras para vendedores',
      }),
    );

    expect(markAsRead).not.toHaveBeenCalled();
  });

  it('CA20: o ✓ marca como lida sem sair, e o menu leva às preferências', async () => {
    renderPage();

    const target = await item('Sua sugestão foi aprovada');
    await userEvent.click(within(target).getByRole('button', { name: 'Marcar como lida' }));
    expect(markAsRead).toHaveBeenCalledWith('n-cat');
    expect(screen.queryByText(/Destino/)).not.toBeInTheDocument();

    await userEvent.click(within(target).getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Configurar este tipo de alerta' }));
    expect(await screen.findByText('Destino /configuracoes null')).toBeInTheDocument();
  });

  it('CA18: os filtros mostram as contagens e "Novas Mensagens" busca só as mensagens', async () => {
    renderPage();

    const filters = await screen.findByRole('group', { name: 'Filtrar notificações' });
    expect(await within(filters).findByRole('button', { name: 'Todas 4' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      within(filters).getByRole('button', { name: 'Avisos da Plataforma 3' }),
    ).toBeInTheDocument();

    list.mockResolvedValue(pageOf([message], fourCounts));
    await userEvent.click(within(filters).getByRole('button', { name: 'Novas Mensagens 1' }));

    expect(list).toHaveBeenLastCalledWith({ filter: 'MESSAGES', limit: 50, cursor: undefined });
    await vi.waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
  });

  it('CA17: "Carregar mais" busca a próxima página pelo cursor e some no fim', async () => {
    list.mockResolvedValueOnce(pageOf([message], fourCounts, 'n-msg'));
    list.mockResolvedValueOnce(pageOf([older], fourCounts));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Carregar mais' }));

    expect(await item('Novas regras para vendedores')).toBeInTheDocument();
    expect(list).toHaveBeenLastCalledWith({ filter: 'ALL', limit: 50, cursor: 'n-msg' });
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument();
  });

  it('CA22: com todas lidas, mostra "Tudo em dia!" e as lidas em ANTERIORES', async () => {
    const read = { ...platform, isRead: true };
    list.mockResolvedValue(pageOf([read, older], countsOf({ ALL: 2, PLATFORM: 2 })));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Tudo em dia!' })).toBeInTheDocument();
    expect(within(await groupNamed('ANTERIORES')).getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByRole('region', { name: 'HOJE' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Configurar alertas' })).toHaveAttribute(
      'href',
      '/configuracoes',
    );
  });

  it('CA4: sem nenhuma notificação, mostra "Nenhuma notificação encontrada"', async () => {
    list.mockResolvedValue(pageOf([], countsOf()));
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma notificação encontrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tudo em dia!')).not.toBeInTheDocument();
  });

  it('CA10: mostra o carregamento e, se a busca falha, o aviso de erro em vez da central vazia', async () => {
    let fail: (error: Error) => void = () => undefined;
    list.mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    renderPage();

    expect(await screen.findByRole('status')).toHaveTextContent('Carregando notificações…');
    fail(new Error('falhou'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as notificações. Tente de novo.',
    );
    expect(screen.queryByText('Nenhuma notificação encontrada')).not.toBeInTheDocument();
  });

  it('a aba "Meus Favoritos" leva à página em construção e "Marcar todas como lidas" fica para a CCD054', async () => {
    renderPage();

    expect(await screen.findByRole('link', { name: 'Meus Favoritos' })).toHaveAttribute(
      'href',
      '/favoritos',
    );
    expect(screen.getByRole('button', { name: 'Marcar todas como lidas' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Configurar Alertas' })).toHaveAttribute(
      'href',
      '/configuracoes',
    );
  });
});
