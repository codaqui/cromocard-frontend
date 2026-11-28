import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { Switch } from '@/components/Switch/Switch';

import type { Channel } from '../../hooks/usePreferencesDraft';
import { settingsTexts as t } from '../../notifications.labels';
import type { ChannelChoice } from '../../notifications.types';
import styles from './ChannelCards.module.css';

interface ChannelCardProps {
  icon: IconName;
  title: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
  footer: ReactNode;
}

function ChannelCard({ icon, title, checked, onChange, children, footer }: ChannelCardProps) {
  return (
    <article className={styles.card} aria-label={title}>
      <div className={styles.top}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
        <Switch label={title} checked={checked} onChange={onChange} />
      </div>
      <h3 className={styles.title}>
        {title}
        {checked && <span className={styles.dot} aria-hidden="true" />}
      </h3>
      <div className={styles.text}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </article>
  );
}

interface ChannelCardsProps {
  channels: ChannelChoice;
  email?: string;
  onChange: (channel: Channel, on: boolean) => void;
}

function FooterAccent({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className={styles.accent}>
      <Icon name={icon} size={14} />
      {text}
    </span>
  );
}

function InAppCard({ channels, onChange }: Omit<ChannelCardsProps, 'email'>) {
  const footer = (
    <>
      <FooterAccent icon="bolt" text={t.inAppFooter} />
      <span>{t.inAppBadge(channels.inApp)}</span>
    </>
  );
  return (
    <ChannelCard
      icon="notificationsActive"
      title={t.inAppTitle}
      checked={channels.inApp}
      onChange={(on) => onChange('inApp', on)}
      footer={footer}
    >
      <p>{t.inAppHint}</p>
    </ChannelCard>
  );
}

function EmailCard({ channels, email, onChange }: ChannelCardsProps) {
  const footer = (
    <>
      <FooterAccent icon="schedule" text={t.emailFooter} />
      <span className={styles.muted}>{t.changeEmail}</span>
    </>
  );
  return (
    <ChannelCard
      icon="markEmailRead"
      title={t.emailTitle}
      checked={channels.email}
      onChange={(on) => onChange('email', on)}
      footer={footer}
    >
      {email && <p>{email}</p>}
      <p>{t.emailHint}</p>
    </ChannelCard>
  );
}

export function ChannelCards(props: ChannelCardsProps) {
  return (
    <section className={styles.section} aria-labelledby="channels-title">
      <h2 id="channels-title" className={styles.heading}>
        <Icon name="hub" size={20} />
        {t.channelsTitle}
      </h2>
      <div className={styles.grid}>
        <InAppCard channels={props.channels} onChange={props.onChange} />
        <EmailCard {...props} />
      </div>
    </section>
  );
}
