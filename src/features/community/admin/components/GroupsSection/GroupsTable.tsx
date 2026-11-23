import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { GroupVolumeCell, type GroupFinanceStats, type StatsById } from '@/features/admin';
import { cn } from '@/utils/cn';

import { formatGroupCode, formatMembers } from '../../community-admin.format';
import { groupStatusActions, groupStatusLooks } from '../../community-admin.labels';
import type {
  AdminGroupSummary,
  GroupAction,
  OnCommunityAction,
} from '../../community-admin.types';
import styles from './GroupsSection.module.css';

interface GroupsTableProps {
  groups: AdminGroupSummary[];
  onAction: OnCommunityAction;
  financeStats?: StatsById<GroupFinanceStats>;
}

interface GroupRowProps {
  group: AdminGroupSummary;
  onAction: OnCommunityAction;
  stats?: GroupFinanceStats;
}

function GroupIdentity({ group }: { group: AdminGroupSummary }) {
  return (
    <div className={styles.identity}>
      <span className={styles.groupIcon} aria-hidden="true">
        <Icon name={groupStatusLooks[group.status].icon} size={16} />
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
      {groupStatusLooks[group.status].label}
    </span>
  );
}

interface ActionButtonProps {
  label: string;
  icon: IconName;
  groupName: string;
  className?: string;
  onClick: () => void;
}

function ActionButton({ label, icon, groupName, className, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={`${label} ${groupName}`}
      onClick={onClick}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}

function GroupActions({ group, onAction }: GroupRowProps) {
  const act = (action: GroupAction) => () => onAction({ kind: 'group', action, group });

  return (
    <div className={styles.actions}>
      {groupStatusActions[group.status].map(({ action, label, icon }) => (
        <ActionButton
          key={action}
          label={label}
          icon={icon}
          groupName={group.name}
          className={styles[action]}
          onClick={act(action)}
        />
      ))}
      <ActionButton
        label="Excluir"
        icon="delete"
        groupName={group.name}
        className={styles.remove}
        onClick={act('delete')}
      />
    </div>
  );
}

function GroupRow({ group, onAction, stats }: GroupRowProps) {
  return (
    <tr className={cn(groupStatusLooks[group.status].dimmed && styles.suspendedRow)}>
      <td>
        <GroupIdentity group={group} />
      </td>
      <td>
        <GroupMembers group={group} />
      </td>
      <td>
        <GroupVolumeCell stats={stats} />
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
        <th scope="col">Volume custodiado</th>
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

export function GroupsTable({ groups, onAction, financeStats }: GroupsTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>Grupos da comunidade</caption>
        <GroupsTableHead />
        <tbody>
          {groups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              onAction={onAction}
              stats={financeStats?.[group.id]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
