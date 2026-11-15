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
      title: 'Reativar usuário?',
      message: `${user.name}${user.username ? ` (@${user.username})` : ''} está Suspenso. Ao reativar, o status volta para Ativo e a ação fica registrada no log de auditoria.`,
      confirmLabel: 'Reativar usuário',
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

function useSuspendOrReactivate(user: UserSummary, onSaved: () => void) {
  const isReactivating = user.status === 'SUSPENDED';
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const mutation = isReactivating ? reactivateUser : suspendUser;

  const confirm = (reason?: string) => {
    if (isReactivating) {
      reactivateUser.mutate(user.id, { onSuccess: onSaved });
      return;
    }
    suspendUser.mutate({ id: user.id, input: toReasonInput(reason) }, { onSuccess: onSaved });
  };

  return { isReactivating, mutation, confirm };
}

function SuspendUserDialogContent({ user, onClose, onSaved }: SuspendUserDialogContentProps) {
  const { isReactivating, mutation, confirm } = useSuspendOrReactivate(user, onSaved);
  const copy = copyFor(user);

  return (
    <ConfirmDialog
      open
      title={copy.title}
      message={copy.message}
      confirmLabel={copy.confirmLabel}
      tone={copy.tone}
      requireReason={!isReactivating}
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
