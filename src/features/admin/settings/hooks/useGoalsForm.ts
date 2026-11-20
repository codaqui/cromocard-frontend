import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { notifyFailure, type Notify } from './useSettingsNotice';
import { useFormApiErrors } from './useFormApiErrors';
import { formatGoal } from '../settings.format';
import { settingsNotices } from '../settings.labels';
import { useUpdateGoals } from '../settings.queries';
import { type GoalsFormValues, goalsFormSchema } from '../settings.schemas';
import type { Goals } from '../settings.types';

const GOAL_FIELDS = ['monthlySignupGoal', 'votingGoal'] as const;

function valuesOf(goals: Goals | null): GoalsFormValues {
  return {
    monthlySignupGoal: formatGoal(goals?.monthlySignupGoal ?? null),
    votingGoal: formatGoal(goals?.votingGoal ?? null),
  };
}

export function useGoalsForm(goals: Goals | null, notify: Notify) {
  const save = useUpdateGoals();
  const form = useForm({ resolver: zodResolver(goalsFormSchema), defaultValues: valuesOf(goals) });
  useFormApiErrors(save.error, GOAL_FIELDS, form.setError);

  const onValid = (input: Goals) =>
    save.mutate(input, {
      onSuccess: () => {
        form.reset(valuesOf(input));
        notify(settingsNotices.goals);
      },
      onError: notifyFailure(notify),
    });
  const cancel = () => {
    form.reset(valuesOf(goals));
    save.reset();
  };

  return {
    form,
    submit: (event: FormEvent) => void form.handleSubmit(onValid)(event),
    cancel,
    isSaving: save.isPending,
  };
}
