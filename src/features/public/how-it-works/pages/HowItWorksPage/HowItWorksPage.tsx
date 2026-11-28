import { useState } from 'react';

import { PageIntro } from '@/components/PageIntro/PageIntro';
import { AudienceSwitch } from '../../components/AudienceSwitch/AudienceSwitch';
import { GuaranteeList } from '../../components/GuaranteeList/GuaranteeList';
import { HowItWorksSteps } from '../../components/HowItWorksSteps/HowItWorksSteps';
import { PricingCard } from '../../components/PricingCard/PricingCard';
import { type HowItWorksGuide, howItWorksGuides } from '../../how-it-works.content';
import styles from './HowItWorksPage.module.css';

export function HowItWorksPage() {
  const [guide, setGuide] = useState<HowItWorksGuide>(howItWorksGuides[0]);

  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow="Como funciona"
        title="Como a CromoCard funciona"
        description={guide.intro}
      />
      <AudienceSwitch guides={howItWorksGuides} activeId={guide.id} onChange={setGuide} />
      <div role="tabpanel" aria-label={guide.tab} className={styles.page}>
        <HowItWorksSteps steps={guide.steps} />
        <GuaranteeList title={guide.reasonsTitle} items={guide.reasons} />
        <PricingCard />
      </div>
    </div>
  );
}
