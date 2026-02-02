import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = secretKey
  ? new Stripe(secretKey)
  : null;

export const isStripeEnabled = (): boolean => !!stripe;
