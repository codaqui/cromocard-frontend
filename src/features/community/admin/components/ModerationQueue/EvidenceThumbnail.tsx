import { useObjectUrl } from '@/hooks/useObjectUrl';

import { useReportEvidence } from '../../community-admin.queries';
import styles from './ModerationQueue.module.css';

interface EvidenceThumbnailProps {
  reportId: string;
  evidenceId: string;
  position: number;
}

export function EvidenceThumbnail({ reportId, evidenceId, position }: EvidenceThumbnailProps) {
  const { data, isError } = useReportEvidence(reportId, evidenceId);
  const url = useObjectUrl(data);
  const label = `Print ${position} da conversa`;

  if (isError) {
    return (
      <span className={styles.evidence} role="img" aria-label={`${label} indisponível`}>
        <span className={styles.evidenceStatus}>Indisponível</span>
      </span>
    );
  }
  if (!url) {
    return <span className={styles.evidence} aria-busy="true" aria-label={`Carregando ${label}`} />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={styles.evidence}>
      <img src={url} alt={label} />
    </a>
  );
}
