import { usersLabel } from '../../global-notifications.format';
import { AUDIENCE_LABELS, CHANNEL_OPTIONS } from '../../global-notifications.labels';
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CHANNELS,
  type RecipientsCount,
} from '../../global-notifications.types';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import { OptionCard } from '../OptionCard/OptionCard';
import { OptionGroup } from './OptionGroup';

interface AudienceFieldsProps {
  form: NotificationFormState;
  counts?: RecipientsCount;
}

/** Público com a contagem de cada um (CCD101 R2, R3). */
export function AudienceField({ form, counts }: AudienceFieldsProps) {
  return (
    <OptionGroup legend="Público" error={form.errors.audience?.message}>
      {NOTIFICATION_AUDIENCES.map((audience) => (
        <OptionCard
          key={audience}
          type="radio"
          value={audience}
          label={AUDIENCE_LABELS[audience]}
          hint={counts ? usersLabel(counts[audience]) : '…'}
          {...form.register('audience')}
        />
      ))}
    </OptionGroup>
  );
}

/** Canais: plataforma (padrão) e e-mail (CCD101 R4, R9). */
export function ChannelsField({ form }: Pick<AudienceFieldsProps, 'form'>) {
  return (
    <OptionGroup legend="Canais" error={form.errors.channels?.message}>
      {NOTIFICATION_CHANNELS.map((channel) => (
        <OptionCard
          key={channel}
          type="checkbox"
          value={channel}
          label={CHANNEL_OPTIONS[channel].label}
          hint={CHANNEL_OPTIONS[channel].hint}
          {...form.register('channels')}
        />
      ))}
    </OptionGroup>
  );
}
