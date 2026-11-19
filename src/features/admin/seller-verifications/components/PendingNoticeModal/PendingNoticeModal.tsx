import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';

import { deadlineHoursLabels, DEFAULT_DEADLINE_HOURS } from '../../seller-verifications.labels';
import { usePendingTemplates, useSendPendingNotice } from '../../seller-verifications.queries';
import type {
  DeadlineHours,
  PendingNoticeResult,
  PendingNoticeTarget,
  PendingTemplate,
} from '../../seller-verifications.types';
import { PendingNoticeForm } from './PendingNoticeForm';
import { PendingNoticeSent } from './PendingNoticeSent';

interface PendingNoticeModalProps {
  target: PendingNoticeTarget | null;
  onClose: () => void;
  onBackToDashboard: () => void;
}

function fillTemplate(
  body: string,
  target: PendingNoticeTarget,
  deadlineHours: DeadlineHours,
): string {
  return body
    .replaceAll('{nome}', target.sellerName)
    .replaceAll('{cnpj}', target.cnpj)
    .replaceAll('{prazo}', deadlineHoursLabels[deadlineHours]);
}

function usePendingNoticeDraft(target: PendingNoticeTarget, templates: PendingTemplate[]) {
  const [templateKey, setTemplateKey] = useState('');
  const [message, setMessage] = useState('');
  const [deadlineHours, setDeadlineHours] = useState<DeadlineHours>(DEFAULT_DEADLINE_HOURS);

  const templateOf = (key: string) => templates.find((item) => item.key === key);

  const selectTemplate = (key: string) => {
    setTemplateKey(key);
    const template = templateOf(key);
    if (template) setMessage(fillTemplate(template.body, target, deadlineHours));
  };

  const changeDeadline = (hours: DeadlineHours) => {
    setDeadlineHours(hours);
    const template = templateOf(templateKey);
    const untouched = template && message === fillTemplate(template.body, target, deadlineHours);
    if (untouched) setMessage(fillTemplate(template.body, target, hours));
  };

  return { templateKey, message, setMessage, deadlineHours, changeDeadline, selectTemplate };
}

interface FormFooterProps {
  isPending: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

function FormFooter({ isPending, canSubmit, onClose, onSubmit }: FormFooterProps) {
  return (
    <>
      <Button variant="secondary" disabled={isPending} onClick={onClose}>
        Cancelar
      </Button>
      <Button disabled={isPending || !canSubmit} onClick={onSubmit}>
        <Icon name="send" size={16} />
        {isPending ? 'Enviando…' : 'Enviar Notificação & Registrar Log'}
      </Button>
    </>
  );
}

function usePendingNoticeSubmit(
  target: PendingNoticeTarget,
  draft: ReturnType<typeof usePendingNoticeDraft>,
  onSent: (result: PendingNoticeResult, message: string) => void,
) {
  const mutation = useSendPendingNotice();

  const submit = () => {
    const input = {
      templateKey: draft.templateKey || undefined,
      message: draft.message,
      deadlineHours: draft.deadlineHours,
    };
    mutation.mutate(
      { id: target.id, input },
      { onSuccess: (result) => onSent(result, draft.message) },
    );
  };

  return { mutation, submit };
}

interface PendingNoticeModalBodyProps {
  target: PendingNoticeTarget;
  templates: PendingTemplate[];
  draft: ReturnType<typeof usePendingNoticeDraft>;
  mutation: ReturnType<typeof useSendPendingNotice>;
  onClose: () => void;
  onSubmit: () => void;
}

function ModalFields({
  target,
  templates,
  draft,
  mutation,
}: Omit<PendingNoticeModalBodyProps, 'onClose' | 'onSubmit'>) {
  return (
    <PendingNoticeForm
      target={target}
      templates={templates}
      templateKey={draft.templateKey}
      message={draft.message}
      deadlineHours={draft.deadlineHours}
      messageError={mutation.error?.message}
      onTemplateChange={draft.selectTemplate}
      onMessageChange={draft.setMessage}
      onDeadlineChange={draft.changeDeadline}
    />
  );
}

function PendingNoticeModalBody(props: PendingNoticeModalBodyProps) {
  const { draft, mutation, onClose, onSubmit } = props;
  const footer = (
    <FormFooter
      isPending={mutation.isPending}
      canSubmit={Boolean(draft.message.trim())}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );

  return (
    <Modal
      open
      title="Notificar Lojista — Pendência Cadastral"
      subtitle={`Destinatário: ${props.target.sellerName} (${props.target.sellerEmail})`}
      icon="warning"
      size="medium"
      onClose={onClose}
      dismissible={!mutation.isPending}
      footer={footer}
    >
      <ModalFields {...props} />
    </Modal>
  );
}

function PendingNoticeFormContent({
  target,
  onClose,
  onSent,
}: {
  target: PendingNoticeTarget;
  onClose: () => void;
  onSent: (result: PendingNoticeResult, message: string) => void;
}) {
  const templates = usePendingTemplates().data ?? [];
  const draft = usePendingNoticeDraft(target, templates);
  const { mutation, submit } = usePendingNoticeSubmit(target, draft, onSent);

  return (
    <PendingNoticeModalBody
      target={target}
      templates={templates}
      draft={draft}
      mutation={mutation}
      onClose={onClose}
      onSubmit={submit}
    />
  );
}

interface SentNotice {
  result: PendingNoticeResult;
  message: string;
}

interface ModalContentProps {
  target: PendingNoticeTarget;
  onClose: () => void;
  onBackToDashboard: () => void;
}

function SentModal({
  target,
  sent,
  onClose,
  onBackToDashboard,
}: ModalContentProps & { sent: SentNotice }) {
  return (
    <Modal open title="Notificação enviada" size="medium" onClose={onClose}>
      <PendingNoticeSent
        target={target}
        result={sent.result}
        message={sent.message}
        onBackToDashboard={onBackToDashboard}
      />
    </Modal>
  );
}

function PendingNoticeModalContent({ target, onClose, onBackToDashboard }: ModalContentProps) {
  const [sent, setSent] = useState<SentNotice | null>(null);

  if (sent) {
    return (
      <SentModal
        target={target}
        sent={sent}
        onClose={onClose}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  return (
    <PendingNoticeFormContent
      target={target}
      onClose={onClose}
      onSent={(result, message) => setSent({ result, message })}
    />
  );
}

export function PendingNoticeModal({
  target,
  onClose,
  onBackToDashboard,
}: PendingNoticeModalProps) {
  if (!target) return null;
  return (
    <PendingNoticeModalContent
      target={target}
      onClose={onClose}
      onBackToDashboard={onBackToDashboard}
    />
  );
}
