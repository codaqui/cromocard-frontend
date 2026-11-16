import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import { SanctionDialog, type SanctionTarget } from './SanctionDialog';

vi.mock('../../users.api', () => ({
  usersApi: { warn: vi.fn(), suspend: vi.fn(), block: vi.fn() },
}));

function buildTarget(overrides: Partial<SanctionTarget> = {}): SanctionTarget {
  return {
    id: crypto.randomUUID(),
    name: 'Ana Colecionadora',
    username: 'ana.cards',
    warningsCount: 0,
    ...overrides,
  };
}

function renderDialog(target: SanctionTarget | null, onClose = vi.fn(), onSaved = vi.fn()) {
  renderWithProviders({
    routes: [
      {
        path: paths.backoffice.users,
        element: <SanctionDialog target={target} onClose={onClose} onSaved={onSaved} />,
      },
    ],
    initialPath: paths.backoffice.users,
  });
  return { onClose, onSaved };
}

async function typeReason(text: string) {
  await userEvent.type(screen.getByLabelText('Justificativa (obrigatória)'), text);
}

describe('SanctionDialog', () => {
  beforeEach(() => {
    vi.mocked(usersApi.warn).mockReset();
    vi.mocked(usersApi.suspend).mockReset();
    vi.mocked(usersApi.block).mockReset();
  });

  it('não mostra nada sem usuário alvo', () => {
    renderDialog(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mostra o nome, o @username e as advertências anteriores no subtítulo', () => {
    renderDialog(buildTarget({ warningsCount: 2 }));

    expect(
      screen.getByText('Ana Colecionadora (@ana.cards) • 2 advertências anteriores'),
    ).toBeInTheDocument();
  });

  it('CA1: adverte o usuário com a justificativa', async () => {
    const target = buildTarget();
    vi.mocked(usersApi.warn).mockResolvedValue({ warningsCount: 1 });
    const { onSaved } = renderDialog(target);

    await userEvent.click(screen.getByRole('radio', { name: /Advertir/ }));
    await typeReason('Linguagem ofensiva no chat do grupo');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sanção' }));

    await vi.waitFor(() =>
      expect(usersApi.warn).toHaveBeenCalledWith(target.id, {
        reason: 'Linguagem ofensiva no chat do grupo',
        reportId: undefined,
      }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('warn'));
  });

  it('CA2: suspende o usuário com o prazo escolhido', async () => {
    const target = buildTarget();
    vi.mocked(usersApi.suspend).mockResolvedValue({
      id: target.id,
      name: target.name,
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER',
      status: 'SUSPENDED',
      emailVerified: true,
      createdAt: '2026-10-01T00:00:00.000Z',
      username: target.username,
      phone: null,
      lastLoginAt: null,
      lastLoginIp: null,
      suspendedUntil: '2026-11-22T00:00:00.000Z',
    });
    const { onSaved } = renderDialog(target);

    expect(screen.getByRole('radio', { name: /Suspender temporariamente/ })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: '15 dias' }));
    await typeReason('Vendeu carta falsificada no marketplace');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sanção' }));

    await vi.waitFor(() =>
      expect(usersApi.suspend).toHaveBeenCalledWith(target.id, {
        reason: 'Vendeu carta falsificada no marketplace',
        days: 15,
      }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('suspend'));
  });

  it('CA3: bane o usuário definitivamente', async () => {
    const target = buildTarget();
    vi.mocked(usersApi.block).mockResolvedValue({
      id: target.id,
      name: target.name,
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER',
      status: 'BLOCKED',
      emailVerified: true,
      createdAt: '2026-10-01T00:00:00.000Z',
      username: target.username,
      phone: null,
      lastLoginAt: null,
      lastLoginIp: null,
      suspendedUntil: null,
    });
    const { onSaved } = renderDialog(target);

    await userEvent.click(screen.getByRole('radio', { name: /Banir definitivamente/ }));
    await typeReason('Reincidência grave após duas advertências');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sanção' }));

    await vi.waitFor(() =>
      expect(usersApi.block).toHaveBeenCalledWith(target.id, {
        reason: 'Reincidência grave após duas advertências',
      }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('block'));
  });

  it('esconde o seletor de prazo fora da opção Suspender', async () => {
    renderDialog(buildTarget());

    await userEvent.click(screen.getByRole('radio', { name: /Advertir/ }));

    expect(screen.queryByRole('group', { name: 'Prazo da suspensão' })).not.toBeInTheDocument();
  });

  it('mostra o erro da API sem fechar o diálogo', async () => {
    vi.mocked(usersApi.suspend).mockRejectedValue(new Error('Usuário já está suspenso'));
    renderDialog(buildTarget());

    await typeReason('Motivo qualquer para suspender');
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar sanção' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuário já está suspenso');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancelar fecha sem chamar a API', async () => {
    const { onClose } = renderDialog(buildTarget());

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(usersApi.suspend).not.toHaveBeenCalled();
  });
});
