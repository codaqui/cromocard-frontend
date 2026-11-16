import type { IconName } from '@/components/Icon/icon-paths';

import type {
  GroupAction,
  GroupStatus,
  ModerationKind,
  ReportSeverity,
} from './community-admin.types';

interface GroupStatusLook {
  label: string;
  icon: IconName;
  dimmed: boolean;
}

export const groupStatusLooks: Record<GroupStatus, GroupStatusLook> = {
  ACTIVE: { label: 'Ativo', icon: 'users', dimmed: false },
  WARNED: { label: 'Advertido', icon: 'reports', dimmed: false },
  SUSPENDED: { label: 'Suspenso', icon: 'block', dimmed: true },
};

interface GroupStatusAction {
  action: GroupAction;
  label: string;
  icon: IconName;
}

export const groupStatusActions: Record<GroupStatus, GroupStatusAction[]> = {
  ACTIVE: [
    { action: 'warn', label: 'Advertir', icon: 'reports' },
    { action: 'suspend', label: 'Suspender', icon: 'pauseCircle' },
  ],
  WARNED: [
    { action: 'reactivate', label: 'Reativar', icon: 'refresh' },
    { action: 'suspend', label: 'Suspender', icon: 'pauseCircle' },
  ],
  SUSPENDED: [{ action: 'reactivate', label: 'Reativar', icon: 'refresh' }],
};

export const groupStatusFilterOptions: { value: GroupStatus | ''; label: string }[] = [
  { value: '', label: 'Status: Todos' },
  { value: 'ACTIVE', label: 'Status: Ativo' },
  { value: 'WARNED', label: 'Status: Advertido' },
  { value: 'SUSPENDED', label: 'Status: Suspenso' },
];

export const severityFilterOptions: { value: ReportSeverity; label: string }[] = [
  { value: 'CRITICAL', label: 'Críticos' },
  { value: 'SPAM', label: 'Spam' },
];

export type ModerationTone = 'warning' | 'info' | 'danger';

export interface ModerationText {
  eyebrow: string;
  title: string;
  impact: string;
  confirmLabel: string;
  cancelLabel: string;
  done: string;
  tone: ModerationTone;
  confirmTone: 'primary' | 'danger';
  icon: IconName;
}

export const moderationTexts: Record<ModerationKind, ModerationText> = {
  warn: {
    eyebrow: 'Sanção de grupo',
    title: 'Advertir o grupo?',
    impact: 'O grupo recebe o selo "Advertido" e continua funcionando. Reativar tira o selo.',
    confirmLabel: 'Sim, Advertir Grupo',
    cancelLabel: 'Cancelar e Manter Grupo',
    done: 'Grupo advertido com sucesso.',
    tone: 'warning',
    confirmTone: 'danger',
    icon: 'reports',
  },
  suspend: {
    eyebrow: 'Sanção de grupo',
    title: 'Suspender o grupo?',
    impact: 'O grupo some de Explorar e fica só para leitura dos membros até ser reativado.',
    confirmLabel: 'Sim, Suspender Grupo',
    cancelLabel: 'Cancelar e Manter Grupo',
    done: 'Grupo suspenso com sucesso.',
    tone: 'warning',
    confirmTone: 'danger',
    icon: 'pauseCircle',
  },
  reactivate: {
    eyebrow: 'Reativação de grupo',
    title: 'Reativar o grupo?',
    impact: 'O grupo volta a aparecer em Explorar e os membros voltam a conversar.',
    confirmLabel: 'Sim, Reativar Grupo',
    cancelLabel: 'Cancelar e Manter Suspenso',
    done: 'Grupo reativado com sucesso.',
    tone: 'info',
    confirmTone: 'primary',
    icon: 'refresh',
  },
  delete: {
    eyebrow: 'Alerta crítico de protocolo',
    title: 'Excluir o grupo?',
    impact: 'O grupo some para todos, com os membros e as mensagens. O registro fica guardado.',
    confirmLabel: 'Sim, Excluir Grupo',
    cancelLabel: 'Cancelar e Manter Grupo',
    done: 'Grupo excluído com sucesso.',
    tone: 'danger',
    confirmTone: 'danger',
    icon: 'delete',
  },
  removeMessage: {
    eyebrow: 'Moderação de mensagem',
    title: 'Remover a mensagem?',
    impact: 'A mensagem some do chat do grupo e a denúncia fica resolvida em seu nome.',
    confirmLabel: 'Sim, Remover Mensagem',
    cancelLabel: 'Cancelar e Manter Mensagem',
    done: 'Mensagem removida e denúncia resolvida.',
    tone: 'warning',
    confirmTone: 'danger',
    icon: 'warning',
  },
  removeAndWarn: {
    eyebrow: 'Moderação de mensagem',
    title: 'Remover a mensagem e advertir o autor?',
    impact: 'A mensagem some do grupo, o autor recebe uma advertência e a denúncia fica resolvida.',
    confirmLabel: 'Sim, Remover e Advertir',
    cancelLabel: 'Cancelar e Manter Mensagem',
    done: 'Mensagem removida e autor advertido.',
    tone: 'warning',
    confirmTone: 'danger',
    icon: 'reports',
  },
  dismiss: {
    eyebrow: 'Triagem de denúncia',
    title: 'Dispensar a denúncia?',
    impact: 'A mensagem continua no chat e a denúncia sai da fila como dispensada.',
    confirmLabel: 'Sim, Dispensar Denúncia',
    cancelLabel: 'Cancelar e Manter na Fila',
    done: 'Denúncia dispensada com sucesso.',
    tone: 'info',
    confirmTone: 'primary',
    icon: 'checkCircle',
  },
};
