import { CONTENT_MAX_LENGTH, TITLE_MAX_LENGTH } from '../../global-notifications.schemas';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import { TextInputField } from '../TextInputField/TextInputField';

function LinkField({ form: { register, errors } }: { form: NotificationFormState }) {
  return (
    <TextInputField
      label="Link de destino (opcional)"
      icon="link"
      placeholder="/albuns/copa-do-mundo-2026"
      error={errors.link?.message}
      {...register('link')}
    />
  );
}

/** Título, corpo e link de destino (CCD060 R3, R4, R15). */
export function MessageFields({ form }: { form: NotificationFormState }) {
  const { register, values, errors } = form;
  return (
    <>
      <TextInputField
        label="Título da Notificação"
        maxLength={TITLE_MAX_LENGTH}
        length={values.title.length}
        error={errors.title?.message}
        {...register('title')}
      />
      <TextInputField
        label="Corpo da Mensagem"
        multiline
        maxLength={CONTENT_MAX_LENGTH}
        length={values.content.length}
        error={errors.content?.message}
        {...register('content')}
      />
      <LinkField form={form} />
    </>
  );
}
