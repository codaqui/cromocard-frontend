import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import {
  categoryApprovalNote,
  handleOf,
  initialsOf,
  itemNameOf,
  percentLabel,
} from '../../catalog-requests.format';
import { requestTypeTexts } from '../../catalog-requests.labels';
import type { CatalogRequest, CatalogRequestType, QuorumVotes } from '../../catalog-requests.types';
import extras from './CardExtras.module.css';
import styles from './CatalogRequestCard.module.css';
import { SuggestedDetails } from './SuggestedDetails';

interface CatalogRequestCardProps {
  request: CatalogRequest;
  onApprove: (request: CatalogRequest) => void;
  onReject: (request: CatalogRequest) => void;
}

const TYPE_ICONS: Record<CatalogRequestType, IconName> = {
  CARD: 'cards',
  ALBUM: 'bookOutline',
  CATEGORY: 'category',
};

function VotesSeal({ votes }: { votes: QuorumVotes }) {
  return (
    <span className={extras.seal}>
      <Icon name="howToVote" size={20} />
      <span>
        <strong>{votes.total} votos</strong>
        {percentLabel(votes.forPercent)} a favor
      </span>
    </span>
  );
}

function RequesterChip({ request }: { request: CatalogRequest }) {
  return (
    <span className={styles.requester} title={request.requester.name}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(request.requester)}
      </span>
      {handleOf(request.requester)}
    </span>
  );
}

function CardTopBar({ request }: { request: CatalogRequest }) {
  return (
    <header className={styles.topBar}>
      <span className={styles.typeIcon} aria-hidden="true">
        <Icon name={TYPE_ICONS[request.type]} size={20} />
      </span>
      <span className={styles.badge}>{requestTypeTexts[request.type].badge}</span>
      <span className={styles.protocol}>Protocolo {request.code}</span>
      {request.votes ? <VotesSeal votes={request.votes} /> : <RequesterChip request={request} />}
    </header>
  );
}

/** Na categoria, o rodapé conta as subcategorias e avisa que a votação acaba (CCD103, R6, R12). */
function approvalNoteOf({ type, data }: CatalogRequest): string {
  if (type !== 'CATEGORY') return requestTypeTexts[type].approvalNote;
  return categoryApprovalNote(data.subcategories?.length ?? 0);
}

function CardActions({ request, onApprove, onReject }: CatalogRequestCardProps) {
  return (
    <footer className={styles.actions}>
      <p className={styles.note}>
        <Icon name="infoOutline" size={16} />
        {approvalNoteOf(request)}
      </p>
      <div className={styles.buttons}>
        <Button variant="secondary" onClick={() => onReject(request)}>
          <Icon name="block" size={16} />
          Recusar
        </Button>
        <Button onClick={() => onApprove(request)}>
          <Icon name="checkCircle" size={16} />
          Aprovar
        </Button>
      </div>
    </footer>
  );
}

/** Um card aberto da fila (frame 228-1804): cada card é o detalhe da solicitação (L6). */
export function CatalogRequestCard(props: CatalogRequestCardProps) {
  const { request } = props;

  return (
    <article
      className={cn(styles.card, styles[request.type])}
      aria-label={`${requestTypeTexts[request.type].badge}: ${itemNameOf(request)}`}
    >
      <CardTopBar request={request} />
      <SuggestedDetails request={request} />
      <CardActions {...props} />
    </article>
  );
}
