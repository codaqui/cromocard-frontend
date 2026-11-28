import { cn } from '@/utils/cn';

import { initialOf, initialsOf } from '../../chat.format';
import styles from './ContactAvatar.module.css';

interface ContactAvatarProps {
  name: string;
  avatarUrl: string | null;
  online?: boolean;
  size?: 'regular' | 'small' | 'round';
}

const lettersOf = (name: string, size: ContactAvatarProps['size']) =>
  size === 'round' ? initialsOf(name) : initialOf(name);

export function ContactAvatar({ name, avatarUrl, online, size = 'regular' }: ContactAvatarProps) {
  return (
    <span className={cn(styles.avatar, styles[size])}>
      {avatarUrl ? <img src={avatarUrl} alt="" className={styles.photo} /> : lettersOf(name, size)}
      {online !== undefined && (
        <span
          className={cn(styles.dot, online && styles.online)}
          role="img"
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </span>
  );
}
