import { Icon } from '@/components/Icon/Icon';

import styles from './SettingsHeader.module.css';

export function SettingsHeader() {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>
        <Icon name="tune" size={16} />
        Configurações
      </p>
      <h1 className={styles.title}>Configurações Globais</h1>
      <p className={styles.subtitle}>
        Banner da Home, categorias padrão, templates de notificação e metas da plataforma.
      </p>
    </header>
  );
}
