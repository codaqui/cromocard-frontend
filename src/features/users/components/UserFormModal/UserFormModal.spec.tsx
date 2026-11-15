import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserDetail, UserSummary } from '../../users.types';
import { useUserFormSubmission } from '../../hooks/useUserFormSubmission';
import { UserFormModal } from './UserFormModal';

interface HarnessProps {
  user: UserSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

/** O modal é só apresentação (ADR-042): o teste o liga à API como o container faz. */
function ModalWithSubmission({ user, onClose, onSaved }: HarnessProps) {
  const submission = useUserFormSubmission(user, onSaved);
  return (
    <UserFormModal
      open
      user={user}
      isSaving={submission.isSaving}
      apiError={submission.apiError}
      onClose={onClose}
      onSubmit={submission.submit}
    />
  );
}

vi.mock('../../users.api', () => ({
  usersApi: { create: vi.fn(), update: vi.fn() },
}));

function buildUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: crypto.randomUUID(),
    name: 'Ana Colecionadora',
    email: 'ana@cromocard.dev',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    username: null,
    phone: null,
    lastLoginAt: null,
    lastLoginIp: null,
    ...overrides,
  };
}

function buildDetail(overrides: Partial<UserDetail> = {}): UserDetail {
  return {
    ...buildUser(),
    cpf: null,
    oauthProvider: null,
    activationPending: false,
    addresses: [],
    adminActions: [],
    ...overrides,
  };
}

function renderModal(user: UserSummary | null, onClose = vi.fn(), onSaved = vi.fn()) {
  renderWithProviders({
    routes: [
      {
        path: paths.backoffice.users,
        element: <ModalWithSubmission user={user} onClose={onClose} onSaved={onSaved} />,
      },
    ],
    initialPath: paths.backoffice.users,
  });
  return { onClose, onSaved };
}

async function fillIdentity(name: string, email: string) {
  await userEvent.clear(screen.getByLabelText('Nome completo'));
  await userEvent.type(screen.getByLabelText('Nome completo'), name);
  await userEvent.clear(screen.getByLabelText('E-mail'));
  await userEvent.type(screen.getByLabelText('E-mail'), email);
}

