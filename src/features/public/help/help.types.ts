export type HelpTopicId = 'first-steps' | 'payments' | 'shipping' | 'albums' | 'selling' | 'safety';

export interface HelpLink {
  label: string;
  to: string;
}

export interface HelpQuestion {
  id: string;
  question: string;
  answer: string;
  link?: HelpLink;
}

export interface HelpTopic {
  id: HelpTopicId;
  label: string;
  questions: HelpQuestion[];
}
