import { Toast } from '@/components/Toast/Toast';

import { DeleteUserDialog } from '../../components/DeleteUserDialog/DeleteUserDialog';
import { SuspendUserDialog } from '../../components/SuspendUserDialog/SuspendUserDialog';
import type { useUserActionDialogs } from '../../hooks/useUserActionDialogs';

interface UserActionDialogsWithToastProps {
  dialogs: ReturnType<typeof useUserActionDialogs>;
  onDeleted?: () => void;
}

export function UserActionDialogsWithToast({
  dialogs,
  onDeleted,
}: UserActionDialogsWithToastProps) {
  const handleDeleted = () => {
    dialogs.savedDelete();
    onDeleted?.();
  };

  return (
    <>
      <SuspendUserDialog
        user={dialogs.suspendTarget}
        onClose={dialogs.close}
        onSaved={dialogs.savedSuspend}
      />
      <DeleteUserDialog
        user={dialogs.deleteTarget}
        onClose={dialogs.close}
        onSaved={handleDeleted}
      />
      <Toast message={dialogs.toastMessage} onDismiss={dialogs.dismissToast} />
    </>
  );
}
