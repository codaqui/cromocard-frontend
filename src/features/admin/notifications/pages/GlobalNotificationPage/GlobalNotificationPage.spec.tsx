import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { globalNotificationsApi } from '../../global-notifications.api';
import type { GlobalNotification } from '../../global-notifications.types';
import { GlobalNotificationPage } from './GlobalNotificationPage';

vi.mock('../../global-notifications.api', () => ({
  globalNotificationsApi: {
    list: vi.fn(),
    recipientsCount: vi.fn(),
    dispatch: vi.fn(),
    cancel: vi.fn(),
  },
}));

const api = vi.mocked(globalNotificationsApi);

const sent: GlobalNotification = {
  id: 'd-1',
  title: 'Manutenção programada no sábado',
  content: 'Fora do ar das 2h às 4h.',
  referenceLink: null,
  audience: 'ALL',
  channels: ['IN_APP', 'EMAIL'],
  status: 'SENT',
  recipientCount: 48610,
  scheduledAt: null,
  sentAt: '2026-11-10T14:15:00Z',
  createdAt: '2026-11-10T14:15:00Z',
  admin: { id: 'a-1', name: 'Master Admin' },
};

const scheduled: GlobalNotification = {
  ...sent,
  id: 'd-2',
  title: 'Novo álbum disponível: Copa do Mundo 2026',
  channels: ['IN_APP'],
  status: 'SCHEDULED',
  recipientCount: 0,
  scheduledAt: '2099-11-13T23:30:00Z',
  sentAt: null,
};

const canceled: GlobalNotification = {
  ...sent,
  id: 'd-3',
  title: 'Volte a completar seus álbuns',
  audience: 'ACTIVE_COLLECTORS',
  channels: ['IN_APP'],
  status: 'CANCELED',
  recipientCount: 0,
};

const meta = { page: 1, pageSize: 10, total: 3, totalPages: 1 };
const counts = { ALL: 48920, ACTIVE_COLLECTORS: 42800, SELLERS: 0 };

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <GlobalNotificationPage />
    </QueryClientProvider>,
  );
}

const sendButton = () => screen.findByRole('button', { name: /notificação para 48\.920 usuários/ });
const lastDispatch = () => api.dispatch.mock.lastCall?.[0];

async function fillMessage() {
  await userEvent.type(screen.getByLabelText('Título da Notificação'), 'Novo álbum disponível');
  await userEvent.type(screen.getByLabelText('Corpo da Mensagem'), 'Monte o seu álbum.');
}

