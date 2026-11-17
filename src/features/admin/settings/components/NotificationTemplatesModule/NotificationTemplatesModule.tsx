import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Icon } from '@/components/Icon/Icon';

import type { Notify } from '../../hooks/useSettingsNotice';
import { useTemplatesEditor } from '../../hooks/useTemplatesEditor';
import { templateSummary } from '../../settings.format';
import { TEMPLATES_MAX } from '../../settings.schemas';
import type { NotificationTemplate } from '../../settings.types';
import { SettingsModule } from '../SettingsModule/SettingsModule';
import { TemplateDialog } from '../TemplateDialog/TemplateDialog';
import styles from './NotificationTemplatesModule.module.css';

type TemplatesEditor = ReturnType<typeof useTemplatesEditor>;

interface TemplatesProps {
  templates: NotificationTemplate[];
  editor: TemplatesEditor;
}

interface TemplateRowProps {
  template: NotificationTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

function TemplateRowActions({ template, onEdit, onDelete }: TemplateRowProps) {
  return (
    <div className={styles.rowActions}>
      <button
        type="button"
        className={styles.edit}
        aria-label={`Editar ${template.name}`}
        onClick={onEdit}
      >
        Editar
      </button>
      <button
        type="button"
        className={styles.delete}
        aria-label={`Excluir ${template.name}`}
        onClick={onDelete}
      >
        Excluir
      </button>
    </div>
  );
}

function TemplateRow(props: TemplateRowProps) {
  return (
    <li className={styles.row}>
      <div className={styles.text}>
        <p className={styles.name}>{props.template.name}</p>
        <p className={styles.summary}>{templateSummary(props.template)}</p>
      </div>
      <TemplateRowActions {...props} />
    </li>
  );
}

const TEMPLATES_LIMIT_HINT = `Limite de ${TEMPLATES_MAX} templates: exclua um para criar outro.`;

const EMPTY_MESSAGE = 'Nenhum template cadastrado. Use “Novo template” para criar o primeiro.';

function TemplateList({ templates, editor }: TemplatesProps) {
  if (templates.length === 0) return <p className={styles.empty}>{EMPTY_MESSAGE}</p>;

  return (
    <ul className={styles.list}>
      {templates.map((template, index) => (
        <TemplateRow
          key={template.id ?? `${index}-${template.name}`}
          template={template}
          onEdit={() => editor.openEdit(index)}
          onDelete={() => editor.askDelete(index)}
        />
      ))}
    </ul>
  );
}

function EditingDialog({ templates, editor }: TemplatesProps) {
  const { editing } = editor;
  if (!editing) return null;

  return (
    <TemplateDialog
      template={editing.index === null ? undefined : templates[editing.index]}
      isSaving={editor.isSaving}
      apiError={editor.apiError}
      onClose={editor.close}
      onSubmit={editor.saveTemplate}
    />
  );
}

function DeletingDialog({ templates, editor }: TemplatesProps) {
  const deleting = editor.deleting === null ? undefined : templates[editor.deleting];
  if (!deleting) return null;

  return (
    <ConfirmDialog
      open
      title="Excluir template"
      icon="delete"
      tone="danger"
      message={`O template “${deleting.name}” sai da lista e deixa de aparecer na Notificação Global.`}
      confirmLabel="Excluir"
      isConfirming={editor.isSaving}
      onConfirm={editor.confirmDelete}
      onCancel={editor.cancelDelete}
    />
  );
}

interface NotificationTemplatesModuleProps {
  templates: NotificationTemplate[];
  notify: Notify;
}

function NewTemplateButton({ count, onClick }: { count: number; onClick: () => void }) {
  const isFull = count >= TEMPLATES_MAX;

  return (
    <Button disabled={isFull} title={isFull ? TEMPLATES_LIMIT_HINT : undefined} onClick={onClick}>
      <Icon name="save" size={16} />
      Novo template
    </Button>
  );
}

export function NotificationTemplatesModule({
  templates,
  notify,
}: NotificationTemplatesModuleProps) {
  const editor = useTemplatesEditor(templates, notify);

  return (
    <SettingsModule
      icon="sort"
      title="Módulo 3: Templates de notificação"
      subtitle="Modelos de título e texto que a tela de Notificação Global oferece para preencher."
      actions={<NewTemplateButton count={templates.length} onClick={editor.openNew} />}
    >
      <TemplateList templates={templates} editor={editor} />
      <EditingDialog templates={templates} editor={editor} />
      <DeletingDialog templates={templates} editor={editor} />
    </SettingsModule>
  );
}
