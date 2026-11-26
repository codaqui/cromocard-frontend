import {
  EVIDENCE_TYPES,
  MAX_EVIDENCE_SIZE_IN_BYTES,
  MAX_EVIDENCES,
  moderationTexts,
} from './contact-moderation.labels';
import type { ContactReportReason, ModerationOption } from './contact-moderation.types';

export interface ModerationForm {
  option: ModerationOption;
  reason: ContactReportReason | null;
  description: string;
  evidences: File[];
}

export type ModerationErrors = Partial<Record<'reason' | 'evidences', string>>;

export const reportsContact = (option: ModerationOption) => option !== 'block';

export const blocksContact = (option: ModerationOption) => option !== 'report';

const isAcceptedEvidence = (file: File) =>
  EVIDENCE_TYPES.includes(file.type) && file.size <= MAX_EVIDENCE_SIZE_IN_BYTES;

export const acceptsEvidences = (files: File[]) =>
  files.length <= MAX_EVIDENCES && files.every(isAcceptedEvidence);

export function validateModeration({
  option,
  reason,
  evidences,
}: ModerationForm): ModerationErrors {
  if (!reportsContact(option)) return {};
  return {
    ...(!reason && { reason: moderationTexts.missingReason }),
    ...(evidences.length === 0 && { evidences: moderationTexts.missingEvidence }),
  };
}
