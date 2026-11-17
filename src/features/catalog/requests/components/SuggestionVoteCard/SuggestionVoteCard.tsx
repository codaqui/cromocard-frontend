import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { countWithShare, handleOf, votesLabel } from '../../catalog-request-votes.format';
import { myVoteText, VOTE_OPTIONS } from '../../catalog-request-votes.labels';
import type { CatalogVote, VotingSuggestion } from '../../catalog-request-votes.types';
import styles from './SuggestionVoteCard.module.css';

interface SuggestionVoteCardProps {
  suggestion: VotingSuggestion;
  voting: boolean;
  onVote: (suggestion: VotingSuggestion, vote: CatalogVote) => void;
}

function SuggestionSummary({ suggestion }: { suggestion: VotingSuggestion }) {
  return (
    <header className={styles.top}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="category" size={24} />
      </span>
      <div className={styles.info}>
        <p className={styles.meta}>
          <span className={styles.badge}>Nova categoria sugerida</span>
          <span>Protocolo {suggestion.code}</span>
          <span>• sugerida por {handleOf(suggestion)}</span>
        </p>
        <h2 className={styles.title}>{suggestion.name}</h2>
        {suggestion.description && <p className={styles.description}>{suggestion.description}</p>}
      </div>
      <p className={styles.seal}>
        <strong>{votesLabel(suggestion.votes.total)}</strong>
        <span>na votação</span>
      </p>
    </header>
  );
}

function VoteCounts({ votes }: Pick<VotingSuggestion, 'votes'>) {
  const counts = [
    { label: 'A favor', value: votes.for, tone: styles.for },
    { label: 'Neutros', value: votes.neutral, tone: styles.neutral },
    { label: 'Contra', value: votes.against, tone: styles.against },
  ];
  return (
    <section className={styles.counts} aria-label="Votos da comunidade">
      <p className={styles.countsTitle}>
        <Icon name="howToVote" size={16} />
        Votos da comunidade
      </p>
      <dl className={styles.countList}>
        {counts.map(({ label, value, tone }) => (
          <div key={label} className={styles.count}>
            <dt>{label}</dt>
            <dd className={tone}>{countWithShare(value, votes.total)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function VoteButtons({ suggestion, voting, onVote }: SuggestionVoteCardProps) {
  return (
    <div className={styles.buttons} role="group" aria-label={`Votar em ${suggestion.name}`}>
      {VOTE_OPTIONS.map(({ vote, label, icon }) => (
        <button
          key={vote}
          type="button"
          className={cn(styles.vote, suggestion.myVote === vote && styles.selected)}
          aria-pressed={suggestion.myVote === vote}
          disabled={voting}
          onClick={() => onVote(suggestion, vote)}
        >
          <Icon name={icon} size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Cartão de uma sugestão em votação (frame 1038-1750): resumo, contagem e os três botões de voto. */
export function SuggestionVoteCard(props: SuggestionVoteCardProps) {
  const { suggestion } = props;

  return (
    <article className={styles.card} aria-label={suggestion.name}>
      <SuggestionSummary suggestion={suggestion} />
      <VoteCounts votes={suggestion.votes} />
      <footer className={styles.actions}>
        <p className={styles.hint}>
          <span className={styles.hintLabel}>Seu voto</span>
          {myVoteText(suggestion.myVote)}
        </p>
        <VoteButtons {...props} />
      </footer>
    </article>
  );
}
