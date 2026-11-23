import { countWithShare } from '../../catalog-request-votes.format';
import type { VoteTally } from '../../catalog-request-votes.types';
import styles from './VoteBreakdown.module.css';

interface VoteBreakdownProps {
  votes: VoteTally;
  variant: 'quorum' | 'community';
}

export function VoteBreakdown({ votes, variant }: VoteBreakdownProps) {
  const counts = [
    { label: 'A favor', value: votes.for, tone: styles.for },
    { label: 'Neutros', value: votes.neutral, tone: styles.neutral },
    { label: 'Contra', value: votes.against, tone: styles.against },
  ];
  return (
    <dl className={styles[variant]}>
      {counts.map(({ label, value, tone }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={tone}>{countWithShare(value, votes.total)}</dd>
        </div>
      ))}
    </dl>
  );
}
