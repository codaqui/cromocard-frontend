import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import type { ConversationDraft } from '../../hooks/useContactSeller';

const draftOf = (state: unknown): ConversationDraft | null =>
  (state as { draft?: ConversationDraft } | null)?.draft ?? null;

function useForgetDraftOnHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const pending = draftOf(location.state) !== null;
  useEffect(() => {
    if (pending) void navigate({ search: location.search }, { replace: true, state: null });
  }, [pending, location.search, navigate]);
}

export function useConversationDraft() {
  const location = useLocation();
  const [draft, setDraft] = useState(() => draftOf(location.state));
  useForgetDraftOnHistory();
  return {
    draftFor: (conversationId: string | null) =>
      draft?.conversationId === conversationId ? draft.text : undefined,
    forget: () => setDraft(null),
  };
}
