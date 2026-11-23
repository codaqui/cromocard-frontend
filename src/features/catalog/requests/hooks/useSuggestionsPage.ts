import { useState } from 'react';

import { SUGGESTIONS_PAGE_SIZE } from '../catalog-request-votes.labels';
import { useVotingSuggestions } from '../catalog-request-votes.queries';

export function useSuggestionsPage() {
  const [page, setPage] = useState(1);
  const query = useVotingSuggestions({ page, pageSize: SUGGESTIONS_PAGE_SIZE });
  const { data } = query;
  const lastPage =
    data && data.data.length === 0 && data.meta.total > 0 ? data.meta.totalPages : null;

  if (lastPage !== null && lastPage !== page) setPage(lastPage);

  return { query, setPage };
}
