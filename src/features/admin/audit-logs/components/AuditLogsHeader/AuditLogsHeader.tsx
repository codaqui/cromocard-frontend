import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';

import styles from './AuditLogsHeader.module.css';

const EXPORT_HINT = 'A extração dos logs chega com a CCD102.';

export function AuditLogsHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Logs do sistema</h1>
        <p className={styles.subtitle}>
          Registro de alta integridade contendo todas as intervenções disciplinares, remoções de
          grupos e alterações de permissões pela equipe técnica e de moderação.
        </p>
      </div>
      <span className={styles.export} title={EXPORT_HINT}>
        <Button disabled aria-description={EXPORT_HINT}>
          <Icon name="download" size={18} />
          Extrair Logs
        </Button>
      </span>
    </header>
  );
}
