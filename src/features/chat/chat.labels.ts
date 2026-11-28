import type { ContactScope, ConversationFilter } from './chat.types';

export const filterLabels: Record<ConversationFilter, string> = {
  all: 'Todas',
  unread: 'Não Lidas',
};

export const scopeLabels: Record<ContactScope, string> = {
  all: 'Todos',
  groups: 'Dos meus grupos',
  sellers: 'Lojistas',
  deals: 'Já negociei',
};

export const chatTexts = {
  eyebrow: 'Mensagens',
  subtitle: 'Chat pessoal com outros colecionadores',
  emptyTitle: 'Nenhuma conversa ainda',
  emptyMessage: 'Toque em "Nova conversa" para falar em particular com outro colecionador.',
  loadError: 'Não foi possível carregar as mensagens.',
  sendError: 'A mensagem não foi enviada. Tente de novo.',
  safetyTitle: 'Dica de segurança',
  safetyMessage:
    'Nunca pague por Pix ou link fora da CromoCard. Compre pelo anúncio no marketplace: o pagamento fica retido até a entrega.',
  marketplaceNotice: 'Faça compras e pagamentos só pelo marketplace da CromoCard.',
  verified: 'Verificado',
  newConversation: 'Nova conversa',
  newConversationSubtitle: 'Envie uma mensagem privada para outro colecionador.',
  startError: 'Não foi possível abrir a conversa. Tente de novo.',
  noResults: 'Nenhum colecionador encontrado.',
  selectConversation: 'Selecione uma conversa para ver as mensagens.',
  reply: 'Responder',
  messageActions: 'Ações da mensagem',
  cancelReply: 'Cancelar resposta',
  blankMessage: 'Digite uma mensagem antes de enviar',
  replyUnavailable: 'A mensagem que você está respondendo não está mais disponível.',
  quoteUnavailable: 'Mensagem indisponível',
} as const;

export const replyingTo = (handle: string) => `Respondendo a ${handle}`;
