import type { ApiError } from '@/lib/api-error';

export interface SettingsNotice {
  message: string;
  detail: string;
  tone: 'success' | 'danger';
}

const AUDIT_TRAIL = 'A alteração ficou no log de auditoria.';

function saved(message: string, detail: string): SettingsNotice {
  return { message, detail: `${detail} ${AUDIT_TRAIL}`, tone: 'success' };
}

export const settingsNotices = {
  banner: saved('Banner atualizado', 'A Home pública já mostra o banner novo.'),
  defaultCategories: saved(
    'Categorias padrão atualizadas',
    'As franquias padrão e os versos foram salvos.',
  ),
  templateSaved: saved(
    'Templates atualizados',
    'A tela de Notificação Global já oferece o template.',
  ),
  templateDeleted: saved('Templates atualizados', 'O template foi excluído.'),
  goals: saved('Metas atualizadas', 'O Dashboard e a Fila de Solicitações já usam as metas novas.'),
} satisfies Record<string, SettingsNotice>;

export function errorNotice(error: ApiError): SettingsNotice {
  return { message: 'Não foi possível salvar', detail: error.message, tone: 'danger' };
}

export function failureNoticeOf(error: ApiError): SettingsNotice | null {
  return error.details?.length ? null : errorNotice(error);
}

export function imageFailureNotice(message: string): SettingsNotice {
  return { message: 'Não foi possível enviar a imagem', detail: message, tone: 'danger' };
}
