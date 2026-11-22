import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import styles from './CategoryOrderControls.module.css';

interface IconControlProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}

function IconControl({ icon, label, onClick, disabled, pressed }: IconControlProps) {
  const active = pressed ? styles.pinned : styles.control;

  return (
    <button
      type="button"
      className={active}
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={disabled}
      onClick={() => !disabled && onClick()}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

export interface CategoryOrderControlsProps {
  name: string;
  isPinned: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onTogglePin: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function CategoryOrderControls(props: CategoryOrderControlsProps) {
  const { name } = props;

  return (
    <div className={styles.order}>
      <IconControl
        icon="pushPin"
        label={`Fixar ${name} no topo`}
        pressed={props.isPinned}
        onClick={props.onTogglePin}
      />
      <IconControl
        icon="expandLess"
        label={`Mover ${name} para cima`}
        disabled={!props.canMoveUp}
        onClick={props.onMoveUp}
      />
      <IconControl
        icon="expandMore"
        label={`Mover ${name} para baixo`}
        disabled={!props.canMoveDown}
        onClick={props.onMoveDown}
      />
    </div>
  );
}
