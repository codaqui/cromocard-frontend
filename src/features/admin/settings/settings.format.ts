import { ApiError } from '@/lib/api-error';

import { settingValueSchemas } from './settings.schemas';
import {
  type Goals,
  type GlobalSettings,
  type NotificationTemplate,
  SETTING_KEYS,
  type SettingView,
} from './settings.types';

type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

function valueOf(settings: SettingView[], key: SettingKey): unknown {
  return settings.find((setting) => setting.key === key)?.value;
}

function goalsOf(settings: SettingView[]): Goals | null {
  const monthly = settingValueSchemas.goal.safeParse(
    valueOf(settings, SETTING_KEYS.monthlySignupGoal),
  );
  const voting = settingValueSchemas.goal.safeParse(valueOf(settings, SETTING_KEYS.votingGoal));
  if (!monthly.success || !voting.success || voting.data === null) return null;
  return { monthlySignupGoal: monthly.data, votingGoal: voting.data };
}

export function toGlobalSettings(settings: SettingView[]): GlobalSettings {
  const banner = settingValueSchemas.banner.safeParse(valueOf(settings, SETTING_KEYS.homeBanner));
  const templates = settingValueSchemas.templates.safeParse(
    valueOf(settings, SETTING_KEYS.notificationTemplates),
  );
  return {
    banner: banner.success ? banner.data : null,
    templates: templates.success ? templates.data : [],
    goals: goalsOf(settings),
  };
}

export function formatGoal(goal: number | null): string {
  return goal === null ? '' : goal.toLocaleString('pt-BR');
}

export function templateSummary({ title, content }: NotificationTemplate): string {
  return `Título: ${title} • Texto: ${content}`;
}

const FIELD_PREFIX = /^(value|categories)\.(\d+\.)?/;

export function withFormFields(error: ApiError | null): ApiError | null {
  if (!error?.details) return error;
  const details = error.details.map((detail) => ({
    ...detail,
    field: detail.field.replace(FIELD_PREFIX, ''),
  }));
  return new ApiError({ status: error.status, code: error.code, message: error.message, details });
}
