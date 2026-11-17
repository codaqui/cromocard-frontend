import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/Modal/Modal';

import { handleOf, itemNameOf } from '../../catalog-requests.format';
import { requestTypeTexts } from '../../catalog-requests.labels';
import type { CatalogRequest } from '../../catalog-requests.types';
import type { RequestReview, ReviewStep } from '../../hooks/useRequestReview';

interface DialogProps {
  review: RequestReview;
}

/** Frame 847-390: confirma a aprovação dizendo o que entra no catálogo. */
function ApproveDialog({ review, request }: DialogProps & { request: CatalogRequest }) {
  const { subject } = requestTypeTexts[request.type];
  return (
    <ConfirmDialog
      open
      title={`Aprovar a sugestão ${itemNameOf(request)}?`}
      message={`${subject} entra no catálogo como foi sugerida, ${handleOf(request.requester)} recebe uma notificação e a ação fica no log de auditoria. Ajustes depois, na Gestão de Catálogo.`}
      confirmLabel="Aprovar"
      isConfirming={review.isApproving}
      onConfirm={() => review.approve(request)}
      onCancel={review.close}
    />
  );
}

/** Frames 847-883 e 847-1380: recusa com o motivo obrigatório. */
function RejectDialog({ review, request }: DialogProps & { request: CatalogRequest }) {
  return (
    <ConfirmDialog
      open
      tone="danger"
      title={`Recusar a sugestão ${itemNameOf(request)}?`}
      message={`${handleOf(request.requester)} recebe uma notificação com o motivo, e a ação fica no log de auditoria.`}
      requireReason
      reasonLabel="Motivo (obrigatório)"
      reasonRequiredMessage="Informe o motivo para recusar a sugestão."
      confirmLabel="Recusar"
      cancelLabel="Voltar"
      isConfirming={review.isRejecting}
      onConfirm={(reason = '') => review.reject(request, reason)}
      onCancel={review.close}
    />
  );
}

interface NoticeProps {
  title: string;
  message: string;
  closeLabel: string;
  onClose: () => void;
}

/** Avisos compactos: aprovada (847-2864), já processada (847-1878) e erro ao aprovar (847-2371). */
function Notice({ title, message, closeLabel, onClose }: NoticeProps) {
  return (
    <Modal
      open
      variant="compact"
      title={title}
      onClose={onClose}
      footer={<Button onClick={onClose}>{closeLabel}</Button>}
    >
      <p>{message}</p>
    </Modal>
  );
}

type NoticeStep = Exclude<ReviewStep, { kind: 'idle' | 'approving' | 'rejecting' }>;

const NOTICE_TEXTS: Record<NoticeStep['kind'], Pick<NoticeProps, 'title' | 'closeLabel'>> = {
  approved: { title: 'Solicitação aprovada', closeLabel: 'Fechar' },
  reviewed: { title: 'Esta solicitação já foi processada', closeLabel: 'Voltar para a lista' },
  failed: { title: 'Não foi possível aprovar', closeLabel: 'Entendi' },
};

export function RequestReviewDialogs({ review }: DialogProps) {
  const { step } = review;

  if (step.kind === 'idle') return null;
  if (step.kind === 'approving') return <ApproveDialog review={review} request={step.request} />;
  if (step.kind === 'rejecting') return <RejectDialog review={review} request={step.request} />;
  return <Notice {...NOTICE_TEXTS[step.kind]} message={step.message} onClose={review.close} />;
}
