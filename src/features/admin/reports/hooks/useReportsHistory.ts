import { useState } from 'react';

import { ApiError } from '@/lib/api-error';

import { exportParamsOf, reportTitle } from '../reports.history';
import { useDownloadExport, useReportExports } from '../reports.queries';
import type { ReportExport } from '../reports.types';
import type { ExportFlow } from './useReportsPage';

const EXPORT_EXPIRED = 'EXPORT_EXPIRED';

const isExpiredError = (error: unknown) =>
  error instanceof ApiError && error.code === EXPORT_EXPIRED;

function useExpiredExport(flow: ExportFlow) {
  const [expired, setExpired] = useState<ReportExport | null>(null);

  const regenerate = (item: ReportExport) => {
    const input = {
      type: item.type,
      format: item.format,
      params: exportParamsOf(item),
      period: item.filters,
    };
    const onSuccess = () => {
      setExpired(null);
      flow.showExported(reportTitle(item.type), item.format);
    };
    flow.exportReport.mutate(input, { onSuccess });
  };

  const close = () => {
    flow.exportReport.reset();
    setExpired(null);
  };

  return { expired, open: setExpired, close, regenerate };
}

export function useReportsHistory(flow: ExportFlow) {
  const [page, setPage] = useState(1);
  const exportsQuery = useReportExports(page);
  const download = useDownloadExport();
  const expiredExport = useExpiredExport(flow);

  const requestDownload = (item: ReportExport) => {
    if (item.expired) return expiredExport.open(item);
    const onError = (error: unknown) => isExpiredError(error) && expiredExport.open(item);
    download.mutate(item, { onError });
  };

  return { page, setPage, exportsQuery, download, requestDownload, expiredExport };
}

export type ReportsHistoryState = ReturnType<typeof useReportsHistory>;