describe('GlobalNotificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue({ data: [scheduled, sent, canceled], meta });
    api.recipientsCount.mockResolvedValue(counts);
    api.dispatch.mockResolvedValue({
      ...sent,
      title: 'Novo álbum disponível',
      channels: ['IN_APP'],
    });
    api.cancel.mockResolvedValue({ ...scheduled, status: 'CANCELED' });
  });

  it('CA8 e CCD101 CA1: o aviso e o botão mostram quantos usuários o público tem', async () => {
    renderPage();

    expect(await sendButton()).toHaveTextContent('Enviar notificação para 48.920 usuários');
    expect(screen.getByRole('status')).toHaveTextContent(
      'A notificação vai para a central de notificações de 48.920 usuários e não pode ser desfeita.',
    );
    expect(screen.getByRole('radio', { name: /Colecionadores ativos/ })).toBeInTheDocument();
    expect(screen.getByText('42.800 usuários')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: /Colecionadores ativos/ }));
    await userEvent.click(screen.getByRole('checkbox', { name: /E-mail/ }));

    expect(screen.getByRole('button', { name: /para 42\.800 usuários/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'vai para a central de notificações e o e-mail de 42.800 usuários',
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /Plataforma/ }));
    expect(screen.getByRole('status')).toHaveTextContent('vai para o e-mail de 42.800 usuários');
    await userEvent.click(screen.getByRole('checkbox', { name: /E-mail/ }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'vai para a central de notificações de 42.800 usuários',
    );
  });

  it('CA7: a pré-visualização mostra o título e o texto como na central', async () => {
    renderPage();
    const preview = screen.getByRole('article', { name: 'Pré-visualização da notificação' });
    expect(preview).toHaveTextContent('Título da notificação');

    await fillMessage();

    expect(preview).toHaveTextContent('Novo álbum disponível');
    expect(preview).toHaveTextContent('Monte o seu álbum.');
    expect(preview).toHaveTextContent('agora');
    expect(screen.getByText('21/120')).toBeInTheDocument();
  });

  it('CA1 e CA5: envia, mostra a confirmação e limpa o formulário', async () => {
    renderPage();
    await fillMessage();
    await userEvent.type(screen.getByLabelText('Link de destino (opcional)'), '/albuns/copa');

    await userEvent.click(await sendButton());

    expect(lastDispatch()).toEqual({
      title: 'Novo álbum disponível',
      content: 'Monte o seu álbum.',
      link: '/albuns/copa',
      audience: 'ALL',
      channels: ['IN_APP'],
    });
    const dialog = await screen.findByRole('dialog', { name: 'Notificação enviada' });
    expect(dialog).toHaveTextContent('STATUS: ENTREGUE');
    expect(dialog).toHaveTextContent('48.610 usuários');
    expect(dialog).toHaveTextContent('Plataforma');
    expect(dialog).toHaveTextContent('Toda a base');
    expect(screen.getByLabelText('Título da Notificação')).toHaveValue('');
    expect(api.list).toHaveBeenCalledTimes(2);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Voltar à central' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('CA5: "Ver histórico de disparos" fecha o modal e leva ao histórico', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderPage();
    await fillMessage();
    await userEvent.click(await sendButton());

    const dialog = await screen.findByRole('dialog', { name: 'Notificação enviada' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: /Ver histórico de disparos/ }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Histórico de disparos' })).toHaveFocus(),
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('CA2: campos vazios indicam o que falta e não enviam', async () => {
    renderPage();

    await userEvent.click(await sendButton());

    expect(await screen.findByText('Informe o título.')).toBeInTheDocument();
    expect(screen.getByText('Informe a mensagem.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Corrija os campos destacados para continuar.',
    );
    expect(api.dispatch).not.toHaveBeenCalled();
  });

  it('CA9 e CCD101 CA4: o erro da API aparece no campo', async () => {
    api.dispatch.mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: [
          { field: 'link', message: 'Informe um caminho que comece com / ou um link http(s).' },
          { field: 'channels', message: 'Escolha pelo menos um canal.' },
        ],
      }),
    );
    renderPage();
    await fillMessage();

    await userEvent.click(await sendButton());

    expect(
      await screen.findByText('Informe um caminho que comece com / ou um link http(s).'),
    ).toBeInTheDocument();
    expect(screen.getByText('Escolha pelo menos um canal.')).toBeInTheDocument();
  });

  it('CCD101 CA3: público sem usuários não envia', async () => {
    renderPage();
    await fillMessage();
    await sendButton();

    await userEvent.click(screen.getByRole('radio', { name: /Vendedores/ }));
    await userEvent.click(screen.getByRole('button', { name: /para 0 usuários/ }));

    expect(
      await screen.findByText('Este público não tem usuários. Escolha outro público.'),
    ).toBeInTheDocument();
    expect(api.dispatch).not.toHaveBeenCalled();
  });

  it('CCD101 CA3: o público que esvaziou depois da contagem também é avisado', async () => {
    api.dispatch.mockRejectedValue(
      new ApiError({ status: 422, code: 'EMPTY_AUDIENCE', message: 'Público vazio agora.' }),
    );
    renderPage();
    await fillMessage();

    await userEvent.click(await sendButton());

    expect(await screen.findByText('Público vazio agora.')).toBeInTheDocument();
  });

  it('mostra o erro inesperado do envio fora dos campos', async () => {
    api.dispatch.mockRejectedValue(
      new ApiError({ status: 500, code: 'X', message: 'Servidor fora.' }),
    );
    renderPage();
    await fillMessage();

    await userEvent.click(await sendButton());

    expect(await screen.findByText('Servidor fora.')).toBeInTheDocument();
  });

  it('CA3: "Cancelar" limpa o formulário sem enviar', async () => {
    renderPage();
    await fillMessage();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByLabelText('Título da Notificação')).toHaveValue('');
    expect(screen.getByLabelText('Corpo da Mensagem')).toHaveValue('');
    expect(api.dispatch).not.toHaveBeenCalled();
  });

  it('CCD100 CA7 e CA1: agendar mostra o calendário, troca o botão e confirma o horário', async () => {
    api.dispatch.mockResolvedValue(scheduled);
    renderPage();
    await fillMessage();

    await userEvent.click(screen.getByRole('radio', { name: /Agendar Horário/ }));
    expect(
      screen.getByRole('heading', { name: 'Configuração de agendamento' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /Agendar notificação para 48\.920/ }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    const day = screen
      .getAllByRole('button', { name: /de .* de 20\d\d$/ })
      .find((cell) => !cell.hasAttribute('disabled'));
    await userEvent.click(day!);
    await userEvent.clear(screen.getByLabelText('Horas'));
    await userEvent.type(screen.getByLabelText('Horas'), '9');
    expect(screen.getByRole('status')).toHaveTextContent('A notificação entra na fila');

    await userEvent.click(screen.getByRole('button', { name: /Agendar notificação/ }));

    expect(lastDispatch()?.scheduledAt).toMatch(/T12:30:00\.000Z$/);
    const dialog = await screen.findByRole('dialog', { name: 'Notificação agendada' });
    expect(dialog).toHaveTextContent('STATUS: NA FILA');
    expect(dialog).toHaveTextContent('ENVIO PROGRAMADO');
  }, 20_000);

  it('CCD100 CA2: horário com menos de 5 minutos é recusado na tela', async () => {
    renderPage();
    await fillMessage();
    await userEvent.click(screen.getByRole('radio', { name: /Agendar Horário/ }));
    const hours = screen.getByLabelText('Horas');

    await userEvent.clear(hours);
    await userEvent.type(hours, '0');
    await userEvent.clear(screen.getByLabelText('Minutos'));
    await userEvent.type(screen.getByLabelText('Minutos'), '0');
    await userEvent.click(screen.getByRole('button', { name: /Agendar notificação/ }));

    expect(
      await screen.findByText('Escolha um horário com pelo menos 5 minutos de antecedência.'),
    ).toBeInTheDocument();
    await userEvent.clear(hours);
    await userEvent.type(hours, '99');
    await userEvent.click(screen.getByRole('button', { name: /Agendar notificação/ }));
    expect(await screen.findByText('Informe um horário válido.')).toBeInTheDocument();
    expect(api.dispatch).not.toHaveBeenCalled();
  }, 20_000);

  it('CCD100 CA5 e CCD101 CA5: o histórico mostra público, canal e status de cada disparo', async () => {
    renderPage();

    const history = await screen.findByRole('table', { name: 'Histórico de disparos' });
    const rows = within(history).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Na fila');
    expect(rows[0]).toHaveTextContent('Toda a base (48.920)');
    expect(rows[0]).toHaveTextContent('Cancelar agendamento');
    expect(rows[1]).toHaveTextContent('10 Nov 2026 • 11:15');
    expect(rows[1]).toHaveTextContent('Toda a base (48.610)');
    expect(rows[1]).toHaveTextContent('Plataforma + E-mail');
    expect(rows[1]).toHaveTextContent('Entregue');
    expect(rows[2]).toHaveTextContent('Colecionadores ativos (42.800)');
    expect(rows[2]).toHaveTextContent('Cancelado');
  });

  it('CCD100 CA4: cancela o agendamento depois de confirmar', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar agendamento' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Cancelar agendamento?' });
    expect(dialog).toHaveTextContent(
      'A notificação "Novo álbum disponível: Copa do Mundo 2026", programada para 13/11/2099 às 20:30, não será enviada.',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar agendamento' }));

    expect(api.cancel.mock.calls[0]?.[0]).toBe('d-2');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('CCD100 CA4: "Voltar" não cancela; e a falha ao cancelar aparece no diálogo', async () => {
    api.cancel.mockRejectedValue(
      new ApiError({ status: 409, code: 'NOT_SCHEDULED', message: 'Já saiu da fila.' }),
    );
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar agendamento' }));
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar agendamento' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar agendamento' }));
    expect(await within(dialog).findByText('Já saiu da fila.')).toBeInTheDocument();
  });

  it('mostra o carregando e o erro do histórico', async () => {
    api.list.mockRejectedValueOnce(new Error('Falha de rede'));
    api.recipientsCount.mockReturnValue(new Promise(() => undefined));
    renderPage();

    expect(screen.getByText('Carregando o histórico…')).toBeInTheDocument();
    expect(await screen.findByText('Não foi possível carregar o histórico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Enviar notificação$/ })).toBeInTheDocument();
  });
});
