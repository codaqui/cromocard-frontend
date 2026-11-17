import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import { useTemplateForm } from '../../hooks/useTemplateForm';
import {
  TEMPLATE_CONTENT_MAX,
  TEMPLATE_NAME_MAX,
  TEMPLATE_TITLE_MAX,
  type TemplateInput,
} from '../../settings.schemas';
import type { NotificationTemplate } from '../../settings.types';
import styles from './TemplateDialog.module.css';

interface TemplateDialogProps {
  template: NotificationTemplate | undefined;
  isSaving: boolean;
  apiError: ApiError | null;
  onClose: () => void;
  onSubmit: (input: TemplateInput) => void;
}

type TemplateForm = ReturnType<typeof useTemplateForm>;

function TemplateFields({ register, errors, lengths }: Omit<TemplateForm, 'submit'>) {
  return (
    <>
      <TextField
        label="Nome do template"
        maxLength={TEMPLATE_NAME_MAX}
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label={`Título (${lengths.title}/${TEMPLATE_TITLE_MAX})`}
        maxLength={TEMPLATE_TITLE_MAX}
        error={errors.title?.message}
        {...register('title')}
      />
      <Textarea
        label={`Texto (${lengths.content}/${TEMPLATE_CONTENT_MAX})`}
        rows={3}
        maxLength={TEMPLATE_CONTENT_MAX}
        error={errors.content?.message}
        {...register('content')}
      />
    </>
  );
}

function TemplateDialogActions({
  formId,
  isSaving,
  onClose,
}: {
  formId: string;
  isSaving: boolean;
  onClose: () => void;
}) {
  return (
    <div className={styles.footer}>
      <Button variant="secondary" disabled={isSaving} onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} disabled={isSaving}>
        {isSaving ? 'Salvando…' : 'Salvar template'}
      </Button>
    </div>
  );
}

const SUBTITLE = 'Use {campo} para os trechos que a pessoa completa na tela de Notificação Global.';

export function TemplateDialog({
  template,
  isSaving,
  apiError,
  onClose,
  onSubmit,
}: TemplateDialogProps) {
  const formId = useId();
  const { submit, ...fields } = useTemplateForm(template, onSubmit, apiError);
  const dialog = {
    title: template ? 'Editar template' : 'Novo template',
    dismissible: !isSaving,
    onClose,
    footer: <TemplateDialogActions formId={formId} isSaving={isSaving} onClose={onClose} />,
  };

  return (
    <Modal open variant="compact" {...dialog}>
      <p className={styles.subtitle}>{SUBTITLE}</p>
      <form id={formId} className={styles.form} noValidate onSubmit={submit}>
        <TemplateFields {...fields} />
      </form>
    </Modal>
  );
}
