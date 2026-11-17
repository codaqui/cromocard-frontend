import styles from './NotificationsHeader.module.css';

/** Cabeçalho do frame 208-2380. */
export function NotificationsHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Notificação Global</h1>
      <p className={styles.subtitle}>
        Envie avisos para os usuários da plataforma, na hora ou agendados.
      </p>
    </header>
  );
}
