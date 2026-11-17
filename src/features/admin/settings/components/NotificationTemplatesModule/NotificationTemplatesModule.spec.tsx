import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingsApi } from '../../settings.api';
import { settingsNotices } from '../../settings.labels';
import { renderSettings, validationError } from '../../test/renderSettings';
import { NotificationTemplatesModule } from './NotificationTemplatesModule';

vi.mock('../../settings.api', () => ({
  settingsApi: { list: vi.fn(), updateTemplates: vi.fn() },
}));

const NEW_ALBUM = {
  id: '0190a000-0000-700c-83af-98fb1ceda6c9',
  name: 'Novo álbum disponível',
  title: 'Novo álbum disponível: {álbum}',
  content: 'O álbum {álbum} já está no catálogo.',
};
const MAINTENANCE = {
  name: 'Manutenção programada',
  title: 'Manutenção programada no {dia}',
  content: 'A plataforma fica fora do ar das {início} às {fim}.',
};
const TEMPLATES = [NEW_ALBUM, MAINTENANCE];

function renderTemplates(templates = TEMPLATES) {
  const notify = vi.fn();
  renderSettings(<NotificationTemplatesModule templates={templates} notify={notify} />);
  return { notify, user: userEvent.setup() };
}

const RULES = {
  id: '0190a000-0000-700c-83af-98fb1ceda6d1',
  name: 'Novas regras',
  title: 'Novas regras para {público}',
  content: 'Atualizamos as regras da comunidade.',
};

function TemplatesWithReload({ next }: { next: (typeof TEMPLATES)[number][] }) {
  const [templates, setTemplates] = useState<(typeof TEMPLATES)[number][]>([NEW_ALBUM, RULES]);
  return (
    <>
      <button type="button" onClick={() => setTemplates(next)}>
        Recarregar lista
      </button>
      <NotificationTemplatesModule templates={templates} notify={vi.fn()} />
    </>
  );
}

const dialog = () => screen.getByRole('dialog');
const savedList = () => vi.mocked(settingsApi.updateTemplates).mock.calls[0]?.[0];

beforeEach(() => {
  vi.mocked(settingsApi.list).mockResolvedValue([]);
  vi.mocked(settingsApi.updateTemplates).mockReset();
});

