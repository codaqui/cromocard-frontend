import { useId } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { Icon } from '@/components/Icon/Icon';
import { TextField } from '@/components/TextField/TextField';

import { useBannerForm, useBannerImage } from '../../hooks/useBannerForm';
import type { Notify } from '../../hooks/useSettingsNotice';
import type { HomeBanner } from '../../settings.types';
import { ModuleActions } from '../ModuleActions/ModuleActions';
import { SettingsModule } from '../SettingsModule/SettingsModule';
import { BannerImageField } from './BannerImageField';
import styles from './BannerModule.module.css';

type BannerForm = ReturnType<typeof useBannerForm>['form'];

function BannerVisibility({ form }: { form: BannerForm }) {
  return (
    <Controller
      control={form.control}
      name="enabled"
      render={({ field }) => (
        <button
          type="button"
          role="switch"
          aria-checked={field.value}
          className={styles.visibility}
          onClick={() => field.onChange(!field.value)}
        >
          Exibir Banner na Home:
          <span className={field.value ? styles.active : styles.inactive}>
            {field.value ? 'Ativo' : 'Inativo'}
          </span>
        </button>
      )}
    />
  );
}

function BannerPreview({ form }: { form: BannerForm }) {
  const [title, subtitle, ctaText, imageUrl] = useWatch({
    control: form.control,
    name: ['title', 'subtitle', 'ctaText', 'imageUrl'],
  });

  return (
    <figure className={styles.preview}>
      <figcaption className={styles.previewLabel}>Pré-visualização (1920×600 px)</figcaption>
      <div className={styles.previewCanvas}>
        {imageUrl && <img className={styles.previewImage} src={imageUrl} alt="" />}
        <div className={styles.previewContent}>
          <p className={styles.previewTitle}>{title}</p>
          <p className={styles.previewSubtitle}>{subtitle}</p>
          <span className={styles.previewButton}>
            {ctaText}
            <Icon name="arrowForward" size={16} />
          </span>
        </div>
      </div>
    </figure>
  );
}

function BannerFields({ form }: { form: BannerForm }) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <>
      <TextField label="Título" error={errors.title?.message} {...register('title')} />
      <TextField label="Texto do botão" error={errors.ctaText?.message} {...register('ctaText')} />
      <TextField label="Subtítulo" error={errors.subtitle?.message} {...register('subtitle')} />
      <TextField
        label="Link do botão"
        icon="link"
        inputMode="url"
        error={errors.ctaUrl?.message}
        {...register('ctaUrl')}
      />
    </>
  );
}

interface BannerFormBodyProps {
  formId: string;
  form: BannerForm;
  submit: ReturnType<typeof useBannerForm>['submit'];
}

function BannerFormBody({ formId, form, submit }: BannerFormBodyProps) {
  const image = useBannerImage(form);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <BannerPreview form={form} />
      <div className={styles.fields}>
        <BannerFields form={form} />
        <BannerImageField
          error={form.formState.errors.imageUrl?.message}
          isUploading={image.isUploading}
          onChoose={image.choose}
        />
      </div>
    </form>
  );
}

interface BannerModuleProps {
  banner: HomeBanner;
  notify: Notify;
}

export function BannerModule({ banner, notify }: BannerModuleProps) {
  const formId = useId();
  const { form, submit, cancel, isSaving } = useBannerForm(banner, notify);
  const actions = { formId, saveLabel: 'Salvar banner', isSaving, onCancel: cancel };

  return (
    <SettingsModule
      icon="viewCarousel"
      title="Módulo 1: Banner da Home"
      subtitle="Destaque exibido no topo da Home pública."
      actions={<BannerVisibility form={form} />}
    >
      <BannerFormBody formId={formId} form={form} submit={submit} />
      <ModuleActions {...actions} />
    </SettingsModule>
  );
}
