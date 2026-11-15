import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Textarea } from '@/components/Textarea/Textarea';
import { formatDate } from '@/utils/formatDate';

import { addNoteSchema } from '../../seller-verifications.schemas';
import type { SellerVerificationNote } from '../../seller-verifications.types';
import styles from './SellerVerificationPanel.module.css';

interface InternalNotesProps {
  notes: SellerVerificationNote[];
  isSaving: boolean;
  errorMessage?: string;
  onAdd: (content: string) => void;
}

function NoteItem({ note }: { note: SellerVerificationNote }) {
  return (
    <li className={styles.noteItem}>
      <p className={styles.noteContent}>{note.content}</p>
      <p className={styles.noteMeta}>
        {note.author.name} · {formatDate(note.createdAt)}
      </p>
    </li>
  );
}

function NotesList({ notes }: { notes: SellerVerificationNote[] }) {
  if (notes.length === 0) {
    return <p className={styles.emptyHint}>Nenhuma anotação registrada.</p>;
  }

  return (
    <ul className={styles.noteList}>
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}

function useNoteDraft(onAdd: (content: string) => void) {
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState<string>();

  const submit = () => {
    const parsed = addNoteSchema.safeParse({ content });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message);
      return;
    }
    setValidationError(undefined);
    onAdd(parsed.data.content);
    setContent('');
  };

  return { content, setContent, validationError, submit };
}

export function InternalNotes({ notes, isSaving, errorMessage, onAdd }: InternalNotesProps) {
  const { content, setContent, validationError, submit } = useNoteDraft(onAdd);

  return (
    <div className={styles.notes}>
      <NotesList notes={notes} />
      <Textarea
        label="Nova anotação interna"
        hint="Visível só para a equipe, nunca para o vendedor"
        value={content}
        error={validationError ?? errorMessage}
        onChange={(event) => setContent(event.target.value)}
      />
      <Button variant="secondary" disabled={isSaving} onClick={submit}>
        {isSaving ? 'Salvando…' : 'Adicionar anotação'}
      </Button>
    </div>
  );
}
