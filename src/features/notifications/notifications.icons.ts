import type { IconName } from '@/components/Icon/icon-paths';

import type { NotificationCategory } from './notifications.types';

export const categoryIcons: Record<NotificationCategory, IconName> = {
  MESSAGES: 'forum',
  GROUPS: 'peopleOutline',
  PLATFORM: 'autoAwesome',
  ORDERS: 'localShipping',
};
