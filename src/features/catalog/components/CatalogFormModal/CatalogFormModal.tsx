import { useIsMutating } from '@tanstack/react-query';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';

import { catalogKeys } from '../../catalog.queries';
import type { ConfirmedSaveControls } from '../../hooks/useConfirmedSave';
import styles from './CatalogFormModal.module.css';

type SaveControls = ConfirmedSaveControls<never>;

/** Textos do modal, que mudam entre cadastrar e editar (frames 278-3246 e 832-5744). */
export interface CatalogFormModalTexts {
  title: string;
  subtitle: string;
  submitLabel: string;
  note?: string;
  invalidNote: (count: number) => string;
  confirmMessage: string;
}

/** O formulário avisa quantos campos estão com erro, para o rodapé contar como no Figma. */
export type ReportInvalid = (count: number) => void;

type ModalSize = 'default' | 'large';

interface CatalogFormModalProps {
  texts: CatalogFormModalTexts;
  size?: ModalSize;
  save: SaveControls;
  onClose: () => void;
  children: (formId: string, reportInvalid: ReportInvalid) => ReactNode;
}

interface CatalogFormIds {
  formId: string;
  messageId: string;
  saveId: string;
  confirmId: string;
}

interface CatalogFormActionsProps {
  ids: CatalogFormIds;
  save: SaveControls;
  submitLabel: string;
  onClose: () => void;
}

function useCatalogFormIds(isReviewing: boolean): CatalogFormIds {
  const ids = { formId: useId(), messageId: useId(), saveId: useId(), confirmId: useId() };
  const previousStep = useRef(isReviewing);

  useEffect(() => {
    if (previousStep.current === isReviewing) return;
    previousStep.current = isReviewing;
    document.getElementById(isReviewing ? ids.confirmId : ids.saveId)?.focus();
  }, [isReviewing, ids.confirmId, ids.saveId]);

  return ids;
}

function EditStepActions({ ids, submitLabel, onClose }: CatalogFormActionsProps) {
  const isUploading = useIsMutating({ mutationKey: catalogKeys.uploads() }) > 0;

  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button id={ids.saveId} type="submit" form={ids.formId} disabled={isUploading}>
        <Icon name="checkCircle" size={18} />
        {submitLabel}
      </Button>
    </>
  );
}

function ReviewStepActions({ ids, save }: CatalogFormActionsProps) {
  return (
    <>
      <Button variant="secondary" disabled={save.isSaving} onClick={save.back}>
        Voltar
      </Button>
      <Button
        id={ids.confirmId}
        aria-describedby={ids.messageId}
        disabled={save.isSaving}
        onClick={save.confirm}
      >
        {save.isSaving ? 'Salvando…' : 'Confirmar'}
      </Button>
    </>
  );
}

interface FooterNote {
  note?: string;
  invalidNote?: string;
}

function CatalogFormFooter({
  note,
  invalidNote,
  ...actions
}: CatalogFormActionsProps & FooterNote) {
  const Actions = actions.save.isReviewing ? ReviewStepActions : EditStepActions;
  const text = invalidNote ?? note;

  return (
    <div className={styles.footer}>
      {text && <p className={invalidNote ? styles.invalidNote : styles.note}>{text}</p>}
      <div className={styles.actions}>
        <Actions {...actions} />
      </div>
    </div>
  );
}

/** "Corrija os N campos destacados…" no lugar da nota, enquanto houver erro. */
function useInvalidNote(texts: CatalogFormModalTexts) {
  const [invalidCount, setInvalidCount] = useState(0);
  const invalidNote = invalidCount > 0 ? texts.invalidNote(invalidCount) : undefined;
  return { invalidNote, reportInvalid: setInvalidCount };
}

function dialogPropsOf({ title, subtitle }: CatalogFormModalTexts, size: ModalSize) {
  if (size === 'default') return { title, subtitle, variant: 'compact' as const };
  return { title, subtitle, size, variant: 'framed' as const, icon: 'cube' as const };
}

export function CatalogFormModal({
  texts,
  size = 'default',
  save,
  onClose,
  children,
}: CatalogFormModalProps) {
  const ids = useCatalogFormIds(save.isReviewing);
  const { invalidNote, reportInvalid } = useInvalidNote(texts);
  const { submitLabel, note } = texts;

  return (
    <Modal
      open
      {...dialogPropsOf(texts, size)}
      dismissible={!save.isSaving}
      onClose={onClose}
      footer={<CatalogFormFooter {...{ ids, save, submitLabel, note, invalidNote, onClose }} />}
    >
      <div hidden={save.isReviewing}>{children(ids.formId, reportInvalid)}</div>
      <p id={ids.messageId} className={styles.confirm} hidden={!save.isReviewing}>
        {texts.confirmMessage}
      </p>
    </Modal>
  );
}
