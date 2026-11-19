import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';

import {
  type PendingNoticeFormState,
  usePendingNoticeForm,
} from '../../hooks/usePendingNoticeForm';
import { usePendingTemplates, useSendPendingNotice } from '../../seller-verifications.queries';
import type { SendPendingNoticeInput } from '../../seller-verifications.schemas';
import type {
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

interface FormFooterProps {
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

function FormFooter({ isPending, onClose, onSubmit }: FormFooterProps) {
  return (
    <>
      <Button variant="secondary" disabled={isPending} onClick={onClose}>
        Cancelar
      </Button>
      <Button disabled={isPending} onClick={onSubmit}>
        <Icon name="send" size={16} />
        {isPending ? 'Enviando…' : 'Enviar Notificação & Registrar Log'}
      </Button>
    </>
  );
}

interface PendingNoticeModalBodyProps {
  target: PendingNoticeTarget;
  templates: PendingTemplate[];
  form: PendingNoticeFormState;
  mutation: ReturnType<typeof useSendPendingNotice>;
  onClose: () => void;
}

function PendingNoticeModalBody({
  target,
  templates,
  form,
  mutation,
  onClose,
}: PendingNoticeModalBodyProps) {
  return (
    <Modal
      open
      title="Notificar Lojista — Pendência Cadastral"
      subtitle={`Destinatário: ${target.sellerName} (${target.sellerEmail})`}
      icon="warning"
      size="medium"
      onClose={onClose}
      dismissible={!mutation.isPending}
      footer={
        <FormFooter isPending={mutation.isPending} onClose={onClose} onSubmit={form.submit} />
      }
    >
      <PendingNoticeForm templates={templates} form={form} apiError={mutation.error?.message} />
    </Modal>
  );
}

type OnSent = (result: PendingNoticeResult, message: string) => void;

function usePendingNoticeSend(target: PendingNoticeTarget, onSent: OnSent) {
  const mutation = useSendPendingNotice();
  const send = (input: SendPendingNoticeInput) =>
    mutation.mutate(
      { id: target.id, input },
      { onSuccess: (result) => onSent(result, input.message) },
    );
  return { mutation, send };
}

function PendingNoticeFormContent({
  target,
  onClose,
  onSent,
}: {
  target: PendingNoticeTarget;
  onClose: () => void;
  onSent: OnSent;
}) {
  const templates = usePendingTemplates().data ?? [];
  const { mutation, send } = usePendingNoticeSend(target, onSent);
  const form = usePendingNoticeForm({ target, templates, onSubmit: send });

  return (
    <PendingNoticeModalBody
      target={target}
      templates={templates}
      form={form}
      mutation={mutation}
      onClose={onClose}
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

const sentSubtitle = (emailDelivered: boolean) =>
  emailDelivered
    ? 'A mensagem foi entregue com sucesso aos canais cadastrados do parceiro.'
    : 'A notificação no site foi criada, mas o e-mail não foi entregue.';

function SentModal({
  target,
  sent,
  onClose,
  onBackToDashboard,
}: ModalContentProps & { sent: SentNotice }) {
  return (
    <Modal
      open
      title="Notificação Enviada ao Lojista"
      eyebrow="Confirmação de envio"
      subtitle={sentSubtitle(sent.result.emailDelivered)}
      icon="checkCircle"
      size="medium"
      onClose={onClose}
    >
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
