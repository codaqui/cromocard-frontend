import { api } from '@/lib/http';

import type {
  ExportFormat,
  ReportPeriodParams,
  ReportPreview,
  ReportPreviewData,
  ReportType,
} from './reports.types';

export const PREVIEW_SIZE = 4;

const reportPath = (type: ReportType) => `/admin/reports/${type}`;

export const reportsApi = {
  async preview(type: ReportType, params: ReportPeriodParams): Promise<ReportPreview> {
    const { data, meta } = await api.getWithMeta<ReportPreviewData, { total: number }>(
      reportPath(type),
      { ...params, pageSize: PREVIEW_SIZE },
    );
    return { ...data, total: meta.total };
  },

  export: (type: ReportType, format: ExportFormat, params: ReportPeriodParams) =>
    api.getBlob(`${reportPath(type)}/export`, { ...params, format }),
};
