// Environment-based configuration
const ENV = {
  development: {
    API_URL: 'http://localhost:4000/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_key',
    PAYSTACK_PUBLIC_KEY: 'pk_test_your_paystack_key',
    FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK_TEST-your_flutterwave_key',
  },
  staging: {
    API_URL: 'https://staging-api.angelmarketplace.com/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_key',
    PAYSTACK_PUBLIC_KEY: 'pk_test_your_paystack_key',
    FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK_TEST-your_flutterwave_key',
  },
  production: {
    API_URL: 'https://api.angelmarketplace.com/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_live_your_stripe_key',
    PAYSTACK_PUBLIC_KEY: 'pk_live_your_paystack_key',
    FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK-your_flutterwave_key',
  },
};

const getEnvVars = () => {
  // Use __DEV__ from React Native
  if (__DEV__) {
    return ENV.development;
  }
  // You can add more sophisticated environment detection here
  return ENV.production;
};

export const config = {
  ...getEnvVars(),
  APP_NAME: 'Angel Marketplace',
  APP_VERSION: '1.0.0',
  PAGINATION_LIMIT: 20,
  IMAGE_PLACEHOLDER: 'https://via.placeholder.com/300x300?text=No+Image',
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
};

export default config;
