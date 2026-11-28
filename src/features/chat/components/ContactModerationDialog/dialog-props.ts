import type { ConversationSummary } from '../../chat.types';
import type { ModerationNotice } from './useContactModeration';

export interface ContactModerationDialogProps {
  conversation: ConversationSummary;
  onClose: () => void;
  onDone: (notice: ModerationNotice) => void;
}
