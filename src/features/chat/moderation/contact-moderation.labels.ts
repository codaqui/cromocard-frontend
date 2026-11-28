import type { ContactReportReason, ModerationOption } from './contact-moderation.types';

interface OptionLabels {
  label: string;
  hint: string;
  action: string;
  done: string;
  doneDetail: string;
}

export const moderationOptions: Record<ModerationOption, OptionLabels> = {
  block: {
    label: 'Somente bloquear',
    hint: 'Ele não poderá mais te enviar mensagens',
    action: 'Bloquear',
    done: 'Contato bloqueado',
    doneDetail: 'Ele não poderá mais te enviar mensagens.',
  },
  blockAndReport: {
    label: 'Bloquear e denunciar',
    hint: 'A moderação analisa a conversa',
    action: 'Bloquear e denunciar',
    done: 'Contato bloqueado e denunciado',
    doneDetail: 'A moderação vai analisar a conversa.',
  },
  report: {
    label: 'Somente denunciar',
    hint: 'A conversa continua aberta',
    action: 'Denunciar',
    done: 'Denúncia enviada',
    doneDetail: 'A moderação vai analisar a conversa.',
  },
};

export const MODERATION_OPTIONS = [
  'block',
  'blockAndReport',
  'report',
] as const satisfies readonly ModerationOption[];

export const CONTACT_REPORT_REASONS = [
  'Golpe / pagamento externo',
  'Assédio',
  'Spam',
  'Perfil falso',
] as const satisfies readonly ContactReportReason[];

export const MAX_EVIDENCES = 3;
export const MAX_EVIDENCE_SIZE_IN_BYTES = 4 * 1024 * 1024;
export const EVIDENCE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const DESCRIPTION_MAX_LENGTH = 500;

export const moderationTexts = {
  title: (handle: string) => `Bloquear ou denunciar ${handle}`,
  subtitle: 'Escolha o que fazer com este contato.',
  question: 'O que você quer fazer?',
  reason: 'Motivo da denúncia',
  description: 'Conte o que aconteceu',
  evidences: 'Prints da conversa',
  evidencesHint: 'Envie de 1 a 3 imagens: PNG, JPG ou WEBP, até 4 MB cada.',
  addEvidence: '+ Adicionar print',
  removeEvidence: (index: number) => `Remover o print ${index}`,
  footer: 'Você pode desbloquear em Configurações.',
  since: (month: string) => `conversa desde ${month}`,
  missingReason: 'Escolha o motivo da denúncia.',
  missingEvidence: 'Envie pelo menos um print da conversa.',
  invalidEvidence: 'Envie até 3 imagens PNG, JPG ou WEBP de até 4 MB cada.',
  alreadyReported: 'Você já denunciou este contato. A moderação está analisando.',
  failure: 'Não foi possível concluir. Tente de novo.',
  cancel: 'Cancelar',
  close: 'Fechar',
  blockedTitle: (handle: string) => `${handle} está bloqueado`,
  blockedMessage: 'Ele não pode te enviar mensagens. Desbloqueie para conversar de novo.',
  unblock: 'Desbloquear',
  unblocked: 'Contato desbloqueado',
  unblockedDetail: 'Vocês podem conversar de novo.',
  blockedByMe: (handle: string) =>
    `Você bloqueou ${handle}. Para conversar de novo, desbloqueie em Configurações › Privacidade.`,
  blockedByContact: (handle: string) =>
    `${handle} bloqueou você. Vocês não podem mais trocar mensagens.`,
  blockedContacts: 'Contatos bloqueados',
  blockedCount: (total: number) =>
    `${total} ${total === 1 ? 'contato bloqueado' : 'contatos bloqueados'}`,
  noBlockedContacts: 'Você não bloqueou ninguém.',
  blockedContactsError: 'Não foi possível carregar os contatos bloqueados.',
} as const;
