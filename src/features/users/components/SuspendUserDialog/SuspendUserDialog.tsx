import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { toReasonInput } from '../../users.schemas';
import { useReactivateUser, useSuspendUser } from '../../users.queries';
import type { UserSummary } from '../../users.types';

interface SuspendUserDialogProps {
  user: UserSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

interface SuspendCopy {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
}

function copyFor(user: UserSummary): SuspendCopy {
  if (user.status === 'SUSPENDED') {
    return {
      title: 'Reativar usuário',
      message: `${user.name} volta a poder entrar na plataforma.`,
      confirmLabel: 'Reativar',
      tone: 'primary',
    };
  }

  return {
    title: 'Suspender usuário',
    message: `${user.name} não poderá entrar enquanto estiver suspenso.`,
    confirmLabel: 'Suspender',
    tone: 'danger',
  };
}

interface SuspendUserDialogContentProps {
  user: UserSummary;
  onClose: () => void;
  onSaved: () => void;
}

function SuspendUserDialogContent({ user, onClose, onSaved }: SuspendUserDialogContentProps) {
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const mutation = user.status === 'SUSPENDED' ? reactivateUser : suspendUser;
  const copy = copyFor(user);

  const confirm = (reason?: string) => {
    mutation.mutate({ id: user.id, input: toReasonInput(reason) }, { onSuccess: onSaved });
  };

  return (
    <ConfirmDialog
      open
      title={copy.title}
      message={copy.message}
      confirmLabel={copy.confirmLabel}
      tone={copy.tone}
      requireReason
      isConfirming={mutation.isPending}
      errorMessage={mutation.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}

export function SuspendUserDialog({ user, ...props }: SuspendUserDialogProps) {
  if (!user) return null;
  return <SuspendUserDialogContent user={user} {...props} />;
}
