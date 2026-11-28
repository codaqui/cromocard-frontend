import { useState } from 'react';

import { FaqList } from '../../components/FaqList/FaqList';
import { HelpSearchField } from '../../components/HelpSearchField/HelpSearchField';
import { HelpTopics } from '../../components/HelpTopics/HelpTopics';
import { SupportCard } from '../../components/SupportCard/SupportCard';
import { helpTopics } from '../../help.content';
import { questionsOf, searchQuestions } from '../../help.search';
import type { HelpTopicId } from '../../help.types';
import styles from './HelpCenterPage.module.css';

function HelpHeader() {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>Central de ajuda</p>
      <h1 className={styles.title}>Como podemos ajudar?</h1>
      <p className={styles.description}>Busque uma dúvida ou escolha um tópico.</p>
    </header>
  );
}

function useHelpFilter() {
  const [topicId, setTopicId] = useState<HelpTopicId>('first-steps');
  const [term, setTerm] = useState('');
  const isSearching = term.trim() !== '';
  const questions = isSearching
    ? searchQuestions(helpTopics, term)
    : questionsOf(helpTopics, topicId);

  const selectTopic = (id: HelpTopicId) => {
    setTerm('');
    setTopicId(id);
  };

  return { activeTopic: isSearching ? null : topicId, term, setTerm, selectTopic, questions };
}

export function HelpCenterPage() {
  const { activeTopic, term, setTerm, selectTopic, questions } = useHelpFilter();

  return (
    <div className={styles.page}>
      <HelpHeader />
      <HelpSearchField value={term} onChange={setTerm} />
      <HelpTopics topics={helpTopics} activeId={activeTopic} onSelect={selectTopic} />
      <div className={styles.content}>
        <FaqList key={activeTopic ?? term} questions={questions} term={term} />
        <SupportCard />
      </div>
    </div>
  );
}
