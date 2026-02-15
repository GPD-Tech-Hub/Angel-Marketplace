// Backend API base URL (no trailing slash). Override with EXPO_PUBLIC_API_URL in .env if needed.
const DEFAULT_API_URL = 'http://ygkgc0o00cg4w4408k840og0.102.219.189.97.sslip.io/api';

// Environment-based configuration
const ENV = {
  development: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || DEFAULT_API_URL,
  },
  staging: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://staging-api.angelmarketplace.com/api',
  },
  production: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || DEFAULT_API_URL,
  },
};

const getEnvVars = () => {
  // Use __DEV__ from React Native
  if (__DEV__) {
    return ENV.development;
  }
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
