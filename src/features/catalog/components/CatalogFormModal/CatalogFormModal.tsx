import { type ReactNode, useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';

import type { ConfirmedSaveControls } from '../../hooks/useConfirmedSave';
import styles from './CatalogFormModal.module.css';

interface CatalogFormModalProps {
  title: string;
  confirmMessage: string;
  save: ConfirmedSaveControls;
  onClose: () => void;
  children: (formId: string) => ReactNode;
}

interface CatalogFormActionsProps {
  formId: string;
  save: ConfirmedSaveControls;
  onClose: () => void;
}

function CatalogFormActions({ formId, save, onClose }: CatalogFormActionsProps) {
  if (!save.isReviewing) {
    return (
      <>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form={formId}>
          Salvar
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="secondary" disabled={save.isSaving} onClick={save.back}>
        Voltar
      </Button>
      <Button disabled={save.isSaving} onClick={save.confirm}>
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
  const formId = useId();

  return (
    <Modal
      open
      title={title}
      dismissible={!save.isSaving}
      onClose={onClose}
      footer={<CatalogFormActions formId={formId} save={save} onClose={onClose} />}
    >
      <div hidden={save.isReviewing}>{children(formId)}</div>
      {save.isReviewing && <p className={styles.confirm}>{confirmMessage}</p>}
    </Modal>
  );
}
