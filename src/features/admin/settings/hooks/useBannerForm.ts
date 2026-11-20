import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { notifyFailure, type Notify } from './useSettingsNotice';
import { useFormApiErrors } from './useFormApiErrors';
import { useUpdateBanner, useUploadSettingImage } from '../settings.queries';
import { settingsNotices } from '../settings.labels';
import {
  type BannerFormValues,
  bannerFormSchema,
  bannerImageSchema,
  imageErrorOf,
} from '../settings.schemas';
import type { HomeBanner } from '../settings.types';

const BANNER_FIELDS = ['title', 'subtitle', 'ctaText', 'ctaUrl', 'imageUrl'] as const;

export function useBannerForm(banner: HomeBanner, notify: Notify) {
  const save = useUpdateBanner();
  const form = useForm({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: banner satisfies BannerFormValues,
  });
  useFormApiErrors(save.error, BANNER_FIELDS, form.setError);

  const submit = (event: FormEvent) =>
    void form.handleSubmit((input) =>
      save.mutate(input, {
        onSuccess: () => {
          form.reset(input);
          notify(settingsNotices.banner);
        },
        onError: notifyFailure(notify),
      }),
    )(event);
  const cancel = () => {
    form.reset(banner);
    save.reset();
  };

  return { form, submit, cancel, isSaving: save.isPending };
}

type BannerForm = ReturnType<typeof useBannerForm>['form'];

export function useBannerImage(form: BannerForm) {
  const upload = useUploadSettingImage('banners');
  const fail = (message: string) => form.setError('imageUrl', { message });

  const choose = (file: File) => {
    const invalid = imageErrorOf(bannerImageSchema, file);
    if (invalid) return fail(invalid);
    upload.mutate(file, {
      onSuccess: ({ url }) => {
        form.clearErrors('imageUrl');
        form.setValue('imageUrl', url, { shouldDirty: true });
      },
      onError: (error) => fail(error.message),
    });
  };

  return { choose, isUploading: upload.isPending };
}
