import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { downloadFile } from '@/lib/download-file';

import { reportsApi } from './reports.api';
import { reportFileName } from './reports.format';
import type { ExportReportInput, ReportPeriodParams, ReportType } from './reports.types';

export const reportsKeys = {
  all: ['admin', 'reports'] as const,
  preview: (type: ReportType, params: ReportPeriodParams) =>
    [...reportsKeys.all, 'preview', type, params] as const,
};

export function useReportPreview(type: ReportType, params: ReportPeriodParams) {
  return useQuery({
    queryKey: reportsKeys.preview(type, params),
    queryFn: () => reportsApi.preview(type, params),
    placeholderData: keepPreviousData,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ type, format, params, period }: ExportReportInput) => {
      const file = await reportsApi.export(type, format, params);
      downloadFile(file, reportFileName(type, period, format));
    },
  });
}
