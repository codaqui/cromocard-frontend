import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import { formatCount, formatPendingAlerts } from '../../community-admin.format';
import { useCommunitySummary } from '../../community-admin.queries';
import type { CommunitySummary } from '../../community-admin.types';
import { RetryableError } from '../RetryableError/RetryableError';
import styles from './CommunityOverview.module.css';

const PLACEHOLDER = '—';

interface OverviewTileProps {
  label: string;
  icon: IconName;
  value: string;
  hint?: string;
  tone?: 'default' | 'alert';
}

function OverviewTile({ label, icon, value, hint, tone = 'default' }: OverviewTileProps) {
  return (
    <article className={cn(styles.tile, tone === 'alert' && styles.alert)}>
      <header className={styles.tileHeading}>
        <h2 className={styles.tileLabel}>{label}</h2>
        <Icon name={icon} size={16} />
      </header>
      <p className={styles.tileValue}>{value}</p>
      {hint && <p className={styles.tileHint}>{hint}</p>}
    </article>
  );
}

function Identity() {
  return (
    <div className={styles.identity}>
      <p className={styles.eyebrow}>
        <Icon name="shield" size={14} />
        Módulo de Proteção &amp; Integridade
      </p>
      <h1 className={styles.title}>Gestão de Comunidades &amp; Moderação</h1>
      <p className={styles.subtitle}>
        Supervisão de guildas, sanções de grupos e fila de triagem de incidentes com mediação
        imediata.
      </p>
    </div>
  );
}

function toOverviewTiles(summary?: CommunitySummary): OverviewTileProps[] {
  const count = (value?: number) => (value === undefined ? PLACEHOLDER : formatCount(value));
  const pending = summary ? formatPendingAlerts(summary.pendingReports) : PLACEHOLDER;

  return [
    {
      label: 'Grupos Ativos',
      icon: 'users',
      value: count(summary?.activeGroups),
    },
    {
      label: 'Mensagens Monitoradas',
      icon: 'forum',
      value: count(summary?.messagesLast7Days),
      hint: 'Nos últimos 7 dias',
    },
    {
      label: 'Alertas Pendentes',
      icon: 'warning',
      value: pending,
      hint: 'Ação imediata requerida',
      tone: 'alert',
    },
  ];
}

function OverviewTiles() {
  const query = useCommunitySummary();

  if (query.isError) {
    return <RetryableError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return (
    <div className={styles.tiles}>
      {toOverviewTiles(query.data).map((tile) => (
        <OverviewTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}

export function CommunityOverview() {
  return (
    <header className={styles.overview}>
      <Identity />
      <OverviewTiles />
    </header>
  );
}