describe('UserFormModal', () => {
  beforeEach(() => {
    vi.mocked(usersApi.create).mockReset();
    vi.mocked(usersApi.update).mockReset();
  });

  it('CA2: cria o usuário com nome, e-mail e papel', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser({ role: 'SELLER' }));
    const { onSaved } = renderModal(null);

    await fillIdentity('Bia Vendedora', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith(
        {
          name: 'Bia Vendedora',
          email: 'bia@cromocard.dev',
          role: 'SELLER',
          username: undefined,
          cpf: undefined,
          phone: undefined,
          sendActivation: true,
        },
        expect.anything(),
      ),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('CA3: edita um usuário existente sem mandar sendActivation', async () => {
    const user = buildUser();
    vi.mocked(usersApi.update).mockResolvedValue({ ...user, name: 'Ana Silva' });
    const { onSaved } = renderModal(user);

    expect(screen.getByLabelText('Nome completo')).toHaveValue(user.name);
    await userEvent.clear(screen.getByLabelText('Nome completo'));
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(user.id, { name: 'Ana Silva' }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('R4 (CCD098): editar sem mexer em @, CPF e telefone não os manda, e o que existe fica', async () => {
    const user = buildDetail({
      username: 'ana.colecionadora',
      cpf: '52998224725',
      phone: '11912345678',
    });
    vi.mocked(usersApi.update).mockResolvedValue(user);
    renderModal(user);

    await userEvent.clear(screen.getByLabelText('Nome completo'));
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(user.id, { name: 'Ana Silva' }),
    );
  });

  it('R4 (CCD098): editar pela lista, sem o CPF carregado, não apaga o CPF', async () => {
    const user = buildUser();
    vi.mocked(usersApi.update).mockResolvedValue(user);
    const { onSaved } = renderModal(user);

    expect(screen.getByLabelText('CPF')).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(usersApi.update).not.toHaveBeenCalled();
  });

  it('R4 (CCD098): apagar @, CPF e telefone no formulário manda null para a API', async () => {
    const user = buildDetail({
      username: 'ana.colecionadora',
      cpf: '52998224725',
      phone: '11912345678',
    });
    vi.mocked(usersApi.update).mockResolvedValue(user);
    renderModal(user);

    await userEvent.clear(screen.getByLabelText('Nome de usuário'));
    await userEvent.clear(screen.getByLabelText('CPF'));
    await userEvent.clear(screen.getByLabelText('Telefone com DDD'));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await vi.waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({ username: null, cpf: null, phone: null }),
      ),
    );
  });

  it('mostra o erro por campo quando a API responde 409 no e-mail', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'Já existe um usuário cadastrado com este e-mail',
        details: [{ field: 'email', message: 'Já existe um usuário cadastrado com este e-mail' }],
      }),
    );
    renderModal(null);

    await fillIdentity('Bia', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(
      await screen.findByText('Já existe um usuário cadastrado com este e-mail'),
    ).toBeInTheDocument();
  });

  it('R11: mostra o erro por campo no 400 e permite corrigir e reenviar', async () => {
    vi.mocked(usersApi.create)
      .mockRejectedValueOnce(
        new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: [{ field: 'email', message: 'Domínio de e-mail não permitido' }],
        }),
      )
      .mockResolvedValueOnce(buildUser({ email: 'bia@gmail.com', role: 'SELLER' }));
    const { onSaved } = renderModal(null);

    await fillIdentity('Bia', 'bia@dominio-bloqueado.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByText('Domínio de e-mail não permitido')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('E-mail'));
    await userEvent.type(screen.getByLabelText('E-mail'), 'bia@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('R4: cria com @, CPF e telefone normalizados', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser({ role: 'SELLER' }));
    renderModal(null);

    await fillIdentity('Bia Vendedora', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.type(screen.getByLabelText('Nome de usuário'), '@bia.vendas');
    await userEvent.type(screen.getByLabelText('CPF'), '529.982.247-25');
    await userEvent.type(screen.getByLabelText('Telefone com DDD'), '(11) 91234-5678');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'bia.vendas',
          cpf: '52998224725',
          phone: '11912345678',
        }),
        expect.anything(),
      ),
    );
  });

  it('R5: desmarcar o envio do link manda sendActivation false', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser({ role: 'SELLER' }));
    renderModal(null);

    await fillIdentity('Bia Vendedora', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByLabelText('Enviar link de ativação de conta por e-mail'));
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ sendActivation: false }),
        expect.anything(),
      ),
    );
  });

  it('R6: @ já cadastrado mostra o erro no campo', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'USERNAME_TAKEN',
        message: 'Este nome de usuário já está em uso',
        details: [{ field: 'username', message: 'Este nome de usuário já está em uso' }],
      }),
    );
    renderModal(null);

    await fillIdentity('Bia', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.type(screen.getByLabelText('Nome de usuário'), 'bia');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByText('Este nome de usuário já está em uso')).toBeInTheDocument();
  });

  it('R6: CPF já cadastrado mostra o erro no campo', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'CPF_TAKEN',
        message: 'Já existe um usuário cadastrado com este CPF',
        details: [{ field: 'cpf', message: 'Já existe um usuário cadastrado com este CPF' }],
      }),
    );
    renderModal(null);

    await fillIdentity('Bia', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.type(screen.getByLabelText('CPF'), '529.982.247-25');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(
      await screen.findByText('Já existe um usuário cadastrado com este CPF'),
    ).toBeInTheDocument();
  });

  it('R7: CPF inválido não envia e mostra o erro no campo', async () => {
    renderModal(null);

    await fillIdentity('Bia', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.type(screen.getByLabelText('CPF'), '111.111.111-11');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByText('CPF inválido')).toBeInTheDocument();
    expect(usersApi.create).not.toHaveBeenCalled();
  });

  it('CA8: cancelar fecha sem gravar', async () => {
    const { onClose } = renderModal(null);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(usersApi.create).not.toHaveBeenCalled();
  });

  it('enquanto a API responde, o botão mostra que está salvando e fica desabilitado', async () => {
    vi.mocked(usersApi.create).mockReturnValue(new Promise(() => undefined));
    vi.mocked(usersApi.update).mockReturnValue(new Promise(() => undefined));
    renderModal(null);

    await fillIdentity('Bia Vendedora', 'bia@cromocard.dev');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByRole('button', { name: 'Cadastrando…' })).toBeDisabled();
  });

  it('na edição, o botão salvando também aparece', async () => {
    vi.mocked(usersApi.update).mockReturnValue(new Promise(() => undefined));
    renderModal(buildUser());

    await userEvent.type(screen.getByLabelText('Nome completo'), ' Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });
});
