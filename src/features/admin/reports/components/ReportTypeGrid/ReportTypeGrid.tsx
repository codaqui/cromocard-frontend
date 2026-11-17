import { Badge } from '@/components/Badge/Badge';
import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { REPORT_CARDS, type ReportCardInfo, reportsMessages } from '../../reports.labels';
import type { ReportType } from '../../reports.types';
import styles from './ReportTypeGrid.module.css';

interface ReportTypeGridProps {
  selected: ReportType;
  onSelect: (type: ReportType) => void;
}

interface ReportCardProps {
  card: ReportCardInfo;
  selected: boolean;
  onSelect: (type: ReportType) => void;
}

function ReportCard({ card, selected, onSelect }: ReportCardProps) {
  const { type } = card;
  return (
    <button
      type="button"
      className={cn(styles.card, selected && styles.selected)}
      aria-pressed={selected}
      disabled={!type}
      onClick={() => type && onSelect(type)}
    >
      <span className={styles.iconRow}>
        <span className={cn(styles.icon, selected && styles.iconSelected)}>
          <Icon name={card.icon} size={20} />
        </span>
        {!type && <Badge tone="neutral">{reportsMessages.comingSoon}</Badge>}
      </span>
      <span className={styles.cardTitle}>{card.title}</span>
      <span className={styles.description}>{card.description}</span>
      <span className={styles.columns}>{card.columnsCount} colunas</span>
    </button>
  );
}

function GridHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.step}>1</span>
      <div className={styles.heading}>
        <h2 id="report-type-title" className={styles.title}>
          Tipo de relatório
        </h2>
        <p className={styles.subtitle}>Escolha qual relatório você quer gerar.</p>
      </div>
      <span className={styles.count}>{REPORT_CARDS.length} relatórios</span>
    </header>
  );
}

export function ReportTypeGrid({ selected, onSelect }: ReportTypeGridProps) {
  return (
    <section className={styles.panel} aria-labelledby="report-type-title">
      <GridHeader />
      <div className={styles.grid}>
        {REPORT_CARDS.map((card) => (
          <ReportCard
            key={card.id}
            card={card}
            selected={card.type === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
