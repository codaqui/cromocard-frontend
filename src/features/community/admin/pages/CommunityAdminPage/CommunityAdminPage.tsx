import { useState } from 'react';

import { Toast } from '@/components/Toast/Toast';
import { SanctionDialog, type SanctionTarget } from '@/features/users';

import type { CommunityAction } from '../../community-admin.types';
import { CommunityOverview } from '../../components/CommunityOverview/CommunityOverview';
import { GroupsSection } from '../../components/GroupsSection/GroupsSection';
import { ModerationDialog } from '../../components/ModerationDialog/ModerationDialog';
import { ModerationQueue } from '../../components/ModerationQueue/ModerationQueue';
import styles from './CommunityAdminPage.module.css';

function useModerationFlow() {
  const [pendingAction, setPendingAction] = useState<CommunityAction | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  return {
    pendingAction,
    doneMessage,
    open: setPendingAction,
    close: () => setPendingAction(null),
    done: (message: string) => {
      setPendingAction(null);
      setDoneMessage(message);
    },
    dismissMessage: () => setDoneMessage(null),
  };
}

function useAuthorSanctionDialog() {
  const [target, setTarget] = useState<SanctionTarget | null>(null);

  return {
    target,
    open: setTarget,
    close: () => setTarget(null),
  };
}

export function CommunityAdminPage() {
  const flow = useModerationFlow();
  const sanctionDialog = useAuthorSanctionDialog();

  const sanctioned = () => {
    sanctionDialog.close();
    flow.done('Sanção aplicada ao autor da mensagem.');
  };

  return (
    <section className={styles.page}>
      <CommunityOverview />
      <GroupsSection onAction={flow.open} />
      <ModerationQueue onAction={flow.open} onSanctionAuthor={sanctionDialog.open} />
      <ModerationDialog action={flow.pendingAction} onClose={flow.close} onDone={flow.done} />
      <SanctionDialog
        target={sanctionDialog.target}
        onClose={sanctionDialog.close}
        onSaved={sanctioned}
      />
      <Toast message={flow.doneMessage} onDismiss={flow.dismissMessage} />
    </section>
  );
}