describe('NotificationTemplatesModule', () => {
  it('R11: lista o nome, o título e o começo do texto de cada template', () => {
    renderTemplates();

    expect(screen.getByText('Novo álbum disponível')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Título: Manutenção programada no {dia} • Texto: A plataforma fica fora do ar das {início} às {fim}.',
      ),
    ).toBeInTheDocument();
  });

  it('CA7: cria um template com {álbum} no título e a tela confirma', async () => {
    vi.mocked(settingsApi.updateTemplates).mockResolvedValue({} as never);
    const { notify, user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: /Novo template/ }));
    await user.type(
      within(dialog()).getByRole('textbox', { name: 'Nome do template' }),
      'Álbum esgotado',
    );
    await user.type(within(dialog()).getByRole('textbox', { name: /Título/ }), 'Esgotou: {{álbum}');
    await user.type(within(dialog()).getByRole('textbox', { name: /Texto/ }), 'Corra.');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar template' }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(settingsNotices.templateSaved));
    expect(savedList()).toEqual([
      ...TEMPLATES,
      { name: 'Álbum esgotado', title: 'Esgotou: {álbum}', content: 'Corra.' },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('CA7: nome repetido volta da API no campo do modal', async () => {
    vi.mocked(settingsApi.updateTemplates).mockRejectedValue(
      validationError([{ field: 'value.2.name', message: 'Já existe um template com este nome' }]),
    );
    const { user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: /Novo template/ }));
    await user.type(
      within(dialog()).getByRole('textbox', { name: 'Nome do template' }),
      'novo álbum disponível',
    );
    await user.type(within(dialog()).getByRole('textbox', { name: /Título/ }), 'Título');
    await user.type(within(dialog()).getByRole('textbox', { name: /Texto/ }), 'Texto');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar template' }));

    expect(
      await within(dialog()).findByText('Já existe um template com este nome'),
    ).toBeInTheDocument();
  });

  it('R11: editar abre o modal com os valores e os contadores, e mantém o id', async () => {
    vi.mocked(settingsApi.updateTemplates).mockResolvedValue({} as never);
    const { user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: 'Editar Novo álbum disponível' }));
    expect(within(dialog()).getByRole('heading', { name: 'Editar template' })).toBeInTheDocument();
    expect(within(dialog()).getByText('Título (30/120)')).toBeInTheDocument();
    await user.type(within(dialog()).getByRole('textbox', { name: /Texto/ }), ' Confira!');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar template' }));

    await waitFor(() =>
      expect(savedList()).toEqual([
        { ...NEW_ALBUM, content: 'O álbum {álbum} já está no catálogo. Confira!' },
        MAINTENANCE,
      ]),
    );
  });

  it('CA11: excluir pede confirmação e só remove depois de confirmar', async () => {
    vi.mocked(settingsApi.updateTemplates).mockResolvedValue({} as never);
    const { notify, user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: 'Excluir Manutenção programada' }));
    const confirm = screen.getByRole('alertdialog');
    expect(within(confirm).getByText(/Manutenção programada/)).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: 'Cancelar' }));
    expect(settingsApi.updateTemplates).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir Manutenção programada' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir' }),
    );

    await waitFor(() => expect(notify).toHaveBeenCalledWith(settingsNotices.templateDeleted));
    expect(savedList()).toEqual([NEW_ALBUM]);
  });

  it('R11: lista vazia convida a criar o primeiro template', () => {
    renderTemplates([]);

    expect(screen.getByText(/Nenhum template cadastrado/)).toBeInTheDocument();
  });

  it('CA5: Cancelar fecha o modal sem gravar', async () => {
    const { user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: /Novo template/ }));
    expect(within(dialog()).getByRole('heading', { name: 'Novo template' })).toBeInTheDocument();
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(settingsApi.updateTemplates).not.toHaveBeenCalled();
  });

  it('R11: o modal mostra Salvando… enquanto grava', async () => {
    vi.mocked(settingsApi.updateTemplates).mockReturnValue(new Promise(() => undefined));
    const { user } = renderTemplates();

    await user.click(screen.getByRole('button', { name: 'Editar Novo álbum disponível' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar template' }));

    expect(await within(dialog()).findByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });
  it('R11: com 50 templates, Novo template fica desabilitado', () => {
    const fifty = Array.from({ length: 50 }, (_, index) => ({
      ...MAINTENANCE,
      name: `Aviso ${index}`,
    }));
    renderTemplates(fifty);

    const newButton = screen.getByRole('button', { name: /Novo template/ });

    expect(newButton).toBeDisabled();
    expect(newButton).toHaveAttribute('title', expect.stringContaining('Limite de 50 templates'));
  });

  it('R11: a edição vai para o template certo mesmo se a lista mudar de ordem com o modal aberto', async () => {
    vi.mocked(settingsApi.updateTemplates).mockResolvedValue({} as never);
    renderSettings(<TemplatesWithReload next={[RULES, NEW_ALBUM]} />);
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /Editar/ })[1] as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar lista' }));
    const name = within(dialog()).getByRole('textbox', { name: 'Nome do template' });
    await user.clear(name);
    await user.type(name, 'Regras novas');
    await user.click(within(dialog()).getByRole('button', { name: 'Salvar template' }));

    await waitFor(() =>
      expect(savedList()).toEqual([{ ...RULES, name: 'Regras novas' }, NEW_ALBUM]),
    );
  });

  it('R11: se o template sumir da lista com a exclusão aberta, nada é excluído', async () => {
    renderSettings(<TemplatesWithReload next={[NEW_ALBUM]} />);
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /Excluir/ })[1] as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar lista' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(settingsApi.updateTemplates).not.toHaveBeenCalled();
  });
});
