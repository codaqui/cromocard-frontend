import { type FormEvent, type KeyboardEvent, useState } from 'react';

import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';

import { chatTexts } from '../../chat.labels';
import type { ChatMessage } from '../../chat.types';
import { SendMessageError } from '../../hooks/useSendMessage';
import { ReplyPreview } from '../ReplyPreview/ReplyPreview';
import styles from './MessageComposer.module.css';

const REPLY_UNAVAILABLE = 'REPLY_TARGET_UNAVAILABLE';

interface MessageComposerProps {
  recipient: string;
  initialText?: string;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  onSend: (content: string) => Promise<unknown>;
}

const noticeFor = (error: unknown) =>
  error instanceof SendMessageError && error.code === REPLY_UNAVAILABLE
    ? chatTexts.replyUnavailable
    : chatTexts.sendError;

function useDelivery({ onSend, onCancelReply }: MessageComposerProps) {
  const [sending, setSending] = useState(false);
  const failure = (error: unknown) => {
    const notice = noticeFor(error);
    if (notice === chatTexts.replyUnavailable) onCancelReply();
    return notice;
  };
  const deliver = async (content: string): Promise<string | null> => {
    setSending(true);
    try {
      await onSend(content);
      onCancelReply();
      return null;
    } catch (error) {
      return failure(error);
    } finally {
      setSending(false);
    }
  };
  return { sending, deliver };
}

function useComposer(props: MessageComposerProps) {
  const [text, setText] = useState(props.initialText ?? '');
  const [notice, setNotice] = useState<string | null>(null);
  const { sending, deliver } = useDelivery(props);
  const send = async () => {
    if (sending) return;
    const content = text.trim();
    if (!content) return setNotice(chatTexts.blankMessage);
    const failure = await deliver(content);
    setNotice(failure);
    if (!failure) setText('');
  };
  const edit = (value: string) => {
    setText(value);
    setNotice(null);
  };
  return { text, edit, notice, sending, send };
}

function ComposerFooter() {
  return (
    <p className={styles.footer}>
      <span className={styles.notice}>
        <Icon name="lock" size={12} />
        {chatTexts.marketplaceNotice}
      </span>
      <span className={styles.hint}>
        Pressione <kbd className={styles.kbd}>Enter</kbd> para enviar
      </span>
    </p>
  );
}

interface MessageFieldProps {
  recipient: string;
  value: string;
  onChange: (value: string) => void;
  onEnter: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onEscape: () => void;
}

function MessageField({ recipient, value, onChange, onEnter, onEscape }: MessageFieldProps) {
  return (
    <textarea
      className={styles.input}
      rows={1}
      maxLength={2000}
      aria-label="Mensagem"
      placeholder={`Digite sua mensagem para ${recipient}...`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) onEnter(event);
        if (event.key === 'Escape') onEscape();
      }}
    />
  );
}

interface ComposerRowProps extends Omit<MessageFieldProps, 'onEnter'> {
  sending: boolean;
  onSubmit: (event: FormEvent) => void;
}

function ComposerRow({ sending, onSubmit, ...field }: ComposerRowProps) {
  return (
    <div className={styles.row}>
      <MessageField {...field} onEnter={onSubmit} />
      <button type="submit" className={styles.send} disabled={sending}>
        Enviar
        <Icon name="send" size={16} />
      </button>
    </div>
  );
}

export function MessageComposer(props: MessageComposerProps) {
  const { recipient, replyingTo, onCancelReply } = props;
  const { text, edit, notice, sending, send } = useComposer(props);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  return (
    <form className={styles.composer} onSubmit={submit} noValidate>
      {notice && <FormError message={notice} />}
      {replyingTo && <ReplyPreview message={replyingTo} onCancel={onCancelReply} />}
      <ComposerRow
        recipient={recipient}
        value={text}
        onChange={edit}
        onEscape={onCancelReply}
        sending={sending}
        onSubmit={submit}
      />
      <ComposerFooter />
    </form>
  );
}
