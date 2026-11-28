import { Icon } from '@/components/Icon/Icon';
import { Switch } from '@/components/Switch/Switch';

import type { Channel } from '../../hooks/usePreferencesDraft';
import { eventGroups, settingsTexts as t } from '../../notifications.labels';
import type { NotificationEvent, NotificationPreferences } from '../../notifications.types';
import styles from './EventPreferences.module.css';

type EventGroup = (typeof eventGroups)[number];
type EventItem = EventGroup['events'][number];

interface EventPreferencesProps {
  preferences: NotificationPreferences;
  onChange: (event: NotificationEvent, channel: Channel, on: boolean) => void;
}

interface SwitchCellProps extends EventPreferencesProps {
  item: EventItem;
  channel: Channel;
  column: string;
}

function SwitchCell({ item, channel, column, preferences, onChange }: SwitchCellProps) {
  const choice = preferences.events.find(({ event }) => event === item.event);
  return (
    <span className={styles.switchCell}>
      <span className={styles.switchLabel} aria-hidden="true">
        {column}
      </span>
      <Switch
        label={`${item.label}: ${column}`}
        checked={choice?.[channel] ?? true}
        disabled={!preferences.channels[channel]}
        onChange={(on) => onChange(item.event, channel, on)}
      />
    </span>
  );
}

function EventRow({ item, ...props }: EventPreferencesProps & { item: EventItem }) {
  return (
    <li className={styles.row}>
      <span className={styles.dot} aria-hidden="true" />
      <div className={styles.eventText}>
        <p className={styles.eventLabel}>{item.label}</p>
        <p className={styles.hint}>{item.hint}</p>
      </div>
      <div className={styles.switches}>
        <SwitchCell item={item} channel="inApp" column={t.inAppColumn} {...props} />
        <SwitchCell item={item} channel="email" column={t.emailColumn} {...props} />
      </div>
    </li>
  );
}

function GroupCard({ group, ...props }: EventPreferencesProps & { group: EventGroup }) {
  return (
    <section className={styles.group} aria-label={group.title}>
      <div className={styles.groupHeader}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name={group.icon} size={20} />
        </span>
        <div className={styles.groupText}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <p className={styles.groupSubtitle}>{group.subtitle}</p>
        </div>
        <span className={styles.count}>{group.events.length}</span>
      </div>
      <ul className={styles.rows}>
        {group.events.map((item) => (
          <EventRow key={item.event} item={item} {...props} />
        ))}
      </ul>
    </section>
  );
}

export function EventPreferences(props: EventPreferencesProps) {
  return (
    <section className={styles.section} aria-labelledby="events-title">
      <div className={styles.header}>
        <div>
          <h2 id="events-title" className={styles.title}>
            {t.eventsTitle}
          </h2>
          <p className={styles.hint}>{t.eventsHint}</p>
        </div>
        <div className={styles.columns} aria-hidden="true">
          <span>{t.inAppColumn}</span>
          <span>{t.emailColumn}</span>
        </div>
      </div>
      {eventGroups.map((group) => (
        <GroupCard key={group.title} group={group} {...props} />
      ))}
    </section>
  );
}
