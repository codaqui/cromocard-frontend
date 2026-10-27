import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { KpiCard } from '@/components/KpiCard/KpiCard';
import { type Period, PeriodFilter } from '@/components/PeriodFilter/PeriodFilter';
import { Tabs } from '@/components/Tabs/Tabs';
import { Toast } from '@/components/Toast/Toast';

import styles from './DashboardPage.module.css';

interface SampleSeller {
  id: string;
  name: string;
  status: string;
  tone: BadgeTone;
}

const sampleSellers: SampleSeller[] = [
  { id: '1', name: 'Elisa Cartas Raras', status: 'Ativo', tone: 'success' },
  { id: '2', name: 'Fábio TCG Store', status: 'Pendente', tone: 'warning' },
];

const sellerColumns: DataTableColumn<SampleSeller>[] = [
  { key: 'name', header: 'Vendedor', render: (seller) => seller.name },
  {
    key: 'status',
    header: 'Situação',
    render: (seller) => <Badge tone={seller.tone}>{seller.status}</Badge>,
  },
];

const sampleTabs = [
  { id: 'sellers', label: 'Vendedores recentes', count: sampleSellers.length },
  { id: 'empty', label: 'Sem registros', count: 0 },
];

function KpiSample() {
  return (
    <div className={styles.kpis}>
      <KpiCard
        label="Usuários ativos"
        value="—"
        unit="ativos"
        hint="Exemplo"
        trend={{ label: '+0%' }}
      />
      <KpiCard label="Cartas cadastradas" value="—" hint="Exemplo" />
      <KpiCard label="Novos cadastros" value="—" hint="Exemplo" />
    </div>
  );
}

function TableSample() {
  const [activeTab, setActiveTab] = useState('sellers');
  const rows = activeTab === 'sellers' ? sampleSellers : [];

  return (
    <Tabs label="Exemplo de tabela" items={sampleTabs} activeId={activeTab} onChange={setActiveTab}>
      <DataTable
        caption="Vendedores de exemplo"
        columns={sellerColumns}
        rows={rows}
        getRowKey={(seller) => seller.id}
      />
    </Tabs>
  );
}

function ToastSample() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={() => setMessage('Aviso de exemplo')}>
        Mostrar aviso
      </Button>
      <Toast message={message} onDismiss={() => setMessage(null)} />
    </div>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>({ preset: '30d' });

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Badge tone="info">Em construção</Badge>
      </header>
      <p className={styles.notice}>
        Página provisória: os componentes do BackOffice aparecem com dados de exemplo até a CCD058.
      </p>
      <PeriodFilter value={period} onChange={setPeriod} />
      <KpiSample />
      <TableSample />
      <ToastSample />
    </section>
  );
}
