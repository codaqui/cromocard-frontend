import { useIsMutating } from '@tanstack/react-query';
import { type ReactNode, useEffect, useId, useRef } from 'react';

import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';

import { catalogKeys } from '../../catalog.queries';
import type { ConfirmedSaveControls } from '../../hooks/useConfirmedSave';
import styles from './CatalogFormModal.module.css';

type SaveControls = ConfirmedSaveControls<never>;

interface CatalogFormModalProps {
  title: string;
  confirmMessage: string;
  save: SaveControls;
  onClose: () => void;
  children: (formId: string) => ReactNode;
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

function EditStepActions({ ids, onClose }: CatalogFormActionsProps) {
  const isUploading = useIsMutating({ mutationKey: catalogKeys.uploads() }) > 0;

  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button id={ids.saveId} type="submit" form={ids.formId} disabled={isUploading}>
        Salvar
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

export function CatalogFormModal({
  title,
  confirmMessage,
  save,
  onClose,
  children,
}: CatalogFormModalProps) {
  const ids = useCatalogFormIds(save.isReviewing);
  const Actions = save.isReviewing ? ReviewStepActions : EditStepActions;

  return (
    <Modal
      open
      title={title}
      dismissible={!save.isSaving}
      onClose={onClose}
      footer={<Actions ids={ids} save={save} onClose={onClose} />}
    >
      <div hidden={save.isReviewing}>{children(ids.formId)}</div>
      <p id={ids.messageId} className={styles.confirm} hidden={!save.isReviewing}>
        {confirmMessage}
      </p>
    </Modal>
  );
}
