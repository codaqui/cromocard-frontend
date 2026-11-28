import type { HelpQuestion, HelpTopic, HelpTopicId } from './help.types';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const matches = (question: HelpQuestion, term: string) =>
  normalize(`${question.question} ${question.answer}`).includes(term);

export function searchQuestions(topics: HelpTopic[], term: string): HelpQuestion[] {
  const normalized = normalize(term);
  return topics.flatMap((topic) => topic.questions).filter((q) => matches(q, normalized));
}

export function questionsOf(topics: HelpTopic[], topicId: HelpTopicId): HelpQuestion[] {
  return topics.find((topic) => topic.id === topicId)?.questions ?? [];
}
