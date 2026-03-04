import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { orderSummaryStyles as styles } from '@/styles/orderSummary';

type Props = {
  subtotal: number;
  shippingFee?: number;
  total?: number;
};

export function OrderSummary({ subtotal, shippingFee = 5, total }: Props) {
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
