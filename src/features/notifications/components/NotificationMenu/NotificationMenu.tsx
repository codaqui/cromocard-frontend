import { useCallback, useId, useState } from 'react';
import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { useDismiss } from '@/hooks/useDismiss';
import { paths } from '@/routes/paths';

import { notificationsTexts } from '../../notifications.labels';
import styles from './NotificationMenu.module.css';

interface NotificationMenuProps {
  isRead: boolean;
  onMarkAsRead: () => void;
}

interface MenuListProps extends NotificationMenuProps {
  id: string;
  close: () => void;
}

function MenuList({ id, isRead, onMarkAsRead, close }: MenuListProps) {
  const markAsRead = () => {
    close();
    onMarkAsRead();
  };
  return (
    <div id={id} role="menu" className={styles.menu}>
      {!isRead && (
        <button type="button" role="menuitem" className={styles.item} onClick={markAsRead}>
          <Icon name="check" size={16} />
          {notificationsTexts.markAsRead}
        </button>
      )}
      <Link role="menuitem" className={styles.item} to={paths.settings} onClick={close}>
        <Icon name="settings" size={16} />
        {notificationsTexts.configureType}
      </Link>
    </div>
  );
}

export function NotificationMenu({ isRead, onMarkAsRead }: NotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useDismiss(isOpen, close);
  const menuId = useId();

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={notificationsTexts.moreActions}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="moreVert" size={18} />
      </button>
      {isOpen && <MenuList id={menuId} isRead={isRead} onMarkAsRead={onMarkAsRead} close={close} />}
    </div>
  );
}
