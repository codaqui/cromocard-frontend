import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/lib/api-error';

import type { ConversationSummary } from '../../chat.types';
import { moderationOptions, moderationTexts } from '../../moderation/contact-moderation.labels';
import { useBlockContact, useReportContact } from '../../moderation/contact-moderation.queries';
import {
  blocksContact,
  type ContactModerationRequest,
  type ContactModerationValues,
  contactModerationSchema,
} from '../../moderation/contact-moderation.schemas';

export interface ModerationNotice {
  title: string;
  detail: string;
}

const DEFAULT_VALUES: ContactModerationValues = {
  option: 'blockAndReport',
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
  const send = (request: ContactModerationRequest) =>
    request.option === 'block'
      ? block.mutateAsync(userId)
      : report.mutateAsync({
          userId,
          reason: request.reason,
          description: request.description || undefined,
          block: blocksContact(request.option),
          evidences: request.evidences,
        });
  return { send, pending: block.isPending || report.isPending };
}

export function useContactModeration(
  conversation: ConversationSummary,
  onDone: (notice: ModerationNotice) => void,
) {
  const form = useForm<ContactModerationValues, unknown, ContactModerationRequest>({
    resolver: zodResolver(contactModerationSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const [failure, setFailure] = useState<string>();
  const request = useModerationRequest(conversation.contact.id);

  const submit = form.handleSubmit(async (values: ContactModerationRequest) => {
    setFailure(undefined);
    try {
      await request.send(values);
      const { done, doneDetail } = moderationOptions[values.option];
      onDone({ title: done, detail: doneDetail });
    } catch (error) {
      setFailure(failureOf(error));
    }
  });

  return { form, failure, submit, pending: request.pending };
}

export type ContactModeration = ReturnType<typeof useContactModeration>;
