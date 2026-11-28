import { z } from '@/lib/zod';

import {
  CONTACT_REPORT_REASONS,
  DESCRIPTION_MAX_LENGTH,
  EVIDENCE_TYPES,
  MAX_EVIDENCE_SIZE_IN_BYTES,
  MAX_EVIDENCES,
  MODERATION_OPTIONS,
  moderationTexts,
} from './contact-moderation.labels';
import type { ModerationOption } from './contact-moderation.types';

export const reportsContact = (option: ModerationOption) => option !== 'block';

export const blocksContact = (option: ModerationOption) => option !== 'report';

const evidenceSchema = z
  .instanceof(File)
  .refine((file) => EVIDENCE_TYPES.includes(file.type) && file.size <= MAX_EVIDENCE_SIZE_IN_BYTES, {
    error: moderationTexts.invalidEvidence,
  });

export const evidencesSchema = z
  .array(evidenceSchema)
  .max(MAX_EVIDENCES, { error: moderationTexts.invalidEvidence });

type ContactReportReason = (typeof CONTACT_REPORT_REASONS)[number];

export type ContactModerationRequest =
  | { option: 'block' }
  | {
      option: Exclude<ModerationOption, 'block'>;
      reason: ContactReportReason;
      description: string;
      evidences: File[];
    };

const moderationFormSchema = z.object({
  option: z.enum(MODERATION_OPTIONS),
  reason: z.enum(CONTACT_REPORT_REASONS).optional(),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
  evidences: evidencesSchema,
});

type ModerationFormOutput = z.output<typeof moderationFormSchema>;

const missingReportFields = ({ reason, evidences }: ModerationFormOutput) => [
  ...(reason ? [] : [{ path: 'reason', message: moderationTexts.missingReason }]),
  ...(evidences.length > 0
    ? []
    : [{ path: 'evidences', message: moderationTexts.missingEvidence }]),
];

export const contactModerationSchema = moderationFormSchema.transform(
  (values, ctx): ContactModerationRequest => {
    const { option, reason, description, evidences } = values;
    if (option === 'block') return { option };
    const missing = missingReportFields(values);
    missing.forEach(({ path, message }) => ctx.addIssue({ code: 'custom', path: [path], message }));
    if (!reason || missing.length > 0) return z.NEVER;
    return { option, reason, description, evidences };
  },
);

export type ContactModerationValues = z.input<typeof contactModerationSchema>;
