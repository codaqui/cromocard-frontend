import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { paths } from '@/routes/paths';

import { settingsTexts as t } from '../../notifications.labels';
import styles from './SettingsHeader.module.css';

interface SettingsHeaderProps {
  activeChannels: number;
  isRestoring: boolean;
  onRestore: () => void;
}

function Breadcrumb() {
  const [home, account, current] = t.breadcrumb;
  return (
    <nav aria-label="Trilha" className={styles.breadcrumb}>
      <Link to={paths.home}>
        <Icon name="homeOutline" size={14} />
        {home}
      </Link>
      <Icon name="chevronRight" size={14} />
      <Link to={paths.profile}>{account}</Link>
      <Icon name="chevronRight" size={14} />
      <span aria-current="page">{current}</span>
    </nav>
  );
}

export function SettingsHeader({ activeChannels, isRestoring, onRestore }: SettingsHeaderProps) {
  return (
    <header className={styles.wrapper}>
      <Breadcrumb />
      <div className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.chips}>
            <span className={styles.chip}>{t.eyebrow}</span>
            <span className={styles.activeChip}>
              <span className={styles.dot} aria-hidden="true" />
              {t.activeChannels(activeChannels)}
            </span>
          </p>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.description}>{t.description}</p>
        </div>
        <button type="button" className={styles.restore} disabled={isRestoring} onClick={onRestore}>
          <Icon name="restartAlt" size={16} />
          {t.restore}
        </button>
      </div>
    </header>
  );
}
