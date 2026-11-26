import { handleOf } from '../../chat.format';
import type { ConversationSummary } from '../../chat.types';
import type { ModerationNotice } from './useContactModeration';

export interface ContactModerationDialogProps {
  conversation: ConversationSummary;
  onClose: () => void;
  onDone: (notice: ModerationNotice) => void;
}

export const handleOrName = ({ contact }: ConversationSummary) =>
  handleOf(contact.username) || contact.name;
