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
 * Resolve the price and the currency it was actually found in.
 * - If the product has a price in `currencyCode`, return that.
 * - Otherwise return the first available currency price (native currency).
 * Never pretends a GBP price is another currency.
 */
export function resolvePrice(
  prices: Record<string, number> | undefined,
  basePrice: number,
  currencyCode: string
): { price: number; resolvedCurrency: string } {
  if (!prices || Object.keys(prices).length === 0) {
    return { price: basePrice, resolvedCurrency: 'GBP' };
  }
  // Exact match
  if (prices[currencyCode] !== undefined) {
    return { price: prices[currencyCode], resolvedCurrency: currencyCode };
  }
  // Fall back to the first available currency (native price)
  const firstCode = Object.keys(prices)[0];
  return { price: prices[firstCode], resolvedCurrency: firstCode };
}

/**
 * Sort products so those with a native price in `currencyCode` come first.
 * Within each group the original order is preserved (stable sort).
 * Products without a native price are shown after, in their available currency.
 */
export function sortByCurrency<T extends { prices?: Record<string, number> }>(
  items: T[],
  currencyCode: string
): T[] {
  if (currencyCode === 'GBP') return items; // GBP is the base — all products have it
  return [...items].sort((a, b) => {
    const aHas = !!(a.prices?.[currencyCode]);
    const bHas = !!(b.prices?.[currencyCode]);
    if (aHas === bHas) return 0;
    return aHas ? -1 : 1;
  });
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
