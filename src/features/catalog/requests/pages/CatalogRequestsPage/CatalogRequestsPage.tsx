import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { Tabs } from '@/components/Tabs/Tabs';
import { Toast } from '@/components/Toast/Toast';

import { REQUESTS_PAGE_SIZE, requestTabs } from '../../catalog-requests.labels';
import { useCatalogRequests } from '../../catalog-requests.queries';
import type { RequestTab } from '../../catalog-requests.types';
import { CatalogRequestCard } from '../../components/CatalogRequestCard/CatalogRequestCard';
import { RequestReviewDialogs } from '../../components/RequestReviewDialogs/RequestReviewDialogs';
import { RequestsHeader } from '../../components/RequestsHeader/RequestsHeader';
import { type RequestReview, useRequestReview } from '../../hooks/useRequestReview';
import styles from './CatalogRequestsPage.module.css';

type RequestsQuery = ReturnType<typeof useCatalogRequests>;
type RequestsPage = NonNullable<RequestsQuery['data']>;

interface QueueProps {
  query: RequestsQuery;
  review: RequestReview;
  onPageChange: (page: number) => void;
}

function RequestsError({ query }: { query: RequestsQuery }) {
  return (
    <div className={styles.feedback}>
      <ErrorState message={query.error?.message} />
      <Button variant="secondary" onClick={() => void query.refetch()}>
        Tentar de novo
      </Button>
    </div>
  );
}

interface RequestsListProps extends Omit<QueueProps, 'query'> {
  page: RequestsPage;
}

function RequestsList({ page: { data: requests, meta }, review, onPageChange }: RequestsListProps) {
  return (
    <div className={styles.queue}>
      {requests.map((request) => (
        <CatalogRequestCard
          key={request.id}
          request={request}
          onApprove={review.askApproval}
          onReject={review.askRejection}
        />
      ))}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        itemLabel="solicitações"
        onPageChange={onPageChange}
      />
    </div>
  );
}

function RequestsQueue({ query, ...props }: QueueProps) {
  if (query.isPending) return <LoadingState message="Carregando as solicitações…" />;
  if (query.isError) return <RequestsError query={query} />;
  if (query.data.data.length === 0) {
    return <EmptyState title="Nenhuma solicitação pendente" message="A fila está em dia." />;
  }
  return <RequestsList page={query.data} {...props} />;
}

function ApprovedToast({ review }: { review: RequestReview }) {
  return (
    <Toast
      message={review.approvedNotice && 'Solicitação aprovada'}
      detail={review.approvedNotice ?? undefined}
      placement="top"
      tinted
      onDismiss={review.dismissApproved}
    />
  );
}

function useRequestsQueue() {
  const [tab, setTab] = useState<RequestTab>('ALL');
  const [page, setPage] = useState(1);
  const query = useCatalogRequests({
    type: tab === 'ALL' ? undefined : tab,
    page,
    pageSize: REQUESTS_PAGE_SIZE,
  });

  const changeTab = (next: RequestTab) => {
    setTab(next);
    setPage(1);
  };

  return { tab, query, changeTab, setPage, pending: query.data?.meta.pendingByType };
}

export function CatalogRequestsPage() {
  const { tab, query, changeTab, setPage, pending } = useRequestsQueue();
  const review = useRequestReview();

  return (
    <section className={styles.page}>
      <RequestsHeader pending={pending?.ALL}>
        <Tabs
          label="Tipos de solicitação"
          items={requestTabs(pending)}
          activeId={tab}
          onChange={changeTab}
        >
          <RequestsQueue query={query} review={review} onPageChange={setPage} />
        </Tabs>
      </RequestsHeader>
      <RequestReviewDialogs review={review} />
      <ApprovedToast review={review} />
    </section>
  );
}
