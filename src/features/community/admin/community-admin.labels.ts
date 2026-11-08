import type { IconName } from '@/components/Icon/icon-paths';

import type { GroupStatus, GroupToggleAction, ModerationKind } from './community-admin.types';

interface GroupStatusLook {
  label: string;
  icon: IconName;
  dimmed: boolean;
  toggle: { action: GroupToggleAction; label: string; icon: IconName };
}

export const groupStatusLooks: Record<GroupStatus, GroupStatusLook> = {
  ACTIVE: {
    label: 'Ativo',
    icon: 'users',
    dimmed: false,
    toggle: { action: 'suspend', label: 'Suspender', icon: 'pauseCircle' },
  },
  SUSPENDED: {
    label: 'Suspenso',
    icon: 'block',
    dimmed: true,
    toggle: { action: 'reactivate', label: 'Reativar', icon: 'refresh' },
  },
};

export const groupStatusFilterOptions: { value: GroupStatus | ''; label: string }[] = [
  { value: '', label: 'Status: Todos' },
  { value: 'ACTIVE', label: 'Status: Ativo' },
  { value: 'SUSPENDED', label: 'Status: Suspenso' },
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
