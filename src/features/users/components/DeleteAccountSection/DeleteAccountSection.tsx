import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';

import { useDeleteMe } from '../../users.queries';
import styles from './DeleteAccountSection.module.css';

interface ConfirmDeletionProps {
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeletion({ isDeleting, onConfirm, onCancel }: ConfirmDeletionProps) {
  return (
    <div className={styles.actions}>
      <Button variant="danger" disabled={isDeleting} onClick={onConfirm}>
        Confirmar exclusão
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}

export function DeleteAccountSection() {
  const [isConfirming, setIsConfirming] = useState(false);
  const deleteMe = useDeleteMe();
  const { signOut } = useAuth();

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Excluir conta</h2>
      <p className={styles.description}>Sua conta e seus dados deixam de aparecer na plataforma.</p>
      {deleteMe.error && <p className={styles.error}>{deleteMe.error.message}</p>}
      {isConfirming ? (
        <ConfirmDeletion
          isDeleting={deleteMe.isPending}
          onConfirm={() => deleteMe.mutate(undefined, { onSuccess: signOut })}
          onCancel={() => setIsConfirming(false)}
        />
      ) : (
        <Button variant="danger" onClick={() => setIsConfirming(true)}>
          Excluir minha conta
        </Button>
      )}
    </section>
  );
}
