import { describe, expect, it } from 'vitest';

import { isStripeAccountReady, trustedOnboardingUrl } from './seller-account.status';

const APP = 'http://localhost:5173';

describe('isStripeAccountReady', () => {
  it.each([
    ['READY', true],
    ['VERIFYING', false],
    ['PENDING', false],
    ['NOT_CONNECTED', false],
  ] as const)('%s está pronta = %s', (status, ready) => {
    expect(isStripeAccountReady(status)).toBe(ready);
  });
});

describe('trustedOnboardingUrl', () => {
  it.each([
    'https://connect.stripe.com/setup/e/acct_1',
    'https://stripe.com/connect',
    `${APP}/vendedor/stripe/retorno`,
  ])('aceita %s', (url) => {
    expect(trustedOnboardingUrl(url, APP)).toBe(url);
  });

  it.each([
    'http://connect.stripe.com/setup/e/acct_1',
    'https://stripe.com.golpe.io/setup',
    'https://golpestripe.com/setup',
    'javascript:alert(1)',
    'http://localhost:4000/vendedor/stripe/retorno',
  ])('recusa %s', (url) => {
    expect(() => trustedOnboardingUrl(url, APP)).toThrow('O link de cadastro não é da Stripe.');
  });

  it('recusa o que não é URL', () => {
    expect(() => trustedOnboardingUrl('não é url', APP)).toThrow();
  });
});
