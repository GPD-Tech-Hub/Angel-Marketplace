import { CURRENCIES, DEFAULT_CURRENCY } from '@/store/currencyStore';

/** Look up CurrencyInfo by code (falls back to GBP). */
function currencyInfo(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}

/**
 * Format a number as currency using the provided currency code.
 * Pass `currency` explicitly; fall back to GBP if omitted.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
  locale?: string
): string {
  const info = currencyInfo(currency);
  const resolvedLocale = locale ?? info.locale;

  // Espees has no ISO 4217 code — format manually
  if (currency === 'ESP') {
    return `E${amount.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currency codes
    return `${info.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Resolve the price for a product in the selected currency.
 * Falls back to the base GBP price if no per-currency price exists.
 */
export function resolvePrice(
  prices: Record<string, number> | undefined,
  basePrice: number,
  currencyCode: string
): number {
  if (!prices) return basePrice;
  return prices[currencyCode] ?? prices['GBP'] ?? basePrice;
}

/**
 * Format price with discount
 */
export function formatDiscount(originalPrice: number, salePrice: number): string {
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `${discount}% OFF`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
