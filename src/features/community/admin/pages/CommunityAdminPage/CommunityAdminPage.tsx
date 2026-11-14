import { useState } from 'react';

import { Toast } from '@/components/Toast/Toast';

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

export function CommunityAdminPage() {
  const flow = useModerationFlow();

  return (
    <section className={styles.page}>
      <CommunityOverview />
      <GroupsSection onAction={flow.open} />
      <ModerationQueue onAction={flow.open} />
      <ModerationDialog action={flow.pendingAction} onClose={flow.close} onDone={flow.done} />
      <Toast message={flow.doneMessage} onDismiss={flow.dismissMessage} />
    </section>
  );
}
