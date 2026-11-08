import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { formatGroupCode, formatMembers } from '../../community-admin.format';
import { groupStatusLabels } from '../../community-admin.labels';
import type {
  AdminGroupSummary,
  GroupAction,
  OnCommunityAction,
} from '../../community-admin.types';
import styles from './GroupsSection.module.css';

interface GroupsTableProps {
  groups: AdminGroupSummary[];
  onAction: OnCommunityAction;
}

interface GroupRowProps {
  group: AdminGroupSummary;
  onAction: OnCommunityAction;
}

function GroupIdentity({ group }: { group: AdminGroupSummary }) {
  const isSuspended = group.status === 'SUSPENDED';

  return (
    <div className={styles.identity}>
      <span className={styles.groupIcon} aria-hidden="true">
        <Icon name={isSuspended ? 'block' : 'users'} size={16} />
      </span>
      <div>
        <p className={styles.groupName}>{group.name}</p>
        <p className={styles.groupCode}>ID: {formatGroupCode(group.id)}</p>
      </div>
    </div>
  );
}

function GroupMembers({ group }: { group: AdminGroupSummary }) {
  return (
    <div className={styles.members}>
      <p className={styles.membersCount}>{formatMembers(group.membersCount)}</p>
      <p className={styles.leader}>
        <Icon name="shield" size={12} />
        {group.creatorName}
      </p>
    </div>
  );
}

function GroupStatusBadge({ group }: { group: AdminGroupSummary }) {
  return (
    <span className={cn(styles.status, styles[group.status])}>
      {groupStatusLabels[group.status]}
    </span>
  );
}

function GroupActions({ group, onAction }: GroupRowProps) {
  const act = (action: GroupAction) => () => onAction({ kind: 'group', action, group });
  const isSuspended = group.status === 'SUSPENDED';

  return (
    <div className={styles.actions}>
      {isSuspended ? (
        <button type="button" className={styles.reactivate} onClick={act('reactivate')}>
          <Icon name="refresh" size={14} />
          Reativar
        </button>
      ) : (
        <button type="button" className={styles.suspend} onClick={act('suspend')}>
          <Icon name="pauseCircle" size={14} />
          Suspender
        </button>
      )}
      <button type="button" className={styles.remove} onClick={act('delete')}>
        <Icon name="delete" size={14} />
        Excluir
      </button>
    </div>
  );
}

function GroupRow({ group, onAction }: GroupRowProps) {
  return (
    <tr className={cn(group.status === 'SUSPENDED' && styles.suspendedRow)}>
      <td>
        <GroupIdentity group={group} />
      </td>
      <td>
        <GroupMembers group={group} />
      </td>
      <td className={styles.centered}>
        <GroupStatusBadge group={group} />
      </td>
      <td>
        <GroupActions group={group} onAction={onAction} />
      </td>
    </tr>
  );
}

function GroupsTableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Grupo</th>
        <th scope="col">Membros / Líder</th>
        <th scope="col" className={styles.centered}>
          Status Operacional
        </th>
        <th scope="col" className={styles.actionsHeader}>
          Ações Administrativas
        </th>
      </tr>
    </thead>
  );
}

export function GroupsTable({ groups, onAction }: GroupsTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>Grupos da comunidade</caption>
        <GroupsTableHead />
        <tbody>
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} onAction={onAction} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
