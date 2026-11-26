import type { StripeAccount, StripeAccountStatus } from './seller-account.types';

export type NoticeTone = 'warning' | 'info';

interface NoticeText {
  tone: NoticeTone;
  title: string;
  help: string;
}

/** O aviso tem o botão que leva à Stripe ou o selo de espera, nunca os dois nem nenhum. */
export type NoticeContent = NoticeText &
  ({ kind: 'action'; action: string } | { kind: 'badge'; badge: string });

const CONNECT_HELP =
  'O cadastro é feito na própria Stripe e leva poucos minutos. Sem a conta pronta, não é possível publicar anúncios.';

const connect: NoticeContent = {
  kind: 'action',
  tone: 'warning',
  title: 'Conecte sua conta de recebimento para vender',
  help: CONNECT_HELP,
  action: 'Conectar conta Stripe',
};

const unfinished: NoticeContent = {
  kind: 'action',
  tone: 'warning',
  title: 'Termine seu cadastro na Stripe para vender',
  help: CONNECT_HELP,
  action: 'Continuar cadastro',
};

const moreInfo: NoticeContent = {
  kind: 'action',
  tone: 'warning',
  title: 'A Stripe precisa de mais informações',
  help: CONNECT_HELP,
  action: 'Completar cadastro',
};

const verifying: NoticeContent = {
  kind: 'badge',
  tone: 'info',
  title: 'Estamos verificando sua conta na Stripe',
  help: 'Você poderá publicar anúncios assim que a Stripe liberar a conta. Isso costuma levar poucos minutos.',
  badge: 'Verificando',
};

const pendingNotice = ({ pendingReason }: StripeAccount) =>
  pendingReason === 'MORE_INFO_REQUIRED' || pendingReason === 'REJECTED' ? moreInfo : unfinished;

const noticeByStatus: Record<
  Exclude<StripeAccountStatus, 'READY'>,
  (account: StripeAccount) => NoticeContent
> = {
  NOT_CONNECTED: () => connect,
  PENDING: pendingNotice,
  VERIFYING: () => verifying,
};

export function noticeFor(account: StripeAccount): NoticeContent | null {
  return account.status === 'READY' ? null : noticeByStatus[account.status](account);
}

export const NOT_READY_REASON = 'Conecte sua conta de recebimento para publicar anúncios';

export const ONBOARDING_ERROR =
  'Não foi possível abrir o cadastro na Stripe. Tente de novo em instantes.';
