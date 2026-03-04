import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
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

/** Bank details shown after order — mirrors PHP payment-pending.php and checkout.php */
function getBankDetails(currencyCode: string): string {
  if (currencyCode === 'NGN') {
    return 'Bank: Parallex Bank\nAccount Name: ANGELMP\nAccount Number: 100004476';
  }
  return 'Bank: Monzo\nSort Code: 04-00-04\nAccount Number: 64689014\nAccount Name: Angel Marketplace';
}

/** True when the address is the store-pickup placeholder */
function isPickupAddress(addr: { firstName: string; address: string } | null | undefined): boolean {
  if (!addr) return false;
  return addr.firstName === 'Store' && addr.address === 'Store Pickup';
}

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
  const isPending = order.status === 'PENDING';
  const paymentMethod = order.paymentMethod as string;
  const currency = order.currencyCode ?? 'GBP';
  const pickup = isPickupAddress(order.shippingAddress);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Order ${order.orderNumber}`,
          headerBackTitle: 'Back',
          headerTintColor: colors.brand,
        }}
      />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* ── Payment Pending Banner (matches payment-pending.php) ── */}
        {isPending && (
          <View style={s.pendingBanner}>
            <View style={s.pendingIconWrap}>
              <Ionicons name="time-outline" size={22} color="#92400E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.pendingTitle}>Action Required</Text>
              <Text style={s.pendingBody}>
                Your order is on hold. Items are reserved — please complete your payment using the instructions below.
              </Text>
            </View>
          </View>
        )}

        {/* ── Payment Instructions (pending orders only) ── */}
        {isPending && paymentMethod === 'paypal' && (
          <Card style={s.card}>
            <View style={s.row}>
              <Ionicons name="logo-paypal" size={20} color="#003087" />
              <Text style={[s.sectionTitle, { color: '#003087' }]}>PayPal Instructions</Text>
            </View>
            <Text style={s.instructionText}>
              {'1. Open PayPal and send the exact total to:\n'}
              <Text style={s.instructionHighlight}>paypal.me/amp202247</Text>
              {'\n2. Include your order number '}
              <Text style={s.instructionHighlight}>{order.orderNumber}</Text>
              {' in the payment note.\n3. Tap "I\'ve Sent Payment" below once done.'}
            </Text>
            <TouchableOpacity
              style={s.paypalButton}
              onPress={() => Linking.openURL('https://paypal.me/amp202247')}
            >
              <Ionicons name="logo-paypal" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.paypalButtonText}>Pay on PayPal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.confirmedButton}
              onPress={() => Alert.alert('Thank you', "We'll verify your payment and confirm your order shortly.")}
            >
              <Text style={s.confirmedButtonText}>I've Sent Payment</Text>
            </TouchableOpacity>
          </Card>
        )}

        {isPending && paymentMethod === 'bank_transfer' && (
          <Card style={s.card}>
            <View style={s.row}>
              <Ionicons name="business-outline" size={20} color={colors.brand} />
              <Text style={s.sectionTitle}>Bank Transfer Details</Text>
            </View>
            <View style={s.bankBox}>
              <Text style={s.bankText}>{getBankDetails(currency)}</Text>
              <View style={s.bankRefRow}>
                <Text style={s.bankRefLabel}>Payment Reference:</Text>
                <Text style={s.bankRefValue}>{order.orderNumber}</Text>
              </View>
              <Text style={s.bankRefNote}>Use your order number as the reference so we can identify your transfer.</Text>
            </View>
            <TouchableOpacity
              style={s.confirmedButton}
              onPress={() => Alert.alert('Thank you', "We'll verify your transfer and confirm your order shortly.")}
            >
              <Text style={s.confirmedButtonText}>I've Completed the Transfer</Text>
            </TouchableOpacity>
          </Card>
        )}

        {isPending && paymentMethod === 'espees' && (
          <Card style={s.card}>
            <View style={s.row}>
              <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
              <Text style={[s.sectionTitle, { color: '#7C3AED' }]}>Espees Payment</Text>
            </View>
            <View style={s.espeesBox}>
              <Text style={s.espeesLabel}>Send to username</Text>
              <Text style={s.espeesUsername}>ANGELMP</Text>
              <Text style={s.espeesNote}>
                Send exactly {formatCurrency(order.total, currency)} and include your order number{' '}
                <Text style={{ fontWeight: '700' }}>{order.orderNumber}</Text> as the note.
              </Text>
            </View>
            <TouchableOpacity
              style={[s.confirmedButton, { backgroundColor: '#7C3AED' }]}
              onPress={() => Alert.alert('Thank you', "We'll verify your Espees payment and confirm your order shortly.")}
            >
              <Text style={s.confirmedButtonText}>I've Sent Payment</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Order Header ── */}
        <Card style={s.card}>
          <View style={s.row}>
            <View>
              <Text style={s.dateText}>{formatOrderDate(order.createdAt)}</Text>
              <Text style={s.orderNumber}>{order.orderNumber}</Text>
            </View>
            <Badge label={label} variant={variant} />
          </View>
        </Card>

        {/* ── Order Timeline ── */}
        <View style={s.card}>
          <OrderTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </View>

        {/* ── Tracking Info ── */}
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

        {/* ── Order Items ── */}
        <Card style={s.card}>
          <Text style={s.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[s.itemRow, idx < order.items.length - 1 && s.itemRowBorder]}
              onPress={() => router.push(`/product/${item.product.slug}` as any)}
            >
              <Image
                source={{ uri: item.product.images?.[0] || config.IMAGE_PLACEHOLDER }}
                style={s.itemImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={s.itemMeta}>{formatCurrency(item.price, currency)} × {item.quantity}</Text>
              </View>
              <Text style={s.itemTotal}>{formatCurrency(item.price * item.quantity, currency)}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* ── Shipping Address / Pickup ── */}
        <Card style={s.card}>
          <View style={s.row}>
            <Ionicons name="location-outline" size={20} color={colors.brand} />
            <Text style={s.sectionTitle}>{pickup ? 'Collection' : 'Shipping Address'}</Text>
          </View>
          {pickup ? (
            <Text style={s.addrLine}>Store Pickup</Text>
          ) : (
            <>
              <Text style={s.addrName}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </Text>
              <Text style={s.addrLine}>
                {order.shippingAddress.address}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
              </Text>
              <Text style={s.addrLine}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Text>
              <Text style={s.addrLine}>{order.shippingAddress.country}</Text>
            </>
          )}
        </Card>

        {/* ── Order Summary ── */}
        <Card style={[s.card, { marginBottom: 12 }]}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>{formatCurrency(order.subtotal, currency)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Shipping</Text>
            <Text style={s.summaryValue}>
              {order.shipping > 0 ? formatCurrency(order.shipping, currency) : 'Free'}
            </Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{formatCurrency(order.total, currency)}</Text>
          </View>
        </Card>

        {/* ── Leave a Review (delivered only) ── */}
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

  // Pending banner
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  pendingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pendingTitle:  { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 3 },
  pendingBody:   { fontSize: 13, color: '#A16207', lineHeight: 18 },

  // Payment instructions
  instructionText:      { fontSize: 13, color: '#374151', lineHeight: 20, marginTop: 10, marginBottom: 12 },
  instructionHighlight: { fontWeight: '700', color: '#111827' },

  // PayPal button
  paypalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#003087',
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 8,
  },
  paypalButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Confirmed / "I've paid" button
  confirmedButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 4,
  },
  confirmedButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Bank transfer
  bankBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginTop: 10,
    marginBottom: 12,
  },
  bankText:     { fontSize: 13, color: '#374151', lineHeight: 22 },
  bankRefRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 6 },
  bankRefLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  bankRefValue: { fontSize: 15, fontWeight: '800', color: colors.brand, fontVariant: ['tabular-nums'] },
  bankRefNote:  { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  // Espees
  espeesBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: 14,
    marginTop: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  espeesLabel:    { fontSize: 11, fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.5 },
  espeesUsername: { fontSize: 24, fontWeight: '800', color: '#4C1D95', fontVariant: ['tabular-nums'], marginVertical: 6 },
  espeesNote:     { fontSize: 12, color: '#6D28D9', textAlign: 'center', lineHeight: 18 },

  // Order header
  dateText:      { fontSize: 13, color: '#6B7280' },
  orderNumber:   { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 2 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#111827', marginLeft: 8, flex: 1 },

  // Tracking
  trackingRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  trackingNumber: { fontSize: 14, fontWeight: '600', color: colors.brand },

  // Items
  itemRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemImage:     { width: 64, height: 64, borderRadius: 10, backgroundColor: '#F3F4F6' },
  itemName:      { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemMeta:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemTotal:     { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Address
  addrName:      { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8 },
  addrLine:      { fontSize: 13, color: '#6B7280', marginTop: 2 },

  // Summary
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryLabel:  { fontSize: 14, color: '#6B7280' },
  summaryValue:  { fontSize: 14, color: '#111827' },
  summaryDivider:{ borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 10 },
  totalLabel:    { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  totalValue:    { fontSize: 16, fontWeight: '800', color: colors.brand, marginTop: 8 },

  // Review button
  reviewButton:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 14, marginHorizontal: 16, marginBottom: 4 },
  reviewButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
