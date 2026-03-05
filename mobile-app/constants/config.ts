// Backend API base URL (no trailing slash). Use HTTPS for hosted backend.
const DEFAULT_API_URL = 'http://ygkgc0o00cg4w4408k840og0.102.219.189.97.sslip.io/api';

// Environment-based configuration
const ENV = {
  development: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || DEFAULT_API_URL,
    NEWSLETTER_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_NEWSLETTER_URL) || 'https://angelmarketplace.org/api/newsletter.php',
  },
  staging: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://staging-api.angelmarketplace.com/api',
    NEWSLETTER_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_NEWSLETTER_URL) || 'https://angelmarketplace.org/api/newsletter.php',
  },
  production: {
    API_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || DEFAULT_API_URL,
    NEWSLETTER_URL: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_NEWSLETTER_URL) || 'https://angelmarketplace.org/api/newsletter.php',
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
  IMAGE_PLACEHOLDER: 'https://placehold.co/300x300/F3F4F6/9CA3AF?text=No+Image',
  CURRENCY: 'GBP',
  CURRENCY_SYMBOL: '£',
};

export default config;
