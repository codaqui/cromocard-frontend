import { Link } from 'react-router';

import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { Pagination } from '@/components/Pagination/Pagination';
import { paths } from '@/routes/paths';
import type { PaginationMeta } from '@/types/api';
import { formatDate } from '@/utils/formatDate';

import type { RecentSeller } from '../../dashboard.types';
import styles from './RecentSellersTable.module.css';

interface RecentSellersTableProps {
  sellers: RecentSeller[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const columns: DataTableColumn<RecentSeller>[] = [
  { key: 'name', header: 'Vendedor', render: (seller) => seller.name },
  { key: 'email', header: 'E-mail', render: (seller) => seller.email },
  { key: 'createdAt', header: 'Cadastro', render: (seller) => formatDate(seller.createdAt) },
  {
    key: 'details',
    header: 'Ações',
    render: (seller) => (
      <Link to={paths.backoffice.users} aria-label={`Ver informações de ${seller.name}`}>
        Ver informações
      </Link>
    ),
  },
];

export function RecentSellersTable({ sellers, meta, onPageChange }: RecentSellersTableProps) {
  return (
    <section className={styles.section} aria-labelledby="recent-sellers-title">
      <h2 id="recent-sellers-title" className={styles.title}>
        Cadastros de vendedores recentes
      </h2>
      <DataTable
        caption="Cadastros de vendedores recentes"
        columns={columns}
        rows={sellers}
        getRowKey={(seller) => seller.id}
        emptyMessage="Nenhum vendedor cadastrado no período"
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </section>
  );
}
