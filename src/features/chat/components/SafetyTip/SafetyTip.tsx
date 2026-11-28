import { Icon } from '@/components/Icon/Icon';

import { chatTexts } from '../../chat.labels';
import styles from './SafetyTip.module.css';

export function SafetyTip() {
  return (
    <aside className={styles.tip} aria-label={chatTexts.safetyTitle}>
      <Icon name="verifiedUser" size={18} />
      <div>
        <p className={styles.title}>{chatTexts.safetyTitle}</p>
        <p className={styles.message}>{chatTexts.safetyMessage}</p>
      </div>
    </aside>
  );
}
