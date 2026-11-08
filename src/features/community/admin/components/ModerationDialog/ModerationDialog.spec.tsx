import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { communityAdminApi } from '../../community-admin.api';
import { moderationTexts } from '../../community-admin.labels';
import type {
  AdminGroupSummary,
  CommunityAction,
  GroupMessageReport,
} from '../../community-admin.types';
import { ModerationDialog } from './ModerationDialog';

vi.mock('../../community-admin.api', () => ({
  communityAdminApi: {
    suspendGroup: vi.fn(),
    reactivateGroup: vi.fn(),
    deleteGroup: vi.fn(),
    removeReportedMessage: vi.fn(),
    dismissReport: vi.fn(),
  },
}));

const group: AdminGroupSummary = {
  id: '0199a000-0000-7000-8000-000000009821',
  name: 'Leilões Noturnos Pokémon SP',
  accessType: 'OPEN',
  status: 'ACTIVE',
  membersCount: 3840,
  creatorName: 'Ana Colecionadora',
};

const report: GroupMessageReport = {
  id: 'report-1',
  reason: 'Spam',
  description: null,
  reporterName: 'Carla',
  message: {
    id: 'message-1',
    content: 'Compre agora!',
    createdAt: '2026-11-07T18:01:44Z',
    authorName: 'Diego',
    groupName: 'Leilões Noturnos Pokémon SP',
  },
};

const REASON = 'Spam repetido no grupo';

function renderDialog(action: CommunityAction) {
  const onClose = vi.fn();
  const onDone = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ModerationDialog action={action} onClose={onClose} onDone={onDone} />
    </QueryClientProvider>,
  );
  return { onClose, onDone };
}

async function confirmWith(reason: string, confirmLabel: string) {
  await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), reason);
  await userEvent.click(screen.getByRole('button', { name: confirmLabel }));
}

describe('ModerationDialog', () => {
  beforeEach(() => {
    Object.values(communityAdminApi).forEach((request) =>
      vi
        .mocked(request)
        .mockReset()
        .mockResolvedValue(undefined as never),
    );
  });

  it.each([
    { ca: 'CA2', action: 'suspend', request: 'suspendGroup', done: 'Grupo suspenso com sucesso.' },
    {
      ca: 'CA3',
      action: 'reactivate',
      request: 'reactivateGroup',
      done: 'Grupo reativado com sucesso.',
    },
    { ca: 'CA4', action: 'delete', request: 'deleteGroup', done: 'Grupo excluído com sucesso.' },
  ] as const)('$ca: confirma a ação no grupo com o motivo', async ({ action, request, done }) => {
    const { onDone } = renderDialog({ kind: 'group', action, group });

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Leilões Noturnos Pokémon SP');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('#GRP-9821');
    await confirmWith(REASON, moderationTexts[action].confirmLabel);

    await vi.waitFor(() => expect(onDone).toHaveBeenCalledWith(done));
    expect(vi.mocked(communityAdminApi[request]).mock.calls[0]?.[0]).toEqual({
      id: group.id,
      reason: REASON,
    });
  });

  it.each([
    {
      ca: 'CA6',
      action: 'removeMessage',
      request: 'removeReportedMessage',
      done: 'Mensagem removida e denúncia resolvida.',
    },
    {
      ca: 'CA7',
      action: 'dismiss',
      request: 'dismissReport',
      done: 'Denúncia dispensada com sucesso.',
    },
  ] as const)(
    '$ca: confirma a ação na denúncia com o motivo',
    async ({ action, request, done }) => {
      const { onDone } = renderDialog({ kind: 'report', action, report });

      expect(screen.getByRole('alertdialog')).toHaveTextContent('Mensagem de Diego');
      await confirmWith(REASON, moderationTexts[action].confirmLabel);

      await vi.waitFor(() => expect(onDone).toHaveBeenCalledWith(done));
      expect(vi.mocked(communityAdminApi[request]).mock.calls[0]?.[0]).toEqual({
        id: report.id,
        reason: REASON,
      });
    },
  );

  it('exige o motivo antes de confirmar', async () => {
    renderDialog({ kind: 'group', action: 'suspend', group });

    await userEvent.click(screen.getByRole('button', { name: 'Sim, Suspender Grupo' }));

    expect(await screen.findByText(/pelo menos 3 caracteres/)).toBeInTheDocument();
    expect(communityAdminApi.suspendGroup).not.toHaveBeenCalled();
  });

  it('cancela sem gravar nada', async () => {
    const { onClose, onDone } = renderDialog({ kind: 'group', action: 'delete', group });

    await userEvent.type(screen.getByRole('textbox', { name: 'Motivo' }), REASON);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar e Manter Grupo' }));

    expect(onClose).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(communityAdminApi.deleteGroup).not.toHaveBeenCalled();
  });

  it('mostra o erro da API no diálogo, sem fechar', async () => {
    vi.mocked(communityAdminApi.dismissReport).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'REPORT_ALREADY_RESOLVED',
        message: 'A denúncia já foi resolvida',
      }),
    );
    const { onDone } = renderDialog({ kind: 'report', action: 'dismiss', report });

    await confirmWith(REASON, 'Sim, Dispensar Denúncia');

    expect(await screen.findByRole('alert')).toHaveTextContent('A denúncia já foi resolvida');
    expect(onDone).not.toHaveBeenCalled();
  });
});
