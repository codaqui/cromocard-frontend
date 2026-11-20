import { useState } from 'react';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Drawer } from '@/components/Drawer/Drawer';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { FormError } from '@/components/FormError/FormError';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Tabs } from '@/components/Tabs/Tabs';
import { Toast } from '@/components/Toast/Toast';
import { formatDate } from '@/utils/formatDate';

import {
  canDecide,
  sellerVerificationMessages,
  statusLabels,
  statusTones,
} from '../../seller-verifications.labels';
import {
  useAddSellerVerificationNote,
  useApproveSellerVerification,
  useRejectSellerVerification,
  useSellerVerification,
  useValidateSellerDocument,
} from '../../seller-verifications.queries';
import type { SellerVerificationDetail } from '../../seller-verifications.types';
import { DocumentList } from './DocumentList';
import { InternalNotes } from './InternalNotes';
import { RegistrationTab } from './RegistrationTab';
import { RejectDialog } from './RejectDialog';
import styles from './SellerVerificationPanel.module.css';

interface SellerVerificationPanelProps {
  id: string | null;
  onClose: () => void;
}

function DecidedInfo({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <p className={styles.decidedInfo}>
      {detail.status === 'REJECTED' &&
        detail.rejectionReason &&
        `Motivo: ${detail.rejectionReason}`}
      {detail.reviewedAt && ` · Decidido em ${formatDate(detail.reviewedAt)}`}
    </p>
  );
}

interface PanelFooterProps {
  detail: SellerVerificationDetail;
  isApproving: boolean;
  approveErrorMessage?: string;
  onApprove: () => void;
  onOpenReject: () => void;
}

function PanelFooter({
  detail,
  isApproving,
  approveErrorMessage,
  onApprove,
  onOpenReject,
}: PanelFooterProps) {
  if (!canDecide(detail.status)) return <DecidedInfo detail={detail} />;

  return (
    <>
      <FormError message={approveErrorMessage} />
      <div className={styles.decisionActions}>
        <Button variant="danger" onClick={onOpenReject}>
          Rejeitar
        </Button>
        <Button disabled={isApproving} onClick={onApprove}>
          {isApproving ? 'Aguarde…' : 'Validar Lojista'}
        </Button>
      </div>
    </>
  );
}

function PanelHeading({ detail }: { detail: SellerVerificationDetail }) {
  return (
    <div className={styles.heading}>
      <div>
        <p className={styles.sellerName}>{detail.seller.name}</p>
        <p className={styles.sellerEmail}>{detail.seller.email}</p>
      </div>
      <Badge tone={statusTones[detail.status]}>{statusLabels[detail.status]}</Badge>
    </div>
  );
}

function useDocumentAndNoteActions(id: string, notify: (message: string) => void) {
  const validateDocument = useValidateSellerDocument();
  const addNote = useAddSellerVerificationNote();

  return {
    validateDocument: {
      isPending: validateDocument.isPending,
      errorMessage: validateDocument.error?.message,
      run: (documentId: string) =>
        validateDocument.mutate(
          { id, documentId },
          { onSuccess: () => notify(sellerVerificationMessages.documentValidated) },
        ),
    },
    addNote: {
      isPending: addNote.isPending,
      errorMessage: addNote.error?.message,
      run: (content: string) =>
        addNote.mutate(
          { id, input: { content } },
          { onSuccess: () => notify(sellerVerificationMessages.noteAdded) },
        ),
    },
  };
}

function useApproveAction(id: string, notify: (message: string) => void) {
  const approve = useApproveSellerVerification();

  return {
    isPending: approve.isPending,
    errorMessage: approve.error?.message,
    run: () =>
      approve.mutate(
        { id, input: {} },
        { onSuccess: () => notify(sellerVerificationMessages.approved) },
      ),
  };
}

function useRejectAction(id: string, notify: (message: string) => void, onRejected: () => void) {
  const reject = useRejectSellerVerification();

  return {
    isPending: reject.isPending,
    errorMessage: reject.error?.message,
    run: (reason: string) =>
      reject.mutate(
        { id, input: { reason } },
        {
          onSuccess: () => {
            onRejected();
            notify(sellerVerificationMessages.rejected);
          },
        },
      ),
  };
}

function useDecisionActions(id: string, notify: (message: string) => void) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  return {
    isRejectOpen,
    openReject: () => setIsRejectOpen(true),
    closeReject: () => setIsRejectOpen(false),
    approve: useApproveAction(id, notify),
    reject: useRejectAction(id, notify, () => setIsRejectOpen(false)),
  };
}

