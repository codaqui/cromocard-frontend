import { useState } from 'react';

import { Checkbox } from '@/components/Checkbox/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Icon } from '@/components/Icon/Icon';

import { toReasonInput } from '../../users.schemas';
import { useRemoveUser } from '../../users.queries';
import type { UserSummary } from '../../users.types';
import styles from './DeleteUserDialog.module.css';

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

function confirmationTextFor(user: UserSummary): string {
  const firstName = user.name.trim().split(/\s+/)[0]!;
  return `EXCLUIR-${firstName.toUpperCase()}`;
}

function DeleteUserDialogMessage({ user }: { user: UserSummary }) {
  return (
    <div className={styles.message}>
      <div className={styles.intro}>
        <div className={styles.badge}>
          <Icon name="delete" size={20} />
        </div>
        <p>A conta de {user.name} será excluída e pode ser restaurada depois, se for preciso.</p>
      </div>
      <div className={styles.impacts}>
        <p className={styles.impactsTitle}>Impactos imediatos</p>
        <p>O acesso deste usuário é removido na hora e as sessões ativas são encerradas.</p>
      </div>
    </div>
  );
}

function DeleteUserDialogAwareCheckbox({
  user,
  aware,
  onAwareChange,
}: {
  user: UserSummary;
  aware: boolean;
  onAwareChange: (aware: boolean) => void;
}) {
  return (
    <Checkbox
      label={`Estou ciente de que a conta de ${user.name} será excluída`}
      checked={aware}
      onChange={(event) => onAwareChange(event.target.checked)}
    />
  );
}

function useDeleteConfirm(user: UserSummary, onSaved: () => void) {
  const removeUser = useRemoveUser();
  const [aware, setAware] = useState(false);

  const confirm = (reason?: string) => {
    removeUser.mutate({ id: user.id, input: toReasonInput(reason) }, { onSuccess: onSaved });
  };

  return { removeUser, aware, setAware, confirm };
}

function DeleteUserDialogContent({ user, onClose, onSaved }: DeleteUserDialogContentProps) {
  const { removeUser, aware, setAware, confirm } = useDeleteConfirm(user, onSaved);

  return (
    <ConfirmDialog
      open
      title="Excluir usuário"
      message={<DeleteUserDialogMessage user={user} />}
      confirmLabel="Excluir"
      tone="danger"
      requireReason
      confirmationText={confirmationTextFor(user)}
      extraFields={
        <DeleteUserDialogAwareCheckbox user={user} aware={aware} onAwareChange={setAware} />
      }
      canConfirm={aware}
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
