import { useId } from 'react';
import { Link } from 'react-router';

import { paths } from '@/routes/paths';
import type { PaginationMeta } from '@/types/api';
import { formatDate } from '@/utils/formatDate';

import refreshIcon from '../../assets/refresh.svg';
import { formatCount } from '../../dashboard.format';
import type { RecentSeller } from '../../dashboard.types';
import { RECENT_SELLERS_ANCHOR } from '../DashboardKpis/DashboardKpis';
import styles from './RecentSellersTable.module.css';
import { SellersPager } from './SellersPager';

const EMPTY_MESSAGE = 'Não foram encontrados dados para os filtros selecionados';

interface RecentSellersTableProps {
  sellers: RecentSeller[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

function SellerIdentity({ seller }: { seller: RecentSeller }) {
  return (
    <div className={styles.seller}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(seller.name)}
      </span>
      <div>
        <p className={styles.name}>{seller.name}</p>
        <p className={styles.email}>{seller.email}</p>
      </div>
    </div>
  );
}

function SellerRow({ seller }: { seller: RecentSeller }) {
  return (
    <tr>
      <td>
        <SellerIdentity seller={seller} />
      </td>
      <td className={styles.date}>{formatDate(seller.createdAt)}</td>
      <td className={styles.actions}>
        <Link
          to={paths.backoffice.users}
          className={styles.action}
          aria-label={`Ver informações de ${seller.name}`}
        >
          Ver Informações
        </Link>
      </td>
    </tr>
  );
}

function ToolbarTitle({ titleId, total }: { titleId: string; total: number }) {
  return (
    <div>
      <div className={styles.titleRow}>
        <h2 id={titleId} className={styles.title}>
          Cadastros dos Vendedores Recentes
        </h2>
        <span className={styles.count}>{formatCount(total)} no período</span>
      </div>
      <p className={styles.subtitle}>
        Vendedores que criaram conta no período, do mais recente para o mais antigo.
      </p>
    </div>
  );
}

interface ToolbarProps {
  titleId: string;
  total: number;
  onRefresh?: () => void;
}

function Toolbar({ titleId, total, onRefresh }: ToolbarProps) {
  return (
    <header className={styles.toolbar}>
      <ToolbarTitle titleId={titleId} total={total} />
      {onRefresh && (
        <button type="button" className={styles.refresh} onClick={onRefresh}>
          <img src={refreshIcon} alt="" width={12} height={12} />
          Atualizar Lista
        </button>
      )}
    </header>
  );
}

function SellersHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Vendedor / Loja</th>
        <th scope="col">Cadastro</th>
        <th scope="col" className={styles.actions}>
          Ações
        </th>
      </tr>
    </thead>
  );
}

function SellersTable({ titleId, sellers }: { titleId: string; sellers: RecentSeller[] }) {
  return (
    <table className={styles.table} aria-labelledby={titleId}>
      <SellersHead />
      <tbody>
        {sellers.length === 0 && (
          <tr>
            <td colSpan={3} className={styles.empty}>
              {EMPTY_MESSAGE}
            </td>
          </tr>
        )}
        {sellers.map((seller) => (
          <SellerRow key={seller.id} seller={seller} />
        ))}
      </tbody>
    </table>
  );
}

function Footer({
  meta,
  shown,
  onPageChange,
}: {
  meta: PaginationMeta;
  shown: number;
  onPageChange: (page: number) => void;
}) {
  const first = shown === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const last = shown === 0 ? 0 : first + shown - 1;

  return (
    <footer className={styles.footer}>
      <p className={styles.showing}>
        Mostrando{' '}
        <b>
          {first} a {last}
        </b>{' '}
        de {formatCount(meta.total)} vendedores cadastrados no período
      </p>
      <SellersPager page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </footer>
  );
}

export function RecentSellersTable({
  sellers,
  meta,
  onPageChange,
  onRefresh,
}: RecentSellersTableProps) {
  const titleId = useId();

  return (
    <section id={RECENT_SELLERS_ANCHOR} className={styles.card} aria-labelledby={titleId}>
      <Toolbar titleId={titleId} total={meta.total} onRefresh={onRefresh} />
      <div className={styles.scroll}>
        <SellersTable titleId={titleId} sellers={sellers} />
      </div>
      <Footer meta={meta} shown={sellers.length} onPageChange={onPageChange} />
    </section>
  );
}
