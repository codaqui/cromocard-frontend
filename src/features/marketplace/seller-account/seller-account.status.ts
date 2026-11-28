import type { StripeAccountStatus } from './seller-account.types';

/** Conta pronta para receber (CCD108, R4): só então o vendedor pode anunciar (CCD084, R9). */
export const isStripeAccountReady = (status: StripeAccountStatus) => status === 'READY';

const STRIPE_DOMAIN = 'stripe.com';

const isStripeHost = (hostname: string) =>
  hostname === STRIPE_DOMAIN || hostname.endsWith(`.${STRIPE_DOMAIN}`);

/**
 * Confere o link de cadastro antes de sair do app: só aceita HTTPS na Stripe ou o próprio app (o
 * provider falso do backend devolve a página de volta). Qualquer outro destino vira o erro do CA9.
 */
export function trustedOnboardingUrl(url: string, appOrigin = window.location.origin): string {
  const target = new URL(url);
  const isStripe = target.protocol === 'https:' && isStripeHost(target.hostname);
  if (!isStripe && target.origin !== appOrigin) {
    throw new Error('O link de cadastro não é da Stripe.');
  }
  return url;
}
