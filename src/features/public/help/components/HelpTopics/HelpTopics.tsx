import { cn } from '@/utils/cn';

import type { HelpTopic, HelpTopicId } from '../../help.types';
import styles from './HelpTopics.module.css';

interface HelpTopicsProps {
  topics: HelpTopic[];
  activeId: HelpTopicId | null;
  onSelect: (id: HelpTopicId) => void;
}

export function HelpTopics({ topics, activeId, onSelect }: HelpTopicsProps) {
  return (
    <ul className={styles.topics} aria-label="Tópicos">
      {topics.map((topic) => (
        <li key={topic.id}>
          <button
            type="button"
            aria-pressed={topic.id === activeId}
            className={cn(styles.topic, topic.id === activeId && styles.active)}
            onClick={() => onSelect(topic.id)}
          >
            {topic.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
