import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { communityAdminApi } from '../../community-admin.api';
import type { AdminGroupSummary, GroupMessageReport } from '../../community-admin.types';
import { CommunityAdminPage } from './CommunityAdminPage';

vi.mock('../../community-admin.api', () => ({
  communityAdminApi: {
    getSummary: vi.fn(),
    listGroups: vi.fn(),
    listGroupMessageReports: vi.fn(),
    warnGroup: vi.fn(),
    suspendGroup: vi.fn(),
    reactivateGroup: vi.fn(),
    deleteGroup: vi.fn(),
    dismissReport: vi.fn(),
    removeReportedMessage: vi.fn(),
    removeAndWarn: vi.fn(),
  },
}));

const { usersApiMock } = vi.hoisted(() => ({
  usersApiMock: { warn: vi.fn(), suspend: vi.fn(), block: vi.fn() },
}));

vi.mock('@/features/users/users.api', () => ({ usersApi: usersApiMock }));

const pageOf = <T,>(data: T[]) => ({
  data,
  meta: { page: 1, pageSize: 10, total: data.length, totalPages: 1 },
});

const groups: AdminGroupSummary[] = [
  {
    id: '0199a000-0000-7000-8000-000000009821',
    name: 'Leilões Noturnos Pokémon SP',
    accessType: 'OPEN',
    status: 'ACTIVE',
    membersCount: 3840,
    creatorName: 'Ana Colecionadora',
  },
  {
    id: '0199a000-0000-7000-8000-000000001049',
    name: 'Vendas Paralelas',
    accessType: 'CLOSED',
    status: 'SUSPENDED',
    membersCount: 1,
    creatorName: 'Bruno',
  },
  {
    id: '0199a000-0000-7000-8000-000000004412',
    name: 'Trocas Diretas MTG',
    accessType: 'CLOSED',
    status: 'WARNED',
    membersCount: 1250,
    creatorName: 'Urza',
  },
];

const report: GroupMessageReport = {
  id: 'report-1',
  reason: 'Link malicioso',
  description: 'Tentativa de roubar credenciais',
  reporterName: 'Carla',
  message: {
    id: 'message-1',
    content: 'Resgate boosters grátis neste link',
    createdAt: '2026-11-07T18:01:44Z',
    authorId: 'author-1',
    authorName: 'Diego',
    groupName: 'Leilões Noturnos Pokémon SP',
    authorAccountAgeDays: 10,
    authorWarnings: 0,
    reportersCount: 1,
  },
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <CommunityAdminPage />
    </QueryClientProvider>,
  );
}

