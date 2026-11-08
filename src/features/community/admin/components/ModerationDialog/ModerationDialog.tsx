import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { formatGroupCode } from '../../community-admin.format';
import { type ModerationText, moderationTexts } from '../../community-admin.labels';
import type { CommunityAction } from '../../community-admin.types';
import { useModerationMutations } from '../../hooks/useModerationMutations';
import styles from './ModerationDialog.module.css';

interface ModerationDialogProps {
  action: CommunityAction | null;
  onClose: () => void;
  onDone: (message: string) => void;
}

interface ModerationDialogContentProps extends Omit<ModerationDialogProps, 'action'> {
  action: CommunityAction;
}

function targetIdOf(action: CommunityAction): string {
  return action.kind === 'group' ? action.group.id : action.report.id;
}

function TargetDescription({ action }: { action: CommunityAction }) {
  if (action.kind === 'group') {
    return (
      <p className={styles.target}>
        Grupo <strong>{action.group.name}</strong> · ID{' '}
        <code className={styles.code}>{formatGroupCode(action.group.id)}</code>
      </p>
    );
  }

  return (
    <p className={styles.target}>
      Mensagem de <strong>{action.report.message?.authorName}</strong> no grupo{' '}
      <strong>{action.report.message?.groupName}</strong>.
    </p>
  );
}

function ModerationIcon({ text }: { text: ModerationText }) {
  return (
    <span className={cn(styles.badge, styles[text.tone])} aria-hidden="true">
      <Icon name={text.icon} size={20} />
    </span>
  );
}

function ModerationMessage({ action, text }: { action: CommunityAction; text: ModerationText }) {
  return (
    <div className={styles.message}>
      <TargetDescription action={action} />
      <div className={styles.impacts}>
        <p className={styles.impactsTitle}>
          <Icon name="gavel" size={12} />
          Impactos imediatos
        </p>
        <p>{text.impact}</p>
      </div>
    </div>
  );
}

function moderationDialogLook(action: CommunityAction, text: ModerationText) {
  return {
    title: text.title,
    icon: <ModerationIcon text={text} />,
    eyebrow: <p className={cn(styles.eyebrow, styles[text.tone])}>{text.eyebrow}</p>,
    message: <ModerationMessage action={action} text={text} />,
    confirmLabel: text.confirmLabel,
    cancelLabel: text.cancelLabel,
    tone: text.tone === 'info' ? ('primary' as const) : ('danger' as const),
  };
}

function ModerationDialogContent({ action, onClose, onDone }: ModerationDialogContentProps) {
  const mutation = useModerationMutations()[action.action];
  const text = moderationTexts[action.action];

  const confirm = (reason?: string) =>
    mutation.mutate(
      { id: targetIdOf(action), reason: reason ?? '' },
      { onSuccess: () => onDone(text.done) },
    );

  return (
    <ConfirmDialog
      open
      {...moderationDialogLook(action, text)}
      actionsLayout="spread"
      requireReason
      reasonLabel="Motivo"
      isConfirming={mutation.isPending}
      errorMessage={mutation.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}

export function ModerationDialog({ action, ...props }: ModerationDialogProps) {
  if (!action) return null;
  const key = `${action.action}-${targetIdOf(action)}`;
  return <ModerationDialogContent key={key} action={action} {...props} />;
}
