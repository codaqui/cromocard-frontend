import type { PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';

export type ReportType = 'signups' | 'catalog' | 'seller-audit';
export type ExportFormat = 'csv' | 'pdf';

export interface ReportPeriodParams {
  period?: PeriodPreset;
  from?: string;
  to?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export type ReportRow = Record<string, string | null>;

export interface ReportPreviewData {
  type: ReportType;
  title: string;
  period: { from: string; to: string };
  columns: ReportColumn[];
  rows: ReportRow[];
}

export interface ReportPreview extends ReportPreviewData {
  total: number;
}

export interface ExportReportInput {
  type: ReportType;
  format: ExportFormat;
  params: ReportPeriodParams;
  period: { from: string; to: string };
}

export interface ReportExportFilters {
  period: PeriodPreset | null;
  from: string;
  to: string;
}

export interface ReportExport {
  id: string;
  type: ReportType;
  format: ExportFormat;
  fileSize: number | null;
  filters: ReportExportFilters;
  requestedBy: { name: string; username: string | null };
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}
