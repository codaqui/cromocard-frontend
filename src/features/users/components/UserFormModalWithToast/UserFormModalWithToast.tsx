import { Toast } from '@/components/Toast/Toast';

import type { useUserFormModal } from '../../hooks/useUserFormModal';
import { UserFormModal } from '../UserFormModal/UserFormModal';

interface UserFormModalWithToastProps {
  formModal: ReturnType<typeof useUserFormModal>;
}

export function UserFormModalWithToast({ formModal }: UserFormModalWithToastProps) {
  return (
    <>
      <UserFormModal
        open={formModal.isOpen}
        user={formModal.editingUser}
        onClose={formModal.close}
        onSaved={formModal.saved}
      />
      <Toast message={formModal.toastMessage} onDismiss={formModal.dismissToast} />
    </>
  );
}
