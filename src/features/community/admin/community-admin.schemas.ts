import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

export const moderationReasonSchema = z.object({ reason: reasonSchema });

export type ModerationReasonInput = z.infer<typeof moderationReasonSchema>;

export interface ModerationAction extends ModerationReasonInput {
  id: string;
}
