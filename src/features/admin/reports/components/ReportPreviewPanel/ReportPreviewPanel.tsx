import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { type Period, PeriodFilter } from '@/components/PeriodFilter/PeriodFilter';
import { formatCount, formatPeriodRange } from '../../reports.period';

import { formatDateRange, formatReportCell } from '../../reports.format';
import { SAMPLE_COLUMN_KEYS, periodLabel, reportsMessages } from '../../reports.labels';
import type { ExportFormat, ReportColumn, ReportPreview } from '../../reports.types';
import styles from './ReportPreviewPanel.module.css';

interface ReportPreviewPanelProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  preview: { data?: ReportPreview; isPending: boolean; error: Error | null };
  onExport: (format: ExportFormat) => void;
}

function columnsLabel({ columns }: ReportPreview): string {
  const text = columns.map(({ label }) => label.toLowerCase()).join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Summary({ preview, period }: { preview: ReportPreview; period: Period }) {
  const range = formatDateRange(preview.period.from, preview.period.to);
  const items = [
    ['Relatório', preview.title],
    ['Período', periodLabel(period, range)],
    ['Total', `${formatCount(preview.total)} registros`],
    ['Colunas', columnsLabel(preview)],
  ];
  return (
    <dl className={styles.summary}>
      {items.map(([term, value]) => (
        <div key={term} className={styles.summaryRow}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SampleRows({ preview, columns }: { preview: ReportPreview; columns: ReportColumn[] }) {
  return (
    <tbody>
      {preview.rows.map((row, index) => (
        <tr key={index}>
          {columns.map(({ key }) => (
            <td key={key}>{formatReportCell(row[key])}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function SampleTable({ preview }: { preview: ReportPreview }) {
  const sampleKeys = SAMPLE_COLUMN_KEYS[preview.type];
  const columns = preview.columns.filter(({ key }) => sampleKeys.includes(key));
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map(({ key, label }) => (
            <th key={key} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <SampleRows preview={preview} columns={columns} />
    </table>
  );
}

function Sample({ preview }: { preview: ReportPreview }) {
  return (
    <section className={styles.sample} aria-label="Amostra do relatório">
      <header className={styles.sampleHeader}>
        <span>Amostra (primeiras linhas)</span>
        <span className={styles.total}>{formatCount(preview.total)} no total</span>
      </header>
      {preview.total === 0 ? (
        <p className={styles.empty} role="status">
          {reportsMessages.empty}
        </p>
      ) : (
        <SampleTable preview={preview} />
      )}
    </section>
  );
}

function ExportActions({
  disabled,
  onExport,
}: {
  disabled: boolean;
  onExport: (format: ExportFormat) => void;
}) {
  return (
    <div className={styles.actions}>
      <Button className={styles.exportButton} disabled={disabled} onClick={() => onExport('pdf')}>
        <Icon name="download" size={16} /> Exportar PDF
      </Button>
      <p className={styles.hint}>PDF com título, período, data de geração e a tabela.</p>
      <Button
        className={styles.exportButton}
        variant="secondary"
        disabled={disabled}
        onClick={() => onExport('csv')}
      >
        <Icon name="gridView" size={16} /> Exportar CSV
      </Button>
      <p className={styles.hint}>CSV em UTF-8, separado por ponto e vírgula.</p>
    </div>
  );
}

function PreviewBody({
  preview,
  period,
}: {
  preview: ReportPreviewPanelProps['preview'];
  period: Period;
}) {
  if (preview.data) {
    return (
      <>
        <p className={styles.range}>
          <Icon name="calendar" size={14} />
          {formatPeriodRange(preview.data.period.from, preview.data.period.to)}
        </p>
        <Summary preview={preview.data} period={period} />
        <Sample preview={preview.data} />
      </>
    );
  }
  if (preview.error) return <ErrorState message={preview.error.message} />;
  return <LoadingState message="Carregando a prévia…" />;
}

export function ReportPreviewPanel({
  period,
  onPeriodChange,
  preview,
  onExport,
}: ReportPreviewPanelProps) {
  const canExport = !preview.isPending && (preview.data?.total ?? 0) > 0;
  return (
    <section className={styles.panel} aria-labelledby="report-preview-title">
      <h2 id="report-preview-title" className={styles.title}>
        <Icon name="manageSearch" size={20} /> Pré-visualização
      </h2>
      <div className={styles.period}>
        <PeriodFilter value={period} onChange={onPeriodChange} />
      </div>
      <PreviewBody preview={preview} period={period} />
      <ExportActions disabled={!canExport} onExport={onExport} />
    </section>
  );
}
