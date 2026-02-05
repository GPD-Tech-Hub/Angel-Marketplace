import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ApiResponse } from '@/types';
import { config } from '@/constants/config';

export interface StripeConfig {
  stripePublishableKey: string | null;
  stripeEnvironment: 'test' | 'live';
  stripeEnabled: boolean;
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;       // For Stripe
  authorizationUrl?: string;   // For Paystack/Flutterwave
  reference?: string;          // Payment reference
  amount: number;
  currency: string;
  provider: 'stripe' | 'paystack' | 'flutterwave';
}

export interface CreatePaymentIntentPayload {
  orderId: string;
  provider: 'stripe' | 'paystack' | 'flutterwave';
  amount: number;
  currency?: string;
  email?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentPayload {
  paymentIntentId: string;
  provider: 'stripe' | 'paystack' | 'flutterwave';
  reference?: string;
}

export const paymentService = {
  /** Fetches Stripe config from backend (single source of truth). Fallback to app config when API fails or Stripe disabled. */
  async getStripeConfig(): Promise<StripeConfig> {
    try {
      const response = await api.get<ApiResponse<StripeConfig>>(ENDPOINTS.PAYMENTS.CONFIG);
      const data = response.data.data;
      return {
        stripePublishableKey: data.stripePublishableKey || config.STRIPE_PUBLISHABLE_KEY || null,
        stripeEnvironment: data.stripeEnvironment,
        stripeEnabled: data.stripeEnabled,
      };
    } catch {
      return {
        stripePublishableKey: config.STRIPE_PUBLISHABLE_KEY || null,
        stripeEnvironment: 'test',
        stripeEnabled: !!config.STRIPE_PUBLISHABLE_KEY,
      };
    }
  },

  async createPaymentIntent(
    payload: CreatePaymentIntentPayload
  ): Promise<PaymentIntent> {
    const response = await api.post<ApiResponse<PaymentIntent>>(
      ENDPOINTS.PAYMENTS.CREATE_INTENT,
      payload
    );
    return response.data.data;
  },

  async confirmPayment(payload: ConfirmPaymentPayload): Promise<{ success: boolean }> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      ENDPOINTS.PAYMENTS.CONFIRM,
      payload
    );
    return response.data.data;
  },
};

export default paymentService;
