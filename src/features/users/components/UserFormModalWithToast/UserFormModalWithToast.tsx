import { Toast } from '@/components/Toast/Toast';

import type { useUserFormModal } from '../../hooks/useUserFormModal';
import { useUserFormSubmission } from '../../hooks/useUserFormSubmission';
import { UserFormModal } from '../UserFormModal/UserFormModal';

interface UserFormModalWithToastProps {
  formModal: ReturnType<typeof useUserFormModal>;
}

export function UserFormModalWithToast({ formModal }: UserFormModalWithToastProps) {
  const submission = useUserFormSubmission(formModal.editingUser, formModal.saved);

  return (
    <>
      <UserFormModal
        open={formModal.isOpen}
        user={formModal.editingUser}
        isSaving={submission.isSaving}
        apiError={submission.apiError}
        onClose={formModal.close}
        onSubmit={submission.submit}
      />
      <Toast message={formModal.toastMessage} onDismiss={formModal.dismissToast} />
    </>
  );
}
