import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Select } from '@/components/Select/Select';
import { Textarea } from '@/components/Textarea/Textarea';
import { cn } from '@/utils/cn';

import type { PendingNoticeFormState } from '../../hooks/usePendingNoticeForm';
import { deadlineHoursOptions } from '../../seller-verifications.labels';
import type { DeadlineHours, PendingTemplate } from '../../seller-verifications.types';
import styles from './PendingNoticeModal.module.css';

interface PendingNoticeFormProps {
  templates: PendingTemplate[];
  form: PendingNoticeFormState;
  apiError?: string;
}

const CHANNELS = ['Notificação no Site', 'E-mail Transacional'];

function Channels() {
  return (
    <div>
      <p className={styles.recipientLabel}>Canais de disparo obrigatórios</p>
      <ul className={styles.channelList} aria-label="Canais de disparo">
        {CHANNELS.map((channel) => (
          <li key={channel} className={styles.channel}>
            <Icon name="checkCircle" size={14} />
            {channel}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TemplateOptionProps {
  template: PendingTemplate;
  isActive: boolean;
  onSelect: (key: string) => void;
}

function TemplateOption({ template, isActive, onSelect }: TemplateOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      className={cn(styles.templateOption, isActive && styles.templateOptionActive)}
      onClick={() => onSelect(isActive ? '' : template.key)}
    >
      <span>{template.title}</span>
      {isActive && <Icon name="check" size={16} />}
    </button>
  );
}

function TemplateSelect({ templates, form }: Pick<PendingNoticeFormProps, 'templates' | 'form'>) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <p className={styles.recipientLabel}>Modelos de conformidade (templates de 1 clique)</p>
        <span className={styles.sectionHint}>Preenchimento Dinâmico</span>
      </div>
      <div className={styles.templateList} role="listbox" aria-label="Modelo de mensagem">
        {templates.map((template) => (
          <TemplateOption
            key={template.key}
            template={template}
            isActive={template.key === form.templateKey}
            onSelect={form.selectTemplate}
          />
        ))}
      </div>
    </div>
  );
}

function MessageField({ form }: Pick<PendingNoticeFormProps, 'form'>) {
  return (
    <Textarea
      label="Corpo da mensagem transacional"
      hint="Variáveis automáticas ativas: nome, CNPJ e prazo"
      error={form.messageError}
      {...form.messageField}
    />
  );
}

function DeadlineSelect({ form }: Pick<PendingNoticeFormProps, 'form'>) {
  return (
    <Select
      label="Prazo para regularização (SLA)"
      options={deadlineHoursOptions}
      value={String(form.deadlineHours)}
      onChange={(event) => form.changeDeadline(Number(event.target.value) as DeadlineHours)}
    />
  );
}

export function PendingNoticeForm({ templates, form, apiError }: PendingNoticeFormProps) {
  return (
    <div className={styles.form}>
      <Channels />
      <TemplateSelect templates={templates} form={form} />
      <MessageField form={form} />
      <DeadlineSelect form={form} />
      <FormError message={apiError} />
    </div>
  );
}
