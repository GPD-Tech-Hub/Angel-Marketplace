import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { orderSummaryStyles as styles } from '@/styles/orderSummary';
import { formatCurrency } from '@/utils';
import { useCurrencyStore } from '@/store/currencyStore';

type Props = {
  subtotal: number;
  /** When omitted, shipping row and total row are hidden (cart view — matches PHP cart.php) */
  shippingFee?: number;
  /** Override total; only used when shippingFee is provided */
  total?: number;
  couponCode?: string;
};

export function OrderSummary({ subtotal, shippingFee, total, couponCode }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { currency } = useCurrencyStore();

  const showShipping = shippingFee !== undefined;
  const calculatedTotal = total ?? (showShipping ? subtotal + (shippingFee ?? 0) : subtotal);

  return (
    <View style={styles.container}>
      {/* Sub-total */}
      <View style={styles.row}>
        <Text style={[styles.label, { fontSize: Math.round(14 * scale) }]}>
          Sub-total
        </Text>
        <Text style={[styles.value, { fontSize: Math.round(14 * scale) }]}>
          {formatCurrency(subtotal, currency.code)}
        </Text>
      </View>

      {/* Shipping — only shown in checkout, not cart (mirrors PHP cart.php behaviour) */}
      {showShipping && (
        <View style={styles.row}>
          <Text style={[styles.label, { fontSize: Math.round(14 * scale) }]}>
            Shipping
          </Text>
          <Text style={[styles.value, { fontSize: Math.round(14 * scale) }]}>
            {shippingFee === 0 ? 'Free' : formatCurrency(shippingFee!, currency.code)}
          </Text>
        </View>
      )}

      {/* Coupon */}
      {couponCode ? (
        <View style={styles.row}>
          <Text style={[styles.label, { fontSize: Math.round(14 * scale) }]}>
            Coupon ({couponCode})
          </Text>
          <Text style={[styles.discountValue, { fontSize: Math.round(14 * scale) }]}>
            Applied
          </Text>
        </View>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total — labelled "Subtotal" in cart view, "Total" in checkout view */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { fontSize: Math.round(16 * scale) }]}>
          {showShipping ? 'Total' : 'Subtotal'}
        </Text>
        <Text style={[styles.totalValue, { fontSize: Math.round(20 * scale) }]}>
          {formatCurrency(calculatedTotal, currency.code)}
        </Text>
      </View>
    </View>
  );
}

export default OrderSummary;
