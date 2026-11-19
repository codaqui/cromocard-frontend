import type { IconName } from '@/components/Icon/icon-paths';
import type { Period, PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';

import type { ExportFormat, ReportType } from './reports.types';

export interface ReportCardInfo {
  id: string;
  type?: ReportType;
  title: string;
  description: string;
  columnsCount: number;
  icon: IconName;
}

export const REPORT_CARDS: ReportCardInfo[] = [
  {
    id: 'signups',
    type: 'signups',
    title: 'Novos cadastros',
    description: 'Novos cadastros do período, com nome, e-mail, papel e data.',
    columnsCount: 4,
    icon: 'personAdd',
  },
  {
    id: 'catalog',
    type: 'catalog',
    title: 'Catálogo',
    description: 'Cartas e álbuns cadastrados no período, por franquia.',
    columnsCount: 6,
    icon: 'cards',
  },
  {
    id: 'seller-audit',
    type: 'seller-audit',
    title: 'Auditoria de Lojistas',
    description: 'Cadastros de vendedores por status no período.',
    columnsCount: 5,
    icon: 'shield',
  },
  {
    id: 'volume',
    title: 'Volume Transacionado & Custódia',
    description: 'Valor em custódia e liquidado por dia no período.',
    columnsCount: 4,
    icon: 'trendingUp',
  },
];

export const SAMPLE_COLUMN_KEYS: Record<ReportType, string[]> = {
  signups: ['name', 'role', 'createdAt'],
  catalog: ['name', 'franchise', 'createdAt'],
  'seller-audit': ['legalName', 'status', 'createdAt'],
};

const PRESET_LABELS: Record<PeriodPreset, string> = {
  today: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '1y': 'Último ano',
};

export function periodLabel(period: Period, range: string): string {
  return 'preset' in period ? PRESET_LABELS[period.preset] : range;
}

export const FORMAT_LABELS: Record<ExportFormat, string> = { pdf: 'PDF', csv: 'CSV' };

export const reportsMessages = {
  empty: 'Não foram encontrados dados para os filtros selecionados.',
  exported: 'Relatório exportado',
  exportedDetail: (title: string, format: ExportFormat) =>
    `${title} (${FORMAT_LABELS[format]}) foi baixado.`,
  comingSoon: 'Em breve',
};
