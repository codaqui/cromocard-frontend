import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { downloadFile } from '@/lib/download-file';

import { EXPORTS_PAGE_SIZE, reportsApi } from './reports.api';
import { reportFileName } from './reports.format';
import type {
  ExportReportInput,
  ReportExport,
  ReportPeriodParams,
  ReportType,
} from './reports.types';

export const reportsKeys = {
  all: ['admin', 'reports'] as const,
  preview: (type: ReportType, params: ReportPeriodParams) =>
    [...reportsKeys.all, 'preview', type, params] as const,
  exports: () => [...reportsKeys.all, 'exports'] as const,
  exportsPage: (page: number) => [...reportsKeys.exports(), page] as const,
};

export function useReportPreview(type: ReportType, params: ReportPeriodParams) {
  return useQuery({
    queryKey: reportsKeys.preview(type, params),
    queryFn: () => reportsApi.preview(type, params),
    placeholderData: keepPreviousData,
  });
}

export function useExportReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, format, params, period }: ExportReportInput) => {
      const file = await reportsApi.export(type, format, params);
      downloadFile(file, reportFileName(type, period, format));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsKeys.exports() }),
  });
}

export function useReportExports(page: number) {
  return useQuery({
    queryKey: reportsKeys.exportsPage(page),
    queryFn: () => reportsApi.listExports({ page, pageSize: EXPORTS_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: async ({ id, type, filters, format }: ReportExport) => {
      const file = await reportsApi.downloadExport(id);
      downloadFile(file, reportFileName(type, filters, format));
    },
  });
}
