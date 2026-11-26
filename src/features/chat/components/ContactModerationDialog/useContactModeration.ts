import { useState } from 'react';

import { ApiError } from '@/lib/api-error';

import type { ConversationSummary } from '../../chat.types';
import {
  blocksContact,
  type ModerationErrors,
  type ModerationForm,
  validateModeration,
} from '../../moderation/contact-moderation.form';
import { moderationOptions, moderationTexts } from '../../moderation/contact-moderation.labels';
import { useBlockContact, useReportContact } from '../../moderation/contact-moderation.queries';

export interface ModerationNotice {
  title: string;
  detail: string;
}

const EMPTY_FORM: ModerationForm = {
  option: 'blockAndReport',
  reason: null,
  description: '',
  evidences: [],
};

const failureOf = (error: unknown) =>
  error instanceof ApiError && error.code === 'REPORT_ALREADY_PENDING'
    ? moderationTexts.alreadyReported
    : moderationTexts.failure;

function useModerationRequest(userId: string) {
  const block = useBlockContact();
  const report = useReportContact();
  const send = ({ option, reason, description, evidences }: ModerationForm) =>
    option === 'block' || !reason
      ? block.mutateAsync(userId)
      : report.mutateAsync({
          userId,
          reason,
          description: description.trim() || undefined,
          block: blocksContact(option),
          evidences,
        });
  return { send, pending: block.isPending || report.isPending };
}

export function useContactModeration(
  conversation: ConversationSummary,
  onDone: (notice: ModerationNotice) => void,
) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<ModerationErrors>({});
  const [failure, setFailure] = useState<string>();
  const request = useModerationRequest(conversation.contact.id);

  const change = (changes: Partial<ModerationForm>) =>
    setForm((current) => ({ ...current, ...changes }));

  const submit = async () => {
    const found = validateModeration(form);
    setErrors(found);
    setFailure(undefined);
    if (Object.keys(found).length > 0) return;
    try {
      await request.send(form);
      const { done, doneDetail } = moderationOptions[form.option];
      onDone({ title: done, detail: doneDetail });
    } catch (error) {
      setFailure(failureOf(error));
    }
  };

  return { form, errors, failure, change, setErrors, submit, pending: request.pending };
}

export type ContactModeration = ReturnType<typeof useContactModeration>;
