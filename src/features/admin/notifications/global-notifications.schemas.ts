import { z } from '@/lib/zod';

import { toScheduledAt } from './global-notifications.format';
import {
  type DispatchNotificationInput,
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CHANNELS,
} from './global-notifications.types';

export const TITLE_MAX_LENGTH = 120;
export const CONTENT_MAX_LENGTH = 500;
const LINK_MAX_LENGTH = 255;
const MIN_SCHEDULE_LEAD_MS = 5 * 60 * 1000;
const LINK_PATTERN = /^(\/(?!\/)\S*|https?:\/\/\S+)$/;

export const SCHEDULE_TOO_SOON = 'Escolha um horário com pelo menos 5 minutos de antecedência.';

const tooLong = (max: number) => `Use até ${max} caracteres.`;
const twoDigits = (max: number) => z.string().refine((value) => inRange(value, max));

interface ScheduleParts {
  scheduleDay: string;
  scheduleHour: string;
  scheduleMinute: string;
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const inRange = (value: string, max: number) => /^\d{1,2}$/.test(value) && Number(value) <= max;

function scheduledAtOf({ scheduleDay, scheduleHour, scheduleMinute }: ScheduleParts) {
  if (!DAY_PATTERN.test(scheduleDay)) return undefined;
  if (!inRange(scheduleHour, 23) || !inRange(scheduleMinute, 59)) return null;
  return toScheduledAt(
    scheduleDay,
    `${scheduleHour.padStart(2, '0')}:${scheduleMinute.padStart(2, '0')}`,
  );
}

export const notificationFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: 'Informe o título.' })
      .max(TITLE_MAX_LENGTH, { error: tooLong(TITLE_MAX_LENGTH) }),
    content: z
      .string()
      .trim()
      .min(1, { error: 'Informe a mensagem.' })
      .max(CONTENT_MAX_LENGTH, { error: tooLong(CONTENT_MAX_LENGTH) }),
    link: z
      .string()
      .trim()
      .max(LINK_MAX_LENGTH, { error: tooLong(LINK_MAX_LENGTH) })
      .refine((value) => value === '' || LINK_PATTERN.test(value), {
        error: 'Informe um caminho que comece com / ou um link http(s).',
      }),
    audience: z.enum(NOTIFICATION_AUDIENCES),
    channels: z
      .array(z.enum(NOTIFICATION_CHANNELS))
      .min(1, { error: 'Escolha pelo menos um canal.' }),
    when: z.enum(['NOW', 'SCHEDULED']),
    scheduleDay: z.string(),
    scheduleHour: twoDigits(23),
    scheduleMinute: twoDigits(59),
  })
  .superRefine((values, context) => {
    if (values.when === 'NOW') return;
    const scheduledAt = scheduledAtOf(values);
    if (scheduledAt === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['scheduleDay'],
        message: 'Escolha o dia do envio.',
      });
      return;
    }
    if (scheduledAt === null) return;
    if (new Date(scheduledAt).getTime() - Date.now() >= MIN_SCHEDULE_LEAD_MS) return;
    context.addIssue({ code: 'custom', path: ['scheduleDay'], message: SCHEDULE_TOO_SOON });
  })
  .transform(
    ({
      title,
      content,
      link,
      audience,
      channels,
      when,
      ...schedule
    }): DispatchNotificationInput => ({
      title,
      content,
      audience,
      channels,
      ...(link && { link }),
      ...(when === 'SCHEDULED' && { scheduledAt: scheduledAtOf(schedule) ?? undefined }),
    }),
  );

export type NotificationFormValues = z.input<typeof notificationFormSchema>;
