import { type FormEvent, type KeyboardEvent, useState } from 'react';

import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';

import { chatTexts } from '../../chat.labels';
import styles from './MessageComposer.module.css';

interface MessageComposerProps {
  recipient: string;
  onSend: (content: string) => Promise<unknown>;
}

function useComposer(onSend: MessageComposerProps['onSend']) {
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setFailed(false);
    try {
      await onSend(content);
      setText('');
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return { text, setText, failed, sending, send };
}

function ComposerFooter() {
  return (
    <p className={styles.footer}>
      <span>{chatTexts.marketplaceNotice}</span>
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
}

function MessageField({ recipient, value, onChange, onEnter }: MessageFieldProps) {
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
      }}
    />
  );
}

export function MessageComposer({ recipient, onSend }: MessageComposerProps) {
  const { text, setText, failed, sending, send } = useComposer(onSend);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      {failed && <FormError message={chatTexts.sendError} />}
      <div className={styles.row}>
        <MessageField recipient={recipient} value={text} onChange={setText} onEnter={submit} />
        <button type="submit" className={styles.send} disabled={sending || !text.trim()}>
          Enviar
          <Icon name="send" size={16} />
        </button>
      </div>
      <ComposerFooter />
    </form>
  );
}
