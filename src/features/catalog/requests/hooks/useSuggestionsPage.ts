import { useState } from 'react';

import { SUGGESTIONS_PAGE_SIZE } from '../catalog-request-votes.labels';
import { useVotingSuggestions } from '../catalog-request-votes.queries';

export function useSuggestionsPage() {
  const [page, setPage] = useState(1);
  const query = useVotingSuggestions({ page, pageSize: SUGGESTIONS_PAGE_SIZE });
  const meta = query.data?.meta;
  const isPastLastPage = query.data?.data.length === 0 && (meta?.total ?? 0) > 0;

  if (isPastLastPage && meta && page !== meta.totalPages) setPage(meta.totalPages);

  return { query, setPage };
}
