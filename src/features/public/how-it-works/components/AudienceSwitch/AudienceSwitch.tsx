import { cn } from '@/utils/cn';

import type { HowItWorksAudience, HowItWorksGuide } from '../../how-it-works.content';
import styles from './AudienceSwitch.module.css';

interface AudienceSwitchProps {
  guides: HowItWorksGuide[];
  activeId: HowItWorksAudience;
  onChange: (guide: HowItWorksGuide) => void;
}

export function AudienceSwitch({ guides, activeId, onChange }: AudienceSwitchProps) {
  return (
    <div role="tablist" aria-label="Como funciona para" className={styles.switch}>
      {guides.map((guide) => (
        <button
          key={guide.id}
          type="button"
          role="tab"
          aria-selected={guide.id === activeId}
          className={cn(styles.option, guide.id === activeId && styles.active)}
          onClick={() => onChange(guide)}
        >
          {guide.tab}
        </button>
      ))}
    </div>
  );
}
