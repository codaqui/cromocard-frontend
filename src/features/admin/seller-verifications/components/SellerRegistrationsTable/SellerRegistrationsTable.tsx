import { useId } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/Badge/Badge';
import { userDetailPathFor } from '@/routes/paths';
import type { PaginationMeta } from '@/types/api';
import type { SellerVerificationStatus } from '@/types/seller-verification';
import { formatDate } from '@/utils/formatDate';

import { canDecide, statusLabels, statusTones } from '../../seller-verifications.labels';
import type { SellerVerificationListItem } from '../../seller-verifications.types';
import styles from './SellerRegistrationsTable.module.css';

export const SELLER_REGISTRATIONS_ANCHOR = 'vendedores-recentes';

const EMPTY_MESSAGE = 'Não foram encontrados dados para os filtros selecionados';
const STATUS_FILTER_OPTIONS: { value: SellerVerificationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'UNDER_REVIEW', label: 'Em análise' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Reprovado' },
];

interface SellerRegistrationsTableProps {
  items: SellerVerificationListItem[];
  meta: PaginationMeta;
  pendingCount: number;
  statusFilter: SellerVerificationStatus | 'ALL';
  onStatusFilterChange: (status: SellerVerificationStatus | 'ALL') => void;
  onValidate: (item: SellerVerificationListItem) => void;
  onRefresh: () => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

function SellerIdentity({ item }: { item: SellerVerificationListItem }) {
  return (
    <div className={styles.seller}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(item.seller.name)}
      </span>
      <div>
        <p className={styles.name}>{item.seller.name}</p>
        <p className={styles.email}>{item.seller.email}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SellerVerificationStatus }) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

function RowActions({
  item,
  onValidate,
}: {
  item: SellerVerificationListItem;
  onValidate: (item: SellerVerificationListItem) => void;
}) {
  return (
    <div className={styles.actions}>
      <Link
        to={userDetailPathFor(item.seller.id)}
        className={styles.action}
        aria-label={`Ver informações de ${item.seller.name}`}
      >
        Ver Informações
      </Link>
      {canDecide(item.status) && (
        <button type="button" className={styles.validate} onClick={() => onValidate(item)}>
          Validar Cadastro
        </button>
      )}
    </div>
  );
}

function SellerRow({
  item,
  onValidate,
}: {
  item: SellerVerificationListItem;
  onValidate: (item: SellerVerificationListItem) => void;
}) {
  return (
    <tr>
      <td>
        <SellerIdentity item={item} />
      </td>
      <td className={styles.cnpj}>{item.cnpj}</td>
      <td>
        <StatusBadge status={item.status} />
      </td>
      <td className={styles.date}>{formatDate(item.createdAt)}</td>
      <td className={styles.actionsCell}>
        <RowActions item={item} onValidate={onValidate} />
      </td>
    </tr>
  );
}

function ToolbarTitle({ titleId, pendingCount }: { titleId: string; pendingCount: number }) {
  return (
    <div>
      <div className={styles.titleRow}>
        <h2 id={titleId} className={styles.title}>
          Cadastros dos Vendedores Recentes
        </h2>
        <span className={styles.count}>{pendingCount} pendente(s)</span>
      </div>
      <p className={styles.subtitle}>
        Vendedores com credenciamento para analisar, aprovar ou rejeitar.
      </p>
    </div>
  );
}

function StatusFilter({
  value,
  onChange,
}: {
  value: SellerVerificationStatus | 'ALL';
  onChange: (status: SellerVerificationStatus | 'ALL') => void;
}) {
  return (
    <select
      className={styles.filter}
      aria-label="Filtrar por status"
      value={value}
      onChange={(event) => onChange(event.target.value as SellerVerificationStatus | 'ALL')}
    >
      {STATUS_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface ToolbarProps {
  titleId: string;
  pendingCount: number;
  statusFilter: SellerVerificationStatus | 'ALL';
  onStatusFilterChange: (status: SellerVerificationStatus | 'ALL') => void;
  onRefresh: () => void;
}

function Toolbar({
  titleId,
  pendingCount,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}: ToolbarProps) {
  return (
    <header className={styles.toolbar}>
      <ToolbarTitle titleId={titleId} pendingCount={pendingCount} />
      <div className={styles.toolbarActions}>
        <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
        <button type="button" className={styles.refresh} onClick={onRefresh}>
          Atualizar Fila
        </button>
      </div>
    </header>
  );
}

function RegistrationsHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Vendedor / Loja</th>
        <th scope="col">CNPJ</th>
        <th scope="col">Status da análise</th>
        <th scope="col">Cadastro</th>
        <th scope="col" className={styles.actionsCell}>
          Ações
        </th>
      </tr>
    </thead>
  );
}

function RegistrationsBody({
  items,
  onValidate,
}: {
  items: SellerVerificationListItem[];
  onValidate: (item: SellerVerificationListItem) => void;
}) {
  return (
    <tbody>
      {items.length === 0 && (
        <tr>
          <td colSpan={5} className={styles.empty}>
            {EMPTY_MESSAGE}
          </td>
        </tr>
      )}
      {items.map((item) => (
        <SellerRow key={item.id} item={item} onValidate={onValidate} />
      ))}
    </tbody>
  );
}

function RegistrationsTable({
  titleId,
  items,
  onValidate,
}: {
  titleId: string;
  items: SellerVerificationListItem[];
  onValidate: (item: SellerVerificationListItem) => void;
}) {
  return (
    <table className={styles.table} aria-labelledby={titleId}>
      <RegistrationsHead />
      <RegistrationsBody items={items} onValidate={onValidate} />
    </table>
  );
}

function ShowingCount({ shown, total }: { shown: number; total: number }) {
  return (
    <p className={styles.showing}>
      Mostrando {shown} de {total} cadastros
    </p>
  );
}

type CardBodyProps = SellerRegistrationsTableProps & { titleId: string };

function CardBody({ titleId, items, meta, onValidate, ...toolbar }: CardBodyProps) {
  return (
    <>
      <Toolbar titleId={titleId} {...toolbar} />
      <div className={styles.scroll}>
        <RegistrationsTable titleId={titleId} items={items} onValidate={onValidate} />
      </div>
      <ShowingCount shown={items.length} total={meta.total} />
    </>
  );
}

export function SellerRegistrationsTable(props: SellerRegistrationsTableProps) {
  const titleId = useId();

  return (
    <section id={SELLER_REGISTRATIONS_ANCHOR} className={styles.card} aria-labelledby={titleId}>
      <CardBody titleId={titleId} {...props} />
    </section>
  );
}
