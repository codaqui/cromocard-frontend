import { Icon } from '@/components/Icon/Icon';

import styles from './ContactModerationDialog.module.css';

export function DialogBadge() {
  return (
    <span className={styles.badge} aria-hidden="true">
      <Icon name="block" size={18} />
    </span>
  );
}
