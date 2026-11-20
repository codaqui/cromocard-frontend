import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { ApiError } from '@/lib/api-error';

import { useFormApiErrors } from './useFormApiErrors';
import {
  type TemplateFormValues,
  type TemplateInput,
  templateFormSchema,
} from '../settings.schemas';
import type { NotificationTemplate } from '../settings.types';

const TEMPLATE_FIELDS = ['name', 'title', 'content'] as const;

function valuesOf(template: NotificationTemplate | undefined): TemplateFormValues {
  return {
    name: template?.name ?? '',
    title: template?.title ?? '',
    content: template?.content ?? '',
  };
}

export function useTemplateForm(
  template: NotificationTemplate | undefined,
  onSubmit: (input: TemplateInput) => void,
  apiError: ApiError | null,
) {
  const form = useForm({
    resolver: zodResolver(templateFormSchema),
    defaultValues: valuesOf(template),
  });
  useFormApiErrors(apiError, TEMPLATE_FIELDS, form.setError);
  const [title, content] = useWatch({ control: form.control, name: ['title', 'content'] });

  return {
    register: form.register,
    errors: form.formState.errors,
    lengths: { title: title.length, content: content.length },
    submit: (event: FormEvent) => void form.handleSubmit(onSubmit)(event),
  };
}