function useSellerVerificationActions(id: string) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = (message: string) => setToastMessage(message);

  return {
    toastMessage,
    dismissToast: () => setToastMessage(null),
    ...useDocumentAndNoteActions(id, notify),
    ...useDecisionActions(id, notify),
  };
}

type SellerVerificationActions = ReturnType<typeof useSellerVerificationActions>;

function DocumentsSection({
  detail,
  actions,
}: {
  detail: SellerVerificationDetail;
  actions: SellerVerificationActions;
}) {
  return (
    <section className={styles.sectionCard} aria-label="Documentos">
      <h3 className={styles.sectionTitle}>Documentos</h3>
      <DocumentList
        documents={detail.documents}
        isValidating={actions.validateDocument.isPending}
        errorMessage={actions.validateDocument.errorMessage}
        onValidate={actions.validateDocument.run}
      />
    </section>
  );
}

function NotesSection({
  detail,
  actions,
}: {
  detail: SellerVerificationDetail;
  actions: SellerVerificationActions;
}) {
  return (
    <section className={styles.sectionCard} aria-label="Anotações internas">
      <h3 className={styles.sectionTitle}>Anotações internas</h3>
      <InternalNotes
        notes={detail.notes}
        isSaving={actions.addNote.isPending}
        errorMessage={actions.addNote.errorMessage}
        onAdd={actions.addNote.run}
      />
    </section>
  );
}

type PanelDecisionFooterProps = {
  detail: SellerVerificationDetail;
  actions: SellerVerificationActions;
};

function PanelDecisionFooter({ detail, actions }: PanelDecisionFooterProps) {
  return (
    <>
      <PanelFooter
        detail={detail}
        isApproving={actions.approve.isPending}
        approveErrorMessage={actions.approve.errorMessage}
        onApprove={actions.approve.run}
        onOpenReject={actions.openReject}
      />
      <RejectDialog
        open={actions.isRejectOpen}
        sellerName={detail.seller.name}
        isConfirming={actions.reject.isPending}
        errorMessage={actions.reject.errorMessage}
        onConfirm={actions.reject.run}
        onCancel={actions.closeReject}
      />
    </>
  );
}

type PanelTabId = 'registration' | 'documents';

function PanelTabs({
  detail,
  actions,
}: {
  detail: SellerVerificationDetail;
  actions: SellerVerificationActions;
}) {
  const [activeTab, setActiveTab] = useState<PanelTabId>('registration');
  const items = [
    { id: 'registration' as const, label: 'Dados Cadastrais & Fiscais' },
    { id: 'documents' as const, label: 'Docs', count: detail.documents.length },
  ];

  return (
    <Tabs label="Dossiê do lojista" items={items} activeId={activeTab} onChange={setActiveTab}>
      {activeTab === 'registration' ? (
        <RegistrationTab detail={detail} />
      ) : (
        <div className={styles.tabContent}>
          <DocumentsSection detail={detail} actions={actions} />
          <NotesSection detail={detail} actions={actions} />
        </div>
      )}
    </Tabs>
  );
}

function PanelBody({
  detail,
  actions,
}: {
  detail: SellerVerificationDetail;
  actions: SellerVerificationActions;
}) {
  return (
    <div className={styles.body}>
      <PanelHeading detail={detail} />
      <PanelTabs detail={detail} actions={actions} />
      <PanelDecisionFooter detail={detail} actions={actions} />
    </div>
  );
}

function SellerVerificationPanelContent({ id, onClose }: { id: string; onClose: () => void }) {
  const detailQuery = useSellerVerification(id);
  const actions = useSellerVerificationActions(id);

  return (
    <Drawer open title="Validar Cadastro" size="wide" onClose={onClose}>
      {detailQuery.isPending && <LoadingState message="Carregando o dossiê…" />}
      {detailQuery.isError && <ErrorState message={detailQuery.error.message} />}
      {detailQuery.data && <PanelBody detail={detailQuery.data} actions={actions} />}
      <Toast message={actions.toastMessage} onDismiss={actions.dismissToast} />
    </Drawer>
  );
}

export function SellerVerificationPanel({ id, onClose }: SellerVerificationPanelProps) {
  if (!id) return null;
  return <SellerVerificationPanelContent id={id} onClose={onClose} />;
}
