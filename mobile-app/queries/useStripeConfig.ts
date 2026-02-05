import { useQuery } from '@tanstack/react-query';
import { paymentService, StripeConfig } from '@/services/payment.service';

const STRIPE_CONFIG_KEY = ['payments', 'stripe-config'] as const;

export function useStripeConfig() {
  return useQuery({
    queryKey: STRIPE_CONFIG_KEY,
    queryFn: (): Promise<StripeConfig> => paymentService.getStripeConfig(),
    staleTime: 1000 * 60 * 10, // 10 min — backend env rarely changes
  });
}
