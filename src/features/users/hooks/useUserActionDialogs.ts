import { useState } from 'react';

import { userActionMessages } from '../users.labels';
import type { UserSummary } from '../users.types';

type ActionDialog = 'suspend' | 'delete' | null;

function suspendMessageFor(target: UserSummary): string {
  return target.status === 'SUSPENDED'
    ? userActionMessages.reactivated
    : userActionMessages.suspended;
}

interface DialogState {
  target: UserSummary | null;
  setTarget: (target: UserSummary | null) => void;
  dialog: ActionDialog;
  setDialog: (dialog: ActionDialog) => void;
  setToastMessage: (message: string | null) => void;
}

function closeDialog({ setTarget, setDialog }: DialogState) {
  setTarget(null);
  setDialog(null);
}

function buildActions(state: DialogState) {
  return {
    openSuspend: (user: UserSummary) => {
      state.setTarget(user);
      state.setDialog('suspend');
    },
    openDelete: (user: UserSummary) => {
      state.setTarget(user);
      state.setDialog('delete');
    },
    close: () => closeDialog(state),
    savedSuspend: () => {
      state.setToastMessage(suspendMessageFor(state.target!));
      closeDialog(state);
    },
    savedDelete: () => {
      state.setToastMessage(userActionMessages.removed);
      closeDialog(state);
    },
  };
}

export function useUserActionDialogs() {
  const [target, setTarget] = useState<UserSummary | null>(null);
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return {
    suspendTarget: dialog === 'suspend' ? target : null,
    deleteTarget: dialog === 'delete' ? target : null,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    ...buildActions({ target, setTarget, dialog, setDialog, setToastMessage }),
  };
}
