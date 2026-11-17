import { useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';

import { rangeError, uuidDraftError } from '../../audit-logs.filters';
import { auditActionOptions, auditEntityTypeOptions, toAuditAction } from '../../audit-logs.labels';
import { auditPeriodOptions, toAuditPeriodPreset } from '../../audit-logs.period';
import type { AuditLogFiltersController } from '../../hooks/useAuditLogFilters';
import styles from './AuditLogFilters.module.css';
import { QuickFilters } from './QuickFilters';

interface FieldsProps {
  controller: AuditLogFiltersController;
}

function AdminField({ controller }: FieldsProps) {
  const { drafts } = controller.state;

  return (
    <TextField
      label="Moderador / Admin responsável"
      icon="badge"
      placeholder="ID do admin ou clique no nome na tabela"
      value={drafts.adminId}
      error={uuidDraftError(drafts.adminId)}
      onChange={(event) => controller.typeUuid('adminId', event.target.value)}
    />
  );
}

function WhatFields({ controller }: FieldsProps) {
  const { state, changeFilters } = controller;

  return (
    <>
      <Select
        label="Tipo de ação executada"
        icon="gavel"
        placeholder="Todas as ações"
        options={auditActionOptions}
        value={state.filters.action ?? ''}
        onChange={(event) => changeFilters({ action: toAuditAction(event.target.value) })}
      />
      <Select
        label="Tipo de entidade"
        icon="category"
        placeholder="Todas as entidades"
        options={auditEntityTypeOptions}
        value={state.filters.entityType ?? ''}
        onChange={(event) => changeFilters({ entityType: event.target.value || undefined })}
      />
    </>
  );
}

function WhenAndTargetFields({ controller }: FieldsProps) {
  const { state, typeUuid, choosePreset } = controller;

  return (
    <>
      <Select
        label="Período temporal / Data"
        icon="calendarMonth"
        options={auditPeriodOptions}
        value={state.preset}
        onChange={(event) => choosePreset(toAuditPeriodPreset(event.target.value))}
      />
      <TextField
        label="Pesquisa por ID do alvo"
        icon="search"
        placeholder="UUID do usuário, grupo ou carta"
        value={state.drafts.entityId}
        error={uuidDraftError(state.drafts.entityId)}
        onChange={(event) => typeUuid('entityId', event.target.value)}
      />
    </>
  );
}

function CustomRangeFields({ controller }: FieldsProps) {
  const { state, changeFilters } = controller;
  if (state.preset !== 'CUSTOM') return null;

  return (
    <div className={styles.range}>
      <TextField
        label="Data inicial"
        type="date"
        value={state.filters.from ?? ''}
        onChange={(event) => changeFilters({ from: event.target.value || undefined })}
      />
      <TextField
        label="Data final"
        type="date"
        value={state.filters.to ?? ''}
        error={rangeError(state.filters)}
        onChange={(event) => changeFilters({ to: event.target.value || undefined })}
      />
    </div>
  );
}

function FiltersHeader({ titleId, onClear }: { titleId: string; onClear: () => void }) {
  return (
    <header className={styles.header}>
      <h2 id={titleId} className={styles.title}>
        <span className={styles.titleIcon}>
          <Icon name="manageSearch" size={20} />
        </span>
        Filtros de Investigação
      </h2>
      <button type="button" className={styles.clear} onClick={onClear}>
        <Icon name="restartAlt" size={14} />
        Limpar filtros
      </button>
    </header>
  );
}

interface AuditLogFiltersProps {
  controller: AuditLogFiltersController;
  shown: number;
}

export function AuditLogFilters({ controller, shown }: AuditLogFiltersProps) {
  const titleId = useId();

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <FiltersHeader titleId={titleId} onClear={controller.clear} />
      <div className={styles.grid}>
        <AdminField controller={controller} />
        <WhatFields controller={controller} />
        <WhenAndTargetFields controller={controller} />
      </div>
      <CustomRangeFields controller={controller} />
      <QuickFilters
        active={controller.state.filters.action}
        shown={shown}
        onToggle={controller.toggleAction}
      />
    </section>
  );
}
