import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import { type AuditActionTone, auditActionMeta } from '../../audit-logs.labels';
import styles from './AuditActionBadge.module.css';

const TONE_ICON: Record<AuditActionTone, IconName> = {
  danger: 'personOff',
  warning: 'folder',
  info: 'verifiedUser',
  primary: 'checkCircle',
  neutral: 'shield',
};

export function AuditActionBadge({ action }: { action: string }) {
  const { label, tone } = auditActionMeta(action);

  return (
    <span className={cn(styles.badge, styles[tone])} data-tone={tone}>
      <Icon name={TONE_ICON[tone]} size={14} />
      {label}
    </span>
  );
}
