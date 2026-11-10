import { useState } from 'react';

import { Checkbox } from '@/components/Checkbox/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Icon } from '@/components/Icon/Icon';

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
  const firstName = user.name.trim().split(/\s+/)[0] ?? '';
  return `EXCLUIR-${firstName.toUpperCase()}`;
}

interface DeleteUserDialogMessageProps {
  user: UserSummary;
  aware: boolean;
  onAwareChange: (aware: boolean) => void;
}

function DeleteUserDialogMessage({ user, aware, onAwareChange }: DeleteUserDialogMessageProps) {
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
      <Checkbox
        label={`Estou ciente de que a conta de ${user.name} será excluída`}
        checked={aware}
        onChange={(event) => onAwareChange(event.target.checked)}
      />
    </div>
  );
}

function useDeleteConfirm(user: UserSummary, onSaved: () => void) {
  const removeUser = useRemoveUser();
  const [aware, setAware] = useState(false);
  const [awareError, setAwareError] = useState<string>();

  const confirm = (reason?: string) => {
    if (!aware) {
      setAwareError('Marque que está ciente da exclusão antes de confirmar');
      return;
    }
    removeUser.mutate({ id: user.id, input: { reason: reason ?? '' } }, { onSuccess: onSaved });
  };

  return { removeUser, aware, setAware, awareError, confirm };
}

function DeleteUserDialogContent({ user, onClose, onSaved }: DeleteUserDialogContentProps) {
  const { removeUser, aware, setAware, awareError, confirm } = useDeleteConfirm(user, onSaved);

  return (
    <ConfirmDialog
      open
      title="Excluir usuário"
      message={<DeleteUserDialogMessage user={user} aware={aware} onAwareChange={setAware} />}
      confirmLabel="Excluir"
      tone="danger"
      requireReason
      confirmationText={confirmationTextFor(user)}
      isConfirming={removeUser.isPending}
      errorMessage={awareError ?? removeUser.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}

export function DeleteUserDialog({ user, ...props }: DeleteUserDialogProps) {
  if (!user) return null;
  return <DeleteUserDialogContent user={user} {...props} />;
}
