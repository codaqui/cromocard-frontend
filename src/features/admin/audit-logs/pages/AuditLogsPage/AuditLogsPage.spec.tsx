import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auditLogsApi } from '../../audit-logs.api';
import type { AuditLogDetail, AuditLogPage } from '../../audit-logs.types';
import { AuditLogsPage } from './AuditLogsPage';

vi.mock('../../audit-logs.api', () => ({
  auditLogsApi: { list: vi.fn(), getById: vi.fn() },
}));

const ADMIN_ID = '0193a0c4-7b2e-7c11-9a55-1f2e3d4c5b6a';
const OTHER_ADMIN_ID = '0193a0c4-7b2e-7c11-9a55-aaaaaaaaaaaa';
const GROUP_ID = '0193a0c4-7b2e-7c11-9a55-bbbbbbbbbbbb';

const page: AuditLogPage = {
  data: [
    {
      id: 'log-2',
      action: 'GROUP_DELETED',
      entityType: 'GROUP',
      entityId: GROUP_ID,
      reason: 'Grupo criado para burlar a custódia',
      admin: { id: ADMIN_ID, name: 'Carla Mendes' },
      createdAt: '2026-11-08T14:22:45.110Z',
    },
    {
      id: 'log-1',
      action: 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: null,
      reason: null,
      admin: { id: OTHER_ADMIN_ID, name: 'Moderador Excluído' },
      createdAt: '2026-11-07T17:48:12.892Z',
    },
  ],
  meta: { page: 1, pageSize: 10, total: 2, totalPages: 1, last30Days: 1284 },
};

const emptyPage: AuditLogPage = {
  data: [],
  meta: { page: 1, pageSize: 10, total: 0, totalPages: 0, last30Days: 1284 },
};

const detail: AuditLogDetail = {
  id: 'log-2',
  adminId: ADMIN_ID,
  admin: { id: ADMIN_ID, name: 'Carla Mendes' },
  action: 'GROUP_DELETED',
  entityType: 'GROUP',
  entityId: GROUP_ID,
  details: { reason: 'Grupo criado para burlar a custódia', members: 418 },
  createdAt: '2026-11-08T14:22:45.110Z',
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AuditLogsPage />
    </QueryClientProvider>,
  );
}

const lastListCall = () => vi.mocked(auditLogsApi.list).mock.lastCall?.[0];

