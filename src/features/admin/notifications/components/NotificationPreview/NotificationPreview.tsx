import logo from '@/components/BrandLogo/cromocard-logo.svg';
import { Icon } from '@/components/Icon/Icon';

import styles from './NotificationPreview.module.css';

interface NotificationPreviewProps {
  title: string;
  content: string;
}

function PreviewItem({ title, content }: NotificationPreviewProps) {
  return (
    <article className={styles.item} aria-label="Pré-visualização da notificação">
      <div className={styles.itemTop}>
        <img className={styles.logo} src={logo} alt="CromoCard" width={60} height={10} />
        <span className={styles.time}>agora</span>
      </div>
      <div className={styles.itemBody}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="notifications" size={22} />
        </span>
        <div className={styles.texts}>
          <p className={styles.title}>{title.trim() || 'Título da notificação'}</p>
          <p className={styles.content}>{content.trim() || 'A mensagem aparece aqui.'}</p>
        </div>
      </div>
    </article>
  );
}

/** Como a notificação aparece na central de notificações (frame 208-2380; CCD060 R17, L13). */
export function NotificationPreview(props: NotificationPreviewProps) {
  return (
    <section className={styles.card} aria-labelledby="notification-preview">
      <h2 id="notification-preview" className={styles.heading}>
        <Icon name="visibility" size={22} />
        Como aparece na central de notificações
      </h2>
      <div className={styles.center}>
        <p className={styles.centerTitle}>Notificações</p>
        <PreviewItem {...props} />
      </div>
    </section>
  );
}
