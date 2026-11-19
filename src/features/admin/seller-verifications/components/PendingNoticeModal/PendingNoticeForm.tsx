import { Icon } from '@/components/Icon/Icon';
import { Select } from '@/components/Select/Select';
import { Textarea } from '@/components/Textarea/Textarea';
import { cn } from '@/utils/cn';

import { deadlineHoursOptions } from '../../seller-verifications.labels';
import type {
  DeadlineHours,
  PendingNoticeTarget,
  PendingTemplate,
} from '../../seller-verifications.types';
import styles from './PendingNoticeModal.module.css';

interface PendingNoticeFormProps {
  target: PendingNoticeTarget;
  templates: PendingTemplate[];
  templateKey: string;
  message: string;
  deadlineHours: DeadlineHours;
  messageError?: string;
  onTemplateChange: (key: string) => void;
  onMessageChange: (message: string) => void;
  onDeadlineChange: (hours: DeadlineHours) => void;
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

function TemplateSelect({
  templates,
  templateKey,
  onTemplateChange,
}: Pick<PendingNoticeFormProps, 'templates' | 'templateKey' | 'onTemplateChange'>) {
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
            isActive={template.key === templateKey}
            onSelect={onTemplateChange}
          />
        ))}
      </div>
    </div>
  );
}

function MessageField({
  message,
  messageError,
  onMessageChange,
}: Pick<PendingNoticeFormProps, 'message' | 'messageError' | 'onMessageChange'>) {
  return (
    <Textarea
      label="Corpo da mensagem transacional"
      hint="Variáveis automáticas ativas: nome, CNPJ e prazo"
      value={message}
      error={messageError}
      onChange={(event) => onMessageChange(event.target.value)}
    />
  );
}

function DeadlineSelect({
  deadlineHours,
  onDeadlineChange,
}: Pick<PendingNoticeFormProps, 'deadlineHours' | 'onDeadlineChange'>) {
  return (
    <Select
      label="Prazo para regularização (SLA)"
      options={deadlineHoursOptions}
      value={String(deadlineHours)}
      onChange={(event) => onDeadlineChange(Number(event.target.value) as DeadlineHours)}
    />
  );
}

export function PendingNoticeForm(props: PendingNoticeFormProps) {
  return (
    <div className={styles.form}>
      <Channels />
      <TemplateSelect {...props} />
      <MessageField {...props} />
      <DeadlineSelect {...props} />
    </div>
  );
}
