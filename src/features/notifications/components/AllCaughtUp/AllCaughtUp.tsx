import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { paths } from '@/routes/paths';

import { notificationsTexts as t } from '../../notifications.labels';
import styles from './AllCaughtUp.module.css';

interface AllCaughtUpProps {
  title: string;
  message: string;
}

export function AllCaughtUp({ title, message }: AllCaughtUpProps) {
  return (
    <section className={styles.card} aria-label={title}>
      <span className={styles.badge} aria-hidden="true">
        <Icon name="check" size={28} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <Link to={paths.settings} className={styles.link}>
        <Icon name="settings" size={14} />
        {t.configureAlertsShort}
      </Link>
    </section>
  );
}
