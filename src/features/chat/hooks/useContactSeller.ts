import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { paths } from '@/routes/paths';

import { suggestedMessage } from '../chat.labels';
import { refreshConversations } from '../chat.queries';
import type { ContactListing } from '../chat.types';
import { listingContactApi } from '../listing-contact.api';

export interface ConversationDraft {
  conversationId: string;
  text: string;
}

export function useContactSeller(listing: ContactListing) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => listingContactApi.contact(listing.id),
    onSuccess: async ({ conversationId }) => {
      await refreshConversations(queryClient);
      const draft: ConversationDraft = { conversationId, text: suggestedMessage(listing) };
      await navigate(`${paths.messages}?conversa=${conversationId}`, { state: { draft } });
    },
  });
}
