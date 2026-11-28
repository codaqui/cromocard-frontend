import { describe, expect, it } from 'vitest';

import { noticeFor } from './seller-account.labels';
import type { StripeAccount } from './seller-account.types';

const account = (changes: Partial<StripeAccount>): StripeAccount => ({
  status: 'NOT_CONNECTED',
  pendingReason: null,
  ...changes,
});

describe('noticeFor', () => {
  it('CA1: sem conta, convida a conectar a conta Stripe', () => {
    expect(noticeFor(account({}))).toMatchObject({
      tone: 'warning',
      title: 'Conecte sua conta de recebimento para vender',
      action: 'Conectar conta Stripe',
    });
  });

  it.each([null, 'NOT_SUBMITTED'] as const)(
    'CA6: cadastro não terminado (%s) retoma o cadastro',
    (pendingReason) => {
      expect(noticeFor(account({ status: 'PENDING', pendingReason }))).toMatchObject({
        title: 'Termine seu cadastro na Stripe para vender',
        action: 'Continuar cadastro',
      });
    },
  );

  it.each(['MORE_INFO_REQUIRED', 'REJECTED'] as const)(
    'CA7: com %s, pede para completar o cadastro',
    (pendingReason) => {
      expect(noticeFor(account({ status: 'PENDING', pendingReason }))).toMatchObject({
        title: 'A Stripe precisa de mais informações',
        action: 'Completar cadastro',
      });
    },
  );

  it('CA3: em verificação, mostra o selo sem botão', () => {
    expect(noticeFor(account({ status: 'VERIFYING' }))).toEqual({
      kind: 'badge',
      tone: 'info',
      title: 'Estamos verificando sua conta na Stripe',
      help: 'Você poderá publicar anúncios assim que a Stripe liberar a conta. Isso costuma levar poucos minutos.',
      badge: 'Verificando',
    });
  });

  it('CA4: conta pronta não mostra aviso', () => {
    expect(noticeFor(account({ status: 'READY' }))).toBeNull();
  });
});
