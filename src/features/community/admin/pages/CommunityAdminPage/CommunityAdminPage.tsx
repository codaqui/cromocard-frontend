import { useState } from 'react';

import type { CommunityAction } from '../../community-admin.types';
import { CommunityOverview } from '../../components/CommunityOverview/CommunityOverview';
import { GroupsSection } from '../../components/GroupsSection/GroupsSection';
import { ModerationQueue } from '../../components/ModerationQueue/ModerationQueue';
import styles from './CommunityAdminPage.module.css';

export function CommunityAdminPage() {
  const [, setPendingAction] = useState<CommunityAction | null>(null);

  return (
    <section className={styles.page}>
      <CommunityOverview />
      <GroupsSection onAction={setPendingAction} />
      <ModerationQueue onAction={setPendingAction} />
    </section>
  );
}