describe('CommunityAdminPage', () => {
  beforeEach(() => {
    vi.mocked(communityAdminApi.getSummary)
      .mockReset()
      .mockResolvedValue({ activeGroups: 4120, messagesLast7Days: 28450, pendingReports: 3 });
    vi.mocked(communityAdminApi.listGroups).mockReset().mockResolvedValue(pageOf(groups));
    vi.mocked(communityAdminApi.listGroupMessageReports)
      .mockReset()
      .mockResolvedValue(pageOf([report]));
    vi.mocked(communityAdminApi.warnGroup).mockReset();
    vi.mocked(communityAdminApi.removeAndWarn).mockReset();
    usersApiMock.warn.mockReset();
  });

  it('mostra os indicadores da comunidade', async () => {
    renderPage();

    expect(await screen.findByText('4.120')).toBeInTheDocument();
    expect(screen.getByText('28.450')).toBeInTheDocument();
    expect(screen.getByText('3 Pendentes')).toBeInTheDocument();
  });

  it('CA1: lista os grupos com nome, membros, status e ações', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Grupos da comunidade' });
    const [active, suspended] = within(table).getAllByRole('row').slice(1);
    expect(active).toHaveTextContent('Leilões Noturnos Pokémon SP');
    expect(active).toHaveTextContent('3.840 membros');
    expect(active).toHaveTextContent('Ativo');
    expect(within(active!).getByRole('button', { name: /^Suspender/ })).toBeInTheDocument();
    expect(suspended).toHaveTextContent('Suspenso');
    expect(
      within(suspended!).getByRole('button', { name: 'Reativar Vendas Paralelas' }),
    ).toBeInTheDocument();
  });

  it('CA8: grupo advertido mostra o selo e os botões Reativar e Suspender', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Grupos da comunidade' });
    const warnedRow = within(table).getByRole('row', { name: /Trocas Diretas MTG/ });

    expect(warnedRow).toHaveTextContent('Advertido');
    expect(within(warnedRow).getByRole('button', { name: /^Reativar/ })).toBeInTheDocument();
    expect(within(warnedRow).getByRole('button', { name: /^Suspender/ })).toBeInTheDocument();
    expect(within(warnedRow).queryByRole('button', { name: /^Advertir/ })).not.toBeInTheDocument();
  });

  it('CA1: busca pelo nome e filtra pelo status, voltando para a primeira página', async () => {
    renderPage();
    await screen.findByRole('table', { name: 'Grupos da comunidade' });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar grupo pelo nome' }), 'copa');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filtrar por status' }), [
      'SUSPENDED',
    ]);

    await vi.waitFor(() =>
      expect(communityAdminApi.listGroups).toHaveBeenLastCalledWith({
        q: 'copa',
        status: 'SUSPENDED',
        page: 1,
        pageSize: 10,
      }),
    );
  });

  it('CA5: mostra a denúncia com o autor, o grupo, o texto, o motivo e quem denunciou', async () => {
    renderPage();

    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });
    expect(card).toHaveTextContent('Leilões Noturnos Pokémon SP');
    expect(card).toHaveTextContent('Resgate boosters grátis neste link');
    expect(card).toHaveTextContent('Link malicioso');
    expect(card).toHaveTextContent('Carla');
    expect(card).toHaveTextContent('Tentativa de roubar credenciais');
    expect(screen.getByText('1 Caso Pendente')).toBeInTheDocument();
    expect(communityAdminApi.listGroupMessageReports).toHaveBeenCalledWith({
      status: 'PENDING',
      severity: 'CRITICAL',
      page: 1,
      pageSize: 10,
    });
  });

  it('não mostra card para denúncia cuja mensagem já foi excluída', async () => {
    vi.mocked(communityAdminApi.listGroupMessageReports).mockResolvedValue(
      pageOf([{ ...report, message: null }]),
    );

    renderPage();
    await screen.findByText('1 Caso Pendente');

    expect(
      screen.queryByRole('article', { name: 'Denúncia contra Diego' }),
    ).not.toBeInTheDocument();
  });

  it('mostra os estados vazios da lista de grupos e da fila', async () => {
    vi.mocked(communityAdminApi.listGroups).mockResolvedValue(pageOf([]));
    vi.mocked(communityAdminApi.listGroupMessageReports).mockResolvedValue(pageOf([]));

    renderPage();

    expect(await screen.findByText('Nenhum grupo encontrado')).toBeInTheDocument();
    expect(await screen.findByText('Nenhuma denúncia pendente')).toBeInTheDocument();
  });

  it('mostra o carregando e, se a API falhar, o erro com tentar de novo', async () => {
    vi.mocked(communityAdminApi.listGroups).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Falha ao carregar os grupos' }),
    );

    renderPage();

    expect(screen.getByText('Carregando os grupos…')).toBeInTheDocument();
    expect(await screen.findByText('Falha ao carregar os grupos')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Tentar de novo' })).toHaveLength(1);
  });
  it('mostra o erro da fila de moderação e tenta de novo', async () => {
    vi.mocked(communityAdminApi.listGroupMessageReports).mockImplementation((params) =>
      params.pageSize === 10
        ? Promise.reject(
            new ApiError({
              status: 500,
              code: 'INTERNAL_ERROR',
              message: 'Falha ao carregar a fila',
            }),
          )
        : Promise.resolve(pageOf([report])),
    );

    renderPage();

    expect(await screen.findByText('Falha ao carregar a fila')).toBeInTheDocument();
    vi.mocked(communityAdminApi.listGroupMessageReports).mockResolvedValue(pageOf([report]));
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(
      await screen.findByText('Resgate boosters grátis neste link', { exact: false }),
    ).toBeInTheDocument();
  });
  it('pagina a fila de moderação', async () => {
    vi.mocked(communityAdminApi.listGroupMessageReports).mockResolvedValue({
      data: [report],
      meta: { page: 1, pageSize: 10, total: 11, totalPages: 2 },
    });

    renderPage();
    await screen.findByText('11 Casos Pendentes');

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    await vi.waitFor(() =>
      expect(communityAdminApi.listGroupMessageReports).toHaveBeenLastCalledWith({
        status: 'PENDING',
        severity: 'CRITICAL',
        page: 2,
        pageSize: 10,
      }),
    );
  });
  it('CA2: suspende pelo diálogo, mostra a mensagem e recarrega a lista', async () => {
    vi.mocked(communityAdminApi.suspendGroup).mockResolvedValue({
      ...groups[0]!,
      status: 'SUSPENDED',
      description: null,
      coverImageUrl: null,
      createdAt: '2026-10-01T12:00:00Z',
    });
    renderPage();
    const table = await screen.findByRole('table', { name: 'Grupos da comunidade' });
    const [active] = within(table).getAllByRole('row').slice(1);

    await userEvent.click(within(active!).getByRole('button', { name: /^Suspender/ }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Spam repetido no grupo');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Suspender Grupo' }));

    expect(await screen.findByText('Grupo suspenso com sucesso.')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await vi.waitFor(() => expect(communityAdminApi.listGroups).toHaveBeenCalledTimes(2));
  });
  it('CA7: dispensa a denúncia pelo diálogo, mostra a mensagem e recarrega a fila', async () => {
    vi.mocked(communityAdminApi.dismissReport).mockResolvedValue({
      id: report.id,
      status: 'DISMISSED',
    });
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(within(card).getByRole('button', { name: 'Dispensar Denúncia' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Mensagem sem problema');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Dispensar Denúncia' }));

    expect(await screen.findByText('Denúncia dispensada com sucesso.')).toBeInTheDocument();
    expect(vi.mocked(communityAdminApi.dismissReport).mock.calls[0]?.[0]).toEqual({
      id: report.id,
      reason: 'Mensagem sem problema',
    });
    await vi.waitFor(() => {
      const mainListCalls = vi
        .mocked(communityAdminApi.listGroupMessageReports)
        .mock.calls.filter(([params]) => params.pageSize === 10);
      expect(mainListCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
  it('CA6: remove a mensagem denunciada pelo diálogo, mostra a mensagem e recarrega a fila', async () => {
    vi.mocked(communityAdminApi.removeReportedMessage).mockResolvedValue({
      id: report.id,
      status: 'RESOLVED',
    });
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(within(card).getByRole('button', { name: 'Remover Mensagem' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Link de phishing');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Remover Mensagem' }));

    expect(await screen.findByText('Mensagem removida e denúncia resolvida.')).toBeInTheDocument();
    expect(vi.mocked(communityAdminApi.removeReportedMessage).mock.calls[0]?.[0]).toEqual({
      id: report.id,
      reason: 'Link de phishing',
    });
  });
  it('mostra o erro dos indicadores e tenta de novo', async () => {
    vi.mocked(communityAdminApi.getSummary).mockRejectedValueOnce(
      new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Falha nos indicadores' }),
    );
    vi.mocked(communityAdminApi.getSummary).mockResolvedValue({
      activeGroups: 3,
      messagesLast7Days: 10,
      pendingReports: 2,
    });

    renderPage();

    expect(await screen.findByText('Falha nos indicadores')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('2 Pendentes')).toBeInTheDocument();
  });

  it('mostra "1 Pendente" no singular', async () => {
    vi.mocked(communityAdminApi.getSummary).mockResolvedValue({
      activeGroups: 1,
      messagesLast7Days: 1,
      pendingReports: 1,
    });

    renderPage();

    expect(await screen.findByText('1 Pendente')).toBeInTheDocument();
  });

  it('cancelar o diálogo de moderação não chama nenhuma API de decisão', async () => {
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(within(card).getByRole('button', { name: 'Dispensar Denúncia' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar e Manter na Fila' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(communityAdminApi.dismissReport).not.toHaveBeenCalled();
  });

  it('fecha o aviso de sucesso pelo botão de fechar', async () => {
    vi.mocked(communityAdminApi.dismissReport).mockResolvedValue({
      id: report.id,
      status: 'DISMISSED',
    });
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });
    await userEvent.click(within(card).getByRole('button', { name: 'Dispensar Denúncia' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Mensagem sem problema');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Dispensar Denúncia' }));
    await screen.findByText('Denúncia dispensada com sucesso.');

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByText('Denúncia dispensada com sucesso.')).not.toBeInTheDocument();
  });

  it('CA8: advertir o grupo ativo mostra o selo Advertido', async () => {
    vi.mocked(communityAdminApi.warnGroup).mockResolvedValue({
      ...groups[0]!,
      status: 'WARNED',
      description: null,
      coverImageUrl: null,
      createdAt: '2026-10-01T12:00:00Z',
    });
    renderPage();
    const table = await screen.findByRole('table', { name: 'Grupos da comunidade' });
    const [active] = within(table).getAllByRole('row').slice(1);

    await userEvent.click(within(active!).getByRole('button', { name: /^Advertir/ }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Spam repetido no grupo');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Advertir Grupo' }));

    expect(await screen.findByText('Grupo advertido com sucesso.')).toBeInTheDocument();
    expect(vi.mocked(communityAdminApi.warnGroup).mock.calls[0]?.[0]).toEqual({
      id: groups[0]!.id,
      reason: 'Spam repetido no grupo',
    });
  });

  it('R8: remove a mensagem e adverte o autor pelo diálogo de justificativa', async () => {
    vi.mocked(communityAdminApi.removeAndWarn).mockResolvedValue({
      id: report.id,
      status: 'RESOLVED',
    });
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(
      within(card).getByRole('button', { name: 'Remover Mensagem & Advertir Usuário' }),
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), 'Ofensas repetidas');
    await userEvent.click(screen.getByRole('button', { name: 'Sim, Remover e Advertir' }));

    expect(await screen.findByText('Mensagem removida e autor advertido.')).toBeInTheDocument();
    expect(vi.mocked(communityAdminApi.removeAndWarn).mock.calls[0]?.[0]).toEqual({
      id: report.id,
      reason: 'Ofensas repetidas',
    });
  });

  it('R14: mostra a idade da conta, as advertências do autor e quem denunciou', async () => {
    vi.mocked(communityAdminApi.listGroupMessageReports).mockResolvedValue(
      pageOf([
        {
          ...report,
          message: {
            ...report.message!,
            authorAccountAgeDays: 730,
            authorWarnings: 2,
            reportersCount: 3,
          },
        },
      ]),
    );
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    expect(within(card).getByText('Conta criada há 2 anos')).toBeInTheDocument();
    expect(within(card).getByText('2 advertências prévias')).toBeInTheDocument();
    expect(within(card).getByText(/Carla e outros 2 membros/)).toBeInTheDocument();
  });

  it('R13: filtra a fila por gravidade', async () => {
    renderPage();
    await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(screen.getByRole('button', { name: /^Spam/ }));

    await vi.waitFor(() =>
      expect(communityAdminApi.listGroupMessageReports).toHaveBeenLastCalledWith({
        status: 'PENDING',
        severity: 'SPAM',
        page: 1,
        pageSize: 10,
      }),
    );
  });

  it('R2: aplica sanção ao autor pela fila, com o SanctionDialog da página do usuário', async () => {
    usersApiMock.warn.mockResolvedValue({ warningsCount: 1 });
    renderPage();
    const card = await screen.findByRole('article', { name: 'Denúncia contra Diego' });

    await userEvent.click(within(card).getByRole('button', { name: 'Aplicar sanção ao autor' }));
    const dialog = screen.getByRole('dialog', { name: 'Aplicar sanção' });
    expect(within(dialog).getByText('Diego • 0 advertências anteriores')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('radio', { name: /Advertir/ }));
    await userEvent.type(
      within(dialog).getByLabelText('Justificativa (obrigatória)'),
      'Mensagens ofensivas no chat do grupo',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Aplicar sanção' }));

    expect(usersApiMock.warn).toHaveBeenCalledWith('author-1', {
      reason: 'Mensagens ofensivas no chat do grupo',
      reportId: report.id,
    });
    expect(await screen.findByText('Sanção aplicada ao autor da mensagem.')).toBeInTheDocument();
  });
});
