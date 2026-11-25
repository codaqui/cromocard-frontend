import type { StripeAccount } from './seller-account.types';

export type NoticeTone = 'warning' | 'info';

export interface NoticeContent {
  tone: NoticeTone;
  title: string;
  help: string;
  action?: string;
  badge?: string;
}

const CONNECT_HELP =
  'O cadastro é feito na própria Stripe e leva poucos minutos. Sem a conta pronta, não é possível publicar anúncios.';

const connect: NoticeContent = {
  tone: 'warning',
  title: 'Conecte sua conta de recebimento para vender',
  help: CONNECT_HELP,
  action: 'Conectar conta Stripe',
};

const unfinished: NoticeContent = {
  tone: 'warning',
  title: 'Termine seu cadastro na Stripe para vender',
  help: CONNECT_HELP,
  action: 'Continuar cadastro',
};

const moreInfo: NoticeContent = {
  tone: 'warning',
  title: 'A Stripe precisa de mais informações',
  help: CONNECT_HELP,
  action: 'Completar cadastro',
};

const verifying: NoticeContent = {
  tone: 'info',
  title: 'Estamos verificando sua conta na Stripe',
  help: 'Você poderá publicar anúncios assim que a Stripe liberar a conta. Isso costuma levar poucos minutos.',
  badge: 'Verificando',
};

const pendingNotice = ({ pendingReason }: StripeAccount) =>
  pendingReason === 'MORE_INFO_REQUIRED' || pendingReason === 'REJECTED' ? moreInfo : unfinished;

export function noticeFor(account: StripeAccount): NoticeContent | null {
  if (account.status === 'READY') return null;
  if (account.status === 'VERIFYING') return verifying;
  return account.status === 'PENDING' ? pendingNotice(account) : connect;
}

export const NOT_READY_REASON = 'Conecte sua conta de recebimento para publicar anúncios';

export const ONBOARDING_ERROR =
  'Não foi possível abrir o cadastro na Stripe. Tente de novo em instantes.';
