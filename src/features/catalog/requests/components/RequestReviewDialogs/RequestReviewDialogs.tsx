import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/Modal/Modal';

import { handleOf, itemNameOf } from '../../catalog-requests.format';
import { requestTypeTexts } from '../../catalog-requests.labels';
import type { CatalogRequest } from '../../catalog-requests.types';
import type { RequestReview, ReviewAction, ReviewStep } from '../../hooks/useRequestReview';

interface DialogProps {
  review: RequestReview;
}

function ApproveDialog({ review, request }: DialogProps & { request: CatalogRequest }) {
  const { entersAsSuggested } = requestTypeTexts[request.type];
  return (
    <ConfirmDialog
      open
      title={`Aprovar a sugestão ${itemNameOf(request)}?`}
      message={`${entersAsSuggested}, ${handleOf(request.requester)} recebe uma notificação e a ação fica no log de auditoria. Ajustes depois, na Gestão de Catálogo.`}
      variant="compact"
      confirmLabel="Aprovar"
      isConfirming={review.isApproving}
      onConfirm={() => review.approve(request)}
      onCancel={review.close}
    />
  );
}

function RejectDialog({ review, request }: DialogProps & { request: CatalogRequest }) {
  return (
    <ConfirmDialog
      open
      tone="danger"
      variant="compact"
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

type NoticeTexts = Pick<NoticeProps, 'title' | 'closeLabel'>;

const ALREADY_REVIEWED: NoticeTexts = {
  title: 'Esta solicitação já foi processada',
  closeLabel: 'Voltar para a lista',
};

const FAILURE_TITLES: Record<ReviewAction, string> = {
  approve: 'Não foi possível aprovar',
  reject: 'Não foi possível recusar',
};

const noticeTextsOf = (step: NoticeStep): NoticeTexts =>
  step.kind === 'reviewed'
    ? ALREADY_REVIEWED
    : { title: FAILURE_TITLES[step.action], closeLabel: 'Entendi' };

export function RequestReviewDialogs({ review }: DialogProps) {
  const { step } = review;

  if (step.kind === 'idle') return null;
  if (step.kind === 'approving') return <ApproveDialog review={review} request={step.request} />;
  if (step.kind === 'rejecting') return <RejectDialog review={review} request={step.request} />;
  return <Notice {...noticeTextsOf(step)} message={step.message} onClose={review.close} />;
}