describe('AuditLogsPage', () => {
  beforeEach(() => {
    vi.mocked(auditLogsApi.list).mockReset().mockResolvedValue(page);
    vi.mocked(auditLogsApi.getById).mockReset().mockResolvedValue(detail);
  });

  it('mostra o carregando enquanto busca os registros', () => {
    vi.mocked(auditLogsApi.list).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando a trilha de auditoria…');
  });

  it('CA1, CA5: lista quem fez, a ação, o alvo, o motivo e a data, inclusive de admin excluído', async () => {
    renderPage();

    const row = await screen.findByRole('row', { name: /Carla Mendes/ });
    expect(row).toHaveTextContent('2026-11-08 11:22:45');
    expect(row).toHaveTextContent('Excluiu Grupo');
    expect(row).toHaveTextContent('Grupo');
    expect(row).toHaveTextContent('Grupo criado para burlar a custódia');
    expect(screen.getByRole('row', { name: /Moderador Excluído/ })).toHaveTextContent(
      'Sem motivo registrado',
    );
    expect(screen.getByRole('region', { name: 'Ações registradas (30 dias)' })).toHaveTextContent(
      '1.284',
    );
  });

  it('CA2: filtra por tipo de ação, tipo de entidade e período', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });

    await userEvent.selectOptions(screen.getByLabelText('Tipo de ação executada'), 'GROUP_DELETED');
    await userEvent.selectOptions(screen.getByLabelText('Tipo de entidade'), 'GROUP');
    await userEvent.selectOptions(screen.getByLabelText('Período temporal / Data'), 'ALL');

    expect(lastListCall()).toEqual({
      action: 'GROUP_DELETED',
      entityType: 'GROUP',
      from: undefined,
      to: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('CA2: só filtra por admin com o ID completo e avisa enquanto ele está incompleto', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });
    const adminField = screen.getByLabelText('Moderador / Admin responsável');

    await userEvent.type(adminField, '0193a0c4');

    expect(screen.getByText('Informe o ID completo (UUID)')).toBeInTheDocument();
    expect(lastListCall()?.adminId).toBeUndefined();

    await userEvent.clear(adminField);
    await userEvent.type(adminField, ADMIN_ID);

    expect(lastListCall()?.adminId).toBe(ADMIN_ID);
  });

  it('CA2: clicar no nome do responsável filtra pelos registros dele', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Carla Mendes' }));

    expect(screen.getByLabelText('Moderador / Admin responsável')).toHaveValue(ADMIN_ID);
    expect(lastListCall()?.adminId).toBe(ADMIN_ID);
  });

  it('CA2: o filtro rápido de alterações de papel filtra por USER_ROLE_UPDATED', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });

    const chip = screen.getByRole('button', { name: 'Alterações de Papel' });
    await userEvent.click(chip);

    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(lastListCall()?.action).toBe('USER_ROLE_UPDATED');
  });

  it('CA3: abre os detalhes completos do registro', async () => {
    renderPage();
    const row = await screen.findByRole('row', { name: /Carla Mendes/ });

    await userEvent.click(within(row).getByRole('button', { name: 'Ver detalhes completos' }));

    const drawer = await screen.findByRole('dialog', { name: 'Detalhes do registro de auditoria' });
    expect(await within(drawer).findByText(/"members": 418/)).toBeInTheDocument();
    expect(within(drawer).getByText(GROUP_ID)).toBeInTheDocument();
    expect(auditLogsApi.getById).toHaveBeenCalledWith('log-2');
  });

  it('CA4: informa que nenhum registro foi encontrado', async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue(emptyPage);

    renderPage();

    expect(await screen.findByText('Nenhum registro encontrado')).toBeInTheDocument();
  });

  it('mostra o Extrair Logs desabilitado até a CCD102 (L2)', async () => {
    renderPage();

    expect(await screen.findByRole('button', { name: 'Extrair Logs' })).toBeDisabled();
  });

  it('mostra o erro e tenta de novo', async () => {
    vi.mocked(auditLogsApi.list).mockRejectedValueOnce(new Error('Falha de rede'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('row', { name: /Carla Mendes/ })).toBeInTheDocument();
  });

  it('CA2: volta a todas as ações e entidades ao escolher a opção vazia', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });
    const action = screen.getByLabelText('Tipo de ação executada');
    const entity = screen.getByLabelText('Tipo de entidade');

    await userEvent.selectOptions(action, 'GROUP_DELETED');
    await userEvent.selectOptions(entity, 'GROUP');
    await userEvent.selectOptions(action, '');
    await userEvent.selectOptions(entity, '');

    expect(lastListCall()?.action).toBeUndefined();
    expect(lastListCall()?.entityType).toBeUndefined();
  });

  it('CA2: filtra pelo ID do alvo e pelo intervalo personalizado, avisando a data invertida', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });

    await userEvent.type(screen.getByLabelText('Pesquisa por ID do alvo'), GROUP_ID);
    await userEvent.selectOptions(screen.getByLabelText('Período temporal / Data'), 'CUSTOM');
    const from = screen.getByLabelText('Data inicial');
    const to = screen.getByLabelText('Data final');
    await userEvent.clear(from);
    await userEvent.type(from, '2026-11-08');
    await userEvent.clear(to);
    await userEvent.type(to, '2026-11-01');

    expect(
      screen.getByText('A data final precisa ser igual ou depois da inicial'),
    ).toBeInTheDocument();

    await userEvent.clear(to);
    await userEvent.type(to, '2026-11-09');

    expect(lastListCall()).toMatchObject({
      entityId: GROUP_ID,
      from: '2026-11-08',
      to: '2026-11-09',
    });

    await userEvent.clear(from);
    await userEvent.clear(to);

    expect(lastListCall()?.from).toBeUndefined();
    expect(lastListCall()?.to).toBeUndefined();
  });

  it('CA2: limpar os filtros volta ao estado inicial', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });
    await userEvent.selectOptions(screen.getByLabelText('Tipo de ação executada'), 'GROUP_DELETED');

    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(screen.getByLabelText('Tipo de ação executada')).toHaveValue('');
    expect(lastListCall()?.action).toBeUndefined();
  });

  it('mostra o total no singular com um evento só', async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue({
      ...page,
      data: page.data.slice(0, 1),
      meta: { ...page.meta, total: 1 },
    });

    renderPage();
    await screen.findByRole('row', { name: /Carla Mendes/ });

    expect(screen.getByText(/nesta página/)).toHaveTextContent('Mostrando 1 evento nesta página');
  });

  it('troca de página pela paginação', async () => {
    vi.mocked(auditLogsApi.list).mockResolvedValue({
      ...page,
      meta: { ...page.meta, total: 30, totalPages: 3 },
    });

    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Página 2' }));

    expect(lastListCall()?.page).toBe(2);
  });

  it('CA3: mostra o erro do detalhe e fecha a gaveta', async () => {
    vi.mocked(auditLogsApi.getById).mockRejectedValue(new Error('Registro não encontrado'));
    renderPage();
    const row = await screen.findByRole('row', { name: /Carla Mendes/ });

    await userEvent.click(within(row).getByRole('button', { name: 'Ver detalhes completos' }));

    const drawer = await screen.findByRole('dialog', { name: 'Detalhes do registro de auditoria' });
    expect(await within(drawer).findByText('Registro não encontrado')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(
      screen.queryByRole('dialog', { name: 'Detalhes do registro de auditoria' }),
    ).not.toBeInTheDocument();
  });

  it('CA3: mostra o registro sem alvo, sem motivo e sem detalhes', async () => {
    vi.mocked(auditLogsApi.getById).mockResolvedValue({
      ...detail,
      entityId: null,
      details: null,
    });
    renderPage();
    const row = await screen.findByRole('row', { name: /Carla Mendes/ });

    await userEvent.click(within(row).getByRole('button', { name: 'Ver detalhes completos' }));

    const drawer = await screen.findByRole('dialog', { name: 'Detalhes do registro de auditoria' });
    expect(await within(drawer).findByText('Sem ID de entidade')).toBeInTheDocument();
    expect(within(drawer).getByText('Sem motivo registrado')).toBeInTheDocument();
    expect(within(drawer).getByText('{}')).toBeInTheDocument();
  });
});
