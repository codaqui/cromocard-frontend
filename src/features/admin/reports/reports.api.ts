import { api } from '@/lib/http';
import type { PaginationParams } from '@/types/api';

import type {
  ExportFormat,
  ReportExport,
  ReportPeriodParams,
  ReportPreview,
  ReportPreviewData,
  ReportType,
} from './reports.types';

export const PREVIEW_SIZE = 4;
export const EXPORTS_PAGE_SIZE = 10;

const reportPath = (type: ReportType) => `/admin/reports/${type}`;
const EXPORTS_PATH = '/admin/reports/exports';

export const reportsApi = {
  preview: async (type: ReportType, params: ReportPeriodParams): Promise<ReportPreview> => {
    const { data, meta } = await api.getWithMeta<ReportPreviewData, { total: number }>(
      reportPath(type),
      { ...params, pageSize: PREVIEW_SIZE },
    );
    return { ...data, total: meta.total };
  },

  export: (type: ReportType, format: ExportFormat, params: ReportPeriodParams) =>
    api.getBlob(`${reportPath(type)}/export`, { ...params, format }),

  listExports: (params: PaginationParams) => api.getPage<ReportExport>(EXPORTS_PATH, params),

  downloadExport: (id: string) => api.getBlob(`${EXPORTS_PATH}/${id}/file`),
};
