import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { useRemoveUser } from '../../users.queries';
import type { UserSummary } from '../../users.types';

interface DeleteUserDialogProps {
  user: UserSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

interface DeleteUserDialogContentProps {
  user: UserSummary;
  onClose: () => void;
  onSaved: () => void;
}

function DeleteUserDialogContent({ user, onClose, onSaved }: DeleteUserDialogContentProps) {
  const removeUser = useRemoveUser();

  const confirm = (reason?: string) => {
    removeUser.mutate({ id: user.id, input: { reason: reason ?? '' } }, { onSuccess: onSaved });
  };

  return (
    <ConfirmDialog
      open
      title="Excluir usuário"
      message={`A conta de ${user.name} será excluída e pode ser restaurada depois, se for preciso.`}
      confirmLabel="Excluir"
      tone="danger"
      requireReason
      confirmationText={user.name}
      isConfirming={removeUser.isPending}
      errorMessage={removeUser.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}

export function DeleteUserDialog({ user, ...props }: DeleteUserDialogProps) {
  if (!user) return null;
  return <DeleteUserDialogContent user={user} {...props} />;
}
