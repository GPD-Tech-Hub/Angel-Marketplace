import Stripe from 'stripe';

/**
 * Stripe config aligned with PHP integration (Stripe/stripe-config.php).
 * Supports STRIPE_ENVIRONMENT (test | live) with separate keys, or single STRIPE_SECRET_KEY.
 */
function getStripeSecretKey(): string | undefined {
  const env = process.env.STRIPE_ENVIRONMENT || 'test';
  if (env === 'live') {
    return process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  }
  return process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
}

/** Publishable key for client (mobile/web). Same pattern as PHP getPublishableKey(). */
export function getStripePublishableKey(): string {
  const env = process.env.STRIPE_ENVIRONMENT || 'test';
  if (env === 'live') {
    return process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
  }
  return process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export const isLive = (): boolean => (process.env.STRIPE_ENVIRONMENT || 'test') === 'live';

const secretKey = getStripeSecretKey();

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

export const isStripeEnabled = (): boolean => !!stripe;
