import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useOrder, useLeaveReview } from '@/queries';
import { OrderTimeline } from '@/components/orders';
import { LeaveReviewModal } from '@/components/orders/LeaveReviewModal';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency, formatOrderDate } from '@/utils';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';

const statusConfig = {
  PENDING:    { label: 'Pending',    variant: 'warning'  as const },
  CONFIRMED:  { label: 'Confirmed',  variant: 'primary'  as const },
  PROCESSING: { label: 'Processing', variant: 'primary'  as const },
  SHIPPED:    { label: 'Shipped',    variant: 'primary'  as const },
  DELIVERED:  { label: 'Delivered',  variant: 'success'  as const },
  CANCELLED:  { label: 'Cancelled',  variant: 'error'    as const },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const leaveReviewMutation = useLeaveReview();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const copyTracking = async (trackingNumber: string) => {
    await Share.share({ message: trackingNumber, title: 'Tracking Number' });
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!id) return;
    try {
      await leaveReviewMutation.mutateAsync({ orderId: id, rating, comment });
      refetch();
    } catch {
      // modal stays open on error
    }
  };

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[s.center, { paddingHorizontal: 24 }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={s.errorText}>Failed to load order details</Text>
        <Button title="Try Again" onPress={() => refetch()} />
      </View>
    );
  }

  const { label, variant } = statusConfig[order.status] ?? { label: order.status, variant: 'primary' as const };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Order #${order.orderNumber}`,
          headerBackTitle: 'Back',
          headerTintColor: colors.brand,
        }}
      />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Order Header */}
        <Card style={s.card}>
          <View style={s.row}>
            <View>
              <Text style={s.dateText}>{formatOrderDate(order.createdAt)}</Text>
              <Text style={s.orderNumber}>#{order.orderNumber}</Text>
            </View>
            <Badge label={label} variant={variant} />
          </View>
        </Card>

        {/* Order Timeline */}
        <View style={s.card}>
          <OrderTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </View>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <Card style={s.card}>
            <View style={s.row}>
              <Ionicons name="airplane-outline" size={20} color={colors.brand} />
              <Text style={s.sectionTitle}>Tracking</Text>
            </View>
            <TouchableOpacity style={s.trackingRow} onPress={() => copyTracking(order.trackingNumber!)}>
              <Text style={s.trackingNumber}>{order.trackingNumber}</Text>
              <Ionicons name="copy-outline" size={16} color={colors.brand} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Order Items */}
        <Card style={s.card}>
          <Text style={s.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[s.itemRow, idx < order.items.length - 1 && s.itemRowBorder]}
              onPress={() => router.push(`/product/${item.product.slug}` as any)}
            >
              <Image
                source={{ uri: item.product.images[0] || config.IMAGE_PLACEHOLDER }}
                style={s.itemImage}
                contentFit="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.itemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={s.itemMeta}>{formatCurrency(item.price)} × {item.quantity}</Text>
              </View>
              <Text style={s.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Shipping Address */}
        <Card style={s.card}>
          <View style={s.row}>
            <Ionicons name="location-outline" size={20} color={colors.brand} />
            <Text style={s.sectionTitle}>Shipping Address</Text>
          </View>
          <Text style={s.addrName}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</Text>
          <Text style={s.addrLine}>
            {order.shippingAddress.address}
            {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
          </Text>
          <Text style={s.addrLine}>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
          </Text>
          <Text style={s.addrLine}>{order.shippingAddress.country}</Text>
        </Card>

        {/* Order Summary */}
        <Card style={[s.card, { marginBottom: 12 }]}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Shipping</Text>
            <Text style={s.summaryValue}>{order.shipping > 0 ? formatCurrency(order.shipping) : 'Free'}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </Card>

        {/* Leave a Review — only for DELIVERED orders */}
        {order.status === 'DELIVERED' && (
          <TouchableOpacity
            style={s.reviewButton}
            onPress={() => setReviewModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="star-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={s.reviewButtonText}>Leave a Review</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <LeaveReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={(rating, comment) => {
          handleReviewSubmit(rating, comment);
          setReviewModalVisible(false);
        }}
        orderId={id}
      />
    </>
  );
}

const s = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  center:        { flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  errorText:     { color: '#6B7280', textAlign: 'center', marginTop: 12, marginBottom: 16 },
  card:          { marginBottom: 12 },
  row:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText:      { fontSize: 13, color: '#6B7280' },
  orderNumber:   { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 2 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#111827', marginLeft: 8, flex: 1 },
  trackingRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  trackingNumber:{ fontSize: 14, fontWeight: '600', color: colors.brand },
  itemRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemImage:     { width: 64, height: 64, borderRadius: 10 },
  itemName:      { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemMeta:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemTotal:     { fontSize: 14, fontWeight: '700', color: '#111827' },
  addrName:      { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8 },
  addrLine:      { fontSize: 13, color: '#6B7280', marginTop: 2 },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryLabel:  { fontSize: 14, color: '#6B7280' },
  summaryValue:  { fontSize: 14, color: '#111827' },
  summaryDivider:{ borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 10 },
  totalLabel:    { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  totalValue:    { fontSize: 16, fontWeight: '800', color: colors.brand, marginTop: 8 },
  reviewButton:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 14, marginHorizontal: 16, marginBottom: 4 },
  reviewButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
