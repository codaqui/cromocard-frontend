import type { IconName } from '@/components/Icon/icon-paths';

import type { NotificationEvent, NotificationFilter } from './notifications.types';

interface TypeLabel {
  label: string;
  action: string;
}

const FALLBACK_TYPE: TypeLabel = { label: 'Aviso', action: 'Ver' };

const TYPE_LABELS: Record<string, TypeLabel> = {
  GLOBAL: { label: 'Aviso da plataforma', action: 'Ver' },
  CATALOG_REQUEST: { label: 'Solicitação ao catálogo', action: 'Ver no Catálogo' },
  SELLER_PENDING: { label: 'Cadastro de vendedor', action: 'Ver cadastro' },
  SELLER_REVIEW: { label: 'Cadastro de vendedor', action: 'Ver cadastro' },
  USER_WARNED: { label: 'Advertência', action: 'Ver' },
  NEW_MESSAGE: { label: 'Nova mensagem', action: 'Responder' },
};

export function typeLabelOf(type: string): TypeLabel {
  return TYPE_LABELS[type] ?? FALLBACK_TYPE;
}

export const centralFilters: { value: NotificationFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'MESSAGES', label: 'Novas Mensagens' },
  { value: 'GROUPS', label: 'Convites de Grupos' },
  { value: 'PLATFORM', label: 'Avisos da Plataforma' },
];

export const bellFilters: { value: NotificationFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'UNREAD', label: 'Não lidas' },
  { value: 'ORDERS', label: 'Pedidos' },
  { value: 'GROUPS', label: 'Grupos' },
];

export const notificationsTexts = {
  eyebrow: 'NOTIFICAÇÕES E FAVORITOS',
  title: 'Notificações & Favoritos',
  description:
    'Acompanhe alertas em tempo real e acesse rapidamente seus álbuns, cartas raras e comunidades salvas.',
  unread: (count: number) => `${count} Não Lidas`,
  saved: 'Itens Salvos',
  markAllAsRead: 'Marcar todas como lidas',
  configureAlerts: 'Configurar Alertas',
  centralTab: 'Central de Notificações',
  favoritesTab: 'Meus Favoritos',
  newestFirst: 'Mais recentes primeiro',
  today: 'HOJE',
  earlier: 'ANTERIORES',
  loadMore: 'Carregar mais',
  markAsRead: 'Marcar como lida',
  moreActions: 'Mais ações',
  configureType: 'Configurar este tipo de alerta',
  empty: 'Nenhuma notificação encontrada',
  emptyHint: 'Avisaremos quando chegar algo novo.',
  allCaughtUp: 'Tudo em dia!',
  allCaughtUpHint: 'Você não tem notificações não lidas. Avisaremos quando chegar algo novo.',
  configureAlertsShort: 'Configurar alertas',
  loading: 'Carregando notificações…',
  loadError: 'Não foi possível carregar as notificações. Tente de novo.',
  unavailable: 'Este conteúdo não está mais disponível.',
  bellLabel: (count: number) => (count > 0 ? `Notificações, ${count} não lidas` : 'Notificações'),
  bellTitle: 'Notificações',
  bellNew: (count: number) => `${count} novas`,
  seeAll: 'Ver todas as notificações',
  close: 'Fechar',
};

interface EventGroup {
  icon: IconName;
  title: string;
  subtitle: string;
  events: { event: NotificationEvent; label: string; hint: string }[];
}

export const eventGroups: EventGroup[] = [
  {
    icon: 'swapHoriz',
    title: 'Pedidos e marketplace',
    subtitle: 'Compras, vendas e favoritos',
    events: [
      {
        event: 'ORDER_UPDATES',
        label: 'Pedido pago, enviado ou entregue',
        hint: 'O andamento das suas compras e vendas.',
      },
      {
        event: 'PAYOUT_RELEASED',
        label: 'Repasse liberado',
        hint: 'Quando o valor de uma venda vai para sua conta Stripe.',
      },
    ],
  },
  {
    icon: 'peopleOutline',
    title: 'Comunidades',
    subtitle: 'Convites e mensagens dos seus grupos',
    events: [
      {
        event: 'GROUP_INVITES',
        label: 'Convite para entrar em novo grupo',
        hint: 'Convites e solicitações de entrada nos seus grupos.',
      },
      {
        event: 'DIRECT_MESSAGES',
        label: 'Mensagem direta ou menção em chat comunitário',
        hint: 'Quando alguém menciona você no chat de um grupo.',
      },
    ],
  },
  {
    icon: 'autoAwesome',
    title: 'Plataforma e coleção',
    subtitle: 'Novos álbuns e o andamento das suas solicitações',
    events: [
      {
        event: 'CATALOG_RELEASES',
        label: 'Novo álbum oficial lançado ou checklist atualizado',
        hint: 'Lançamento de álbuns Panini, Topps ou Copa e adições de cards especiais à base de dados.',
      },
      {
        event: 'CATALOG_REQUESTS',
        label: 'Status de solicitação de nova carta/álbum em análise',
        hint: 'Notificação de aprovação ou revisão sobre itens que você sugeriu cadastrar na base.',
      },
    ],
  },
];

export const settingsTexts = {
  breadcrumb: ['Início', 'Minha conta', 'Configurações'],
  eyebrow: 'MINHA CONTA',
  activeChannels: (count: number) => `Canais ativos: ${count}`,
  title: 'Configurações',
  description: 'Senha, privacidade e onde receber cada aviso: no site ou por e-mail.',
  restore: 'Restaurar Padrões',
  channelsTitle: 'Canais de aviso',
  inAppTitle: 'In-App (Central & Sino)',
  inAppHint: 'Avisos em tempo real no sino do topo.',
  inAppFooter: 'Imediato',
  inAppBadge: (on: boolean) => `Badge: ${on ? 'Ativo' : 'Inativo'}`,
  emailTitle: 'E-mail',
  emailHint: 'Pedidos, segurança da conta e resumos.',
  emailFooter: 'Tempo Real / Imediato',
  changeEmail: 'Alterar e-mail',
  eventsTitle: 'Categorias e Eventos',
  eventsHint: 'Escolha onde receber cada aviso.',
  inAppColumn: 'In-App',
  emailColumn: 'E-mail',
  footerHint: 'As preferências valem em todos os seus acessos.',
  cancel: 'Cancelar',
  save: 'Salvar Preferências',
  saved: 'Preferências salvas.',
  restored: 'Padrões restaurados: tudo ligado.',
  saveError: 'Não foi possível salvar as preferências. Tente de novo.',
  loading: 'Carregando preferências…',
  loadError: 'Não foi possível carregar as preferências. Tente de novo.',
};
