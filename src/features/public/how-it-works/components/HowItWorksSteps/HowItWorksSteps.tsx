import type { HowItWorksItem } from '../../how-it-works.content';
import styles from './HowItWorksSteps.module.css';

export function HowItWorksSteps({ steps }: { steps: HowItWorksItem[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {index + 1}
          </span>
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.text}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
