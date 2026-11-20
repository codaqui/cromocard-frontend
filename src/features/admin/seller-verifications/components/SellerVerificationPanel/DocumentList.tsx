import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { formatDate } from '@/utils/formatDate';

import { documentTypeLabels } from '../../seller-verifications.labels';
import type { SellerDocument } from '../../seller-verifications.types';
import styles from './SellerVerificationPanel.module.css';

interface DocumentListProps {
  documents: SellerDocument[];
  isValidating: boolean;
  errorMessage?: string;
  onValidate: (documentId: string) => void;
}

function DocumentStatus({ document }: { document: SellerDocument }) {
  if (document.status === 'VALIDATED') {
    return (
      <span className={styles.documentValidated}>
        Validado {document.validatedAt && `em ${formatDate(document.validatedAt)}`}
      </span>
    );
  }
  return <span className={styles.documentPending}>Enviado, aguardando validação</span>;
}

function DocumentActions({
  document,
  isValidating,
  onValidate,
}: {
  document: SellerDocument;
  isValidating: boolean;
  onValidate: (documentId: string) => void;
}) {
  return (
    <div className={styles.documentActions}>
      <a href={document.fileUrl} target="_blank" rel="noreferrer" className={styles.documentLink}>
        Visualizar
      </a>
      {document.status === 'SUBMITTED' && (
        <Button variant="secondary" disabled={isValidating} onClick={() => onValidate(document.id)}>
          Validar
        </Button>
      )}
    </div>
  );
}

function DocumentItem({
  document,
  isValidating,
  onValidate,
}: {
  document: SellerDocument;
  isValidating: boolean;
  onValidate: (documentId: string) => void;
}) {
  return (
    <li className={styles.documentItem}>
      <div>
        <p className={styles.documentType}>{documentTypeLabels[document.type] ?? document.type}</p>
        <DocumentStatus document={document} />
      </div>
      <DocumentActions document={document} isValidating={isValidating} onValidate={onValidate} />
    </li>
  );
}

export function DocumentList({
  documents,
  isValidating,
  errorMessage,
  onValidate,
}: DocumentListProps) {
  if (documents.length === 0) {
    return <p className={styles.emptyHint}>Nenhum documento enviado.</p>;
  }

  return (
    <>
      <ul className={styles.documentList}>
        {documents.map((document) => (
          <DocumentItem
            key={document.id}
            document={document}
            isValidating={isValidating}
            onValidate={onValidate}
          />
        ))}
      </ul>
      <FormError message={errorMessage} />
    </>
  );
}
