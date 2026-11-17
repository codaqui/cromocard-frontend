import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';

import styles from './ModuleActions.module.css';

interface ModuleActionsProps {
  saveLabel: string;
  isSaving: boolean;
  onCancel: () => void;
  formId?: string;
  onSave?: () => void;
}

export function ModuleActions({
  saveLabel,
  isSaving,
  onCancel,
  formId,
  onSave,
}: ModuleActionsProps) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" className={styles.cancel} disabled={isSaving} onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        type={formId ? 'submit' : 'button'}
        form={formId}
        className={styles.save}
        disabled={isSaving}
        onClick={onSave}
      >
        <Icon name="save" size={16} />
        {isSaving ? 'Salvando…' : saveLabel}
      </Button>
    </div>
  );
}
