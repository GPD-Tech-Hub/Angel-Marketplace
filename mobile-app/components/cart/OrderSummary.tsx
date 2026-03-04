import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { orderSummaryStyles as styles } from '@/styles/orderSummary';

type Props = {
  subtotal: number;
  shippingFee?: number;
  total?: number;
  /** Coupon code that has been applied — shows a green "Applied" line */
  couponCode?: string;
};

export function OrderSummary({ subtotal, shippingFee = 5, total, couponCode }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const calculatedTotal = total ?? subtotal + shippingFee;

  const formatPrice = (price: number) =>
    `£${price.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <View style={styles.container}>
      {/* Sub-total */}
      <View style={styles.row}>
        <Text style={[styles.label, { fontSize: Math.round(14 * scale) }]}>
          Sub-total
        </Text>
        <Text style={[styles.value, { fontSize: Math.round(14 * scale) }]}>
          {formatPrice(subtotal)}
        </Text>
      </View>

      {/* Shipping fee */}
      <View style={styles.row}>
        <Text style={[styles.label, { fontSize: Math.round(14 * scale) }]}>
          Shipping fee
        </Text>
        <Text style={[styles.value, { fontSize: Math.round(14 * scale) }]}>
          {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
        </Text>
      </View>

      {/* Coupon discount line */}
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

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { fontSize: Math.round(16 * scale) }]}>
          Total
        </Text>
        <Text style={[styles.totalValue, { fontSize: Math.round(20 * scale) }]}>
          {formatPrice(calculatedTotal)}
        </Text>
      </View>
    </View>
  );
}

export default OrderSummary;
