import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { Toast } from '@/components/Toast/Toast';

import { closedVotingDetail, countLabel } from '../../catalog-request-votes.format';
import { SUGGESTIONS_PAGE_SIZE, VOTING_CLOSED_TITLE } from '../../catalog-request-votes.labels';
import { useVotingSuggestions } from '../../catalog-request-votes.queries';
import { SuggestionsHeader } from '../../components/SuggestionsHeader/SuggestionsHeader';
import { SuggestionVoteCard } from '../../components/SuggestionVoteCard/SuggestionVoteCard';
import { type SuggestionVote, useSuggestionVote } from '../../hooks/useSuggestionVote';
import styles from './CommunitySuggestionsPage.module.css';

type SuggestionsQuery = ReturnType<typeof useVotingSuggestions>;
type SuggestionsPage = NonNullable<SuggestionsQuery['data']>;

interface ListProps {
  page: SuggestionsPage;
  voting: SuggestionVote;
  onPageChange: (page: number) => void;
}

function SectionTitle({ total }: { total: number }) {
  return (
    <p className={styles.sectionTitle}>
      Em votação
      <span className={styles.dot} aria-hidden="true" />
      <span>{countLabel(total, 'sugestão de categoria', 'sugestões de categoria')}</span>
    </p>
  );
}

function SuggestionsList({ page: { data, meta }, voting, onPageChange }: ListProps) {
  return (
    <>
      <SectionTitle total={meta.total} />
      {data.map((suggestion) => (
        <SuggestionVoteCard
          key={suggestion.id}
          suggestion={suggestion}
          voting={voting.pendingId === suggestion.id}
          onVote={voting.vote}
        />
      ))}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        itemLabel="sugestões"
        onPageChange={onPageChange}
      />
    </>
  );
}

function EmptySuggestions() {
  return (
    <div className={styles.emptyCard}>
      <Icon name="howToVote" size={40} />
      <EmptyState
        title="Nenhuma sugestão em votação"
        message="Quando um colecionador sugerir uma nova categoria, ela aparece aqui para a comunidade votar."
      />
    </div>
  );
}

function SuggestionsContent({
  query,
  ...props
}: Omit<ListProps, 'page'> & { query: SuggestionsQuery }) {
  if (query.isPending) return <LoadingState message="Carregando as sugestões…" />;
  if (query.isError) {
    return (
      <div className={styles.feedback}>
        <ErrorState message={query.error.message} />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }
  if (query.data.data.length === 0) {
    return <EmptySuggestions />;
  }
  return <SuggestionsList page={query.data} {...props} />;
}

/** Aviso do frame 1038-2242 (votação encerrada) ou de outra falha ao votar. */
function VoteToast({ voting }: { voting: SuggestionVote }) {
  if (voting.closedCode) {
    return (
      <Toast
        message={VOTING_CLOSED_TITLE}
        detail={closedVotingDetail(voting.closedCode)}
        tone="warning"
        placement="top"
        onDismiss={voting.dismiss}
      />
    );
  }
  return (
    <Toast message={voting.failure} tone="danger" placement="top" onDismiss={voting.dismiss} />
  );
}

/** Página "Sugestões da comunidade" (CCD103, frames 1038-1750, 1038-2242 e 1038-2740). */
export function CommunitySuggestionsPage() {
  const [page, setPage] = useState(1);
  const query = useVotingSuggestions({ page, pageSize: SUGGESTIONS_PAGE_SIZE });
  const voting = useSuggestionVote();
  const myVotes = query.data?.data.filter(({ myVote }) => myVote !== null).length ?? 0;

  return (
    <section className={styles.page}>
      <SuggestionsHeader open={query.data?.meta.total} myVotes={myVotes} />
      <div className={styles.list}>
        <SuggestionsContent query={query} voting={voting} onPageChange={setPage} />
      </div>
      <VoteToast voting={voting} />
    </section>
  );
}
