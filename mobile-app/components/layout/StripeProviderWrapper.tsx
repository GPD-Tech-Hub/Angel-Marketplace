import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useStripeConfig } from '@/queries';
import { config } from '@/constants/config';

/**
 * Wraps children with StripeProvider using publishable key from backend (GET /payments/config).
 * Fallback to app config when API fails or Stripe is disabled so the app still runs.
 */
export function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { data } = useStripeConfig();
  const publishableKey =
    data?.stripePublishableKey || config.STRIPE_PUBLISHABLE_KEY || '';

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
}
