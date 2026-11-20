import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { settingsApi } from '../../settings.api';
import { settingsNotices } from '../../settings.labels';
import { renderSettings, validationError } from '../../test/renderSettings';
import { GoalsModule } from './GoalsModule';

vi.mock('../../settings.api', () => ({
  settingsApi: { list: vi.fn(), updateGoals: vi.fn() },
}));

const GOALS = { monthlySignupGoal: 4000, votingGoal: 200 };

function renderGoals(goals: typeof GOALS | null = GOALS) {
  const notify = vi.fn();
  renderSettings(<GoalsModule goals={goals} notify={notify} />);
  return { notify, user: userEvent.setup() };
}

const monthly = () => screen.getByRole('textbox', { name: 'Meta mensal de novos cadastros' });
const voting = () =>
  screen.getByRole('textbox', { name: 'Meta de votos das sugestões de categoria' });
const saveButton = () => screen.getByRole('button', { name: /Salvar metas/ });

beforeEach(() => {
  vi.mocked(settingsApi.list).mockResolvedValue([]);
  vi.mocked(settingsApi.updateGoals).mockReset();
});

describe('GoalsModule', () => {
  it('R16: mostra as metas como no Figma, com as dicas de uso', () => {
    renderGoals();

    expect(monthly()).toHaveValue('4.000');
    expect(voting()).toHaveValue('200');
    expect(screen.getByText('Usada no quórum da Fila de Solicitações.')).toBeInTheDocument();
  });

  it('CA9: meta mensal vazia é gravada como "sem meta"', async () => {
    vi.mocked(settingsApi.updateGoals).mockResolvedValue({
      monthlySignupGoal: null,
      votingGoal: 150,
    });
    const { notify, user } = renderGoals();

    await user.clear(monthly());
    await user.clear(voting());
    await user.type(voting(), '150');
    await user.click(saveButton());

    await waitFor(() => expect(notify).toHaveBeenCalledWith(settingsNotices.goals));
    expect(vi.mocked(settingsApi.updateGoals).mock.calls[0]?.[0]).toEqual({
      monthlySignupGoal: null,
      votingGoal: 150,
    });
  });

  it('CA9: meta de votos vazia é apontada e nada é gravado', async () => {
    const { user } = renderGoals();

    await user.clear(voting());
    await user.click(saveButton());

    expect(await screen.findByText('Informe a meta de votos')).toBeInTheDocument();
    expect(settingsApi.updateGoals).not.toHaveBeenCalled();
  });

  it('CA5: Cancelar volta as metas carregadas', async () => {
    const { user } = renderGoals();

    await user.clear(monthly());
    await user.type(monthly(), '9');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(monthly()).toHaveValue('4.000');
  });

  it('R7: o 400 da API aparece no campo', async () => {
    vi.mocked(settingsApi.updateGoals).mockRejectedValue(
      validationError([{ field: 'votingGoal', message: 'Meta recusada' }]),
    );
    const { user } = renderGoals();

    await user.click(saveButton());

    expect(await screen.findByText('Meta recusada')).toBeInTheDocument();
  });

  it('L23: erro sem campo vira aviso de erro', async () => {
    const error = new ApiError({
      status: 404,
      code: 'SETTING_NOT_FOUND',
      message: 'Configuração não encontrada',
    });
    vi.mocked(settingsApi.updateGoals).mockRejectedValue(error);
    const { notify, user } = renderGoals(null);

    await user.type(voting(), '200');
    await user.click(saveButton());

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith({
        message: 'Não foi possível salvar',
        detail: 'Configuração não encontrada',
        tone: 'danger',
      }),
    );
  });
});
