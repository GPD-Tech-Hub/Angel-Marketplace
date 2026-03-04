import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Share,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useOrder, useLeaveReview } from '@/queries';
import { OrderTimeline } from '@/components/orders';
import { LeaveReviewModal } from '@/components/orders/LeaveReviewModal';
import { formatCurrency, formatOrderDate } from '@/utils';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    color: '#92400E', bg: '#FFFBEB' },
  CONFIRMED:  { label: 'Confirmed',  color: '#1D4ED8', bg: '#EFF6FF' },
  PROCESSING: { label: 'Processing', color: '#6D28D9', bg: '#F5F3FF' },
  SHIPPED:    { label: 'Shipped',    color: '#0369A1', bg: '#F0F9FF' },
  DELIVERED:  { label: 'Delivered',  color: '#166534', bg: '#F0FDF4' },
  CANCELLED:  { label: 'Cancelled',  color: '#991B1B', bg: '#FEF2F2' },
};

function getBankDetails(currencyCode: string): string {
  if (currencyCode === 'NGN') {
    return 'Bank: Parallex Bank\nAccount Name: ANGELMP\nAccount Number: 100004476';
  }
  return 'Bank: Monzo\nSort Code: 04-00-04\nAccount Number: 64689014\nAccount Name: Angel Marketplace';
}

function isPickupAddress(addr: { firstName: string; address: string } | null | undefined): boolean {
  if (!addr) return false;
  return addr.firstName === 'Store' && addr.address === 'Store Pickup';
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const leaveReviewMutation = useLeaveReview();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!id) return;
    try {
      await leaveReviewMutation.mutateAsync({ orderId: id, rating, comment });
      refetch();
    } catch {
      // modal stays open on error so user can retry
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.loadingScreen, { paddingTop: insets.top }]}>
          <View style={[s.header, { paddingTop: insets.top }]}>
            <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>
            <Text style={s.headerTitle}>Order Details</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={s.loadingBody}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        </View>
      </>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.loadingScreen, { paddingTop: insets.top }]}>
          <View style={[s.header, { paddingTop: insets.top }]}>
            <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>
            <Text style={s.headerTitle}>Order Details</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={s.loadingBody}>
            <Ionicons name="alert-circle-outline" size={52} color="#EF4444" />
            <Text style={s.errorText}>Failed to load order</Text>
            <Pressable style={s.retryBtn} onPress={() => refetch()}>
              <Text style={s.retryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const meta        = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const isPending   = order.status === 'PENDING';
  const isDelivered = order.status === 'DELIVERED';
  const payMethod   = order.paymentMethod as string;
  const currency    = order.currencyCode ?? 'GBP';
  const pickup      = isPickupAddress(order.shippingAddress);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Custom header ─────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.5 : 1 }} />
          )}
        </Pressable>
        <Text style={s.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero: order number + status ───────────────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroOrderNum}>{order.orderNumber}</Text>
              <Text style={s.heroDate}>{formatOrderDate(order.createdAt)}</Text>
            </View>
            <View style={[s.statusPill, { backgroundColor: meta.bg }]}>
              <Text style={[s.statusPillText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>

          {/* Item thumbnails strip */}
          {order.items.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.thumbStrip}
            >
              {order.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/product/${item.product.slug}` as any)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.product.images?.[0] || config.IMAGE_PLACEHOLDER }}
                    style={s.thumb}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Payment pending banner ────────────────────────────────── */}
        {isPending && (
          <View style={s.pendingBanner}>
            <Ionicons name="time-outline" size={20} color="#92400E" style={{ marginRight: 10, marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.pendingTitle}>Payment Required</Text>
              <Text style={s.pendingBody}>
                Your items are reserved. Please complete your payment using the details below.
              </Text>
            </View>
          </View>
        )}

        {/* ── Bank transfer instructions ────────────────────────────── */}
        {isPending && payMethod === 'bank_transfer' && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="business-outline" size={18} color={colors.brand} />
              <Text style={s.sectionTitle}>Bank Transfer Details</Text>
            </View>
            <View style={s.bankBox}>
              <Text style={s.bankText}>{getBankDetails(currency)}</Text>
              <View style={s.bankDivider} />
              <Text style={s.bankRefLabel}>Payment reference</Text>
              <Text style={s.bankRefValue}>{order.orderNumber}</Text>
              <Text style={s.bankRefNote}>Include this reference so we can match your payment.</Text>
            </View>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => Alert.alert('Thank you', "We'll verify your transfer and confirm your order shortly.")}
              activeOpacity={0.85}
            >
              <Text style={s.actionBtnText}>I've Completed the Transfer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PayPal instructions ───────────────────────────────────── */}
        {isPending && payMethod === 'paypal' && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="logo-paypal" size={18} color="#003087" />
              <Text style={[s.sectionTitle, { color: '#003087' }]}>PayPal Payment</Text>
            </View>
            <Text style={s.instructionText}>
              Send {formatCurrency(order.total, currency)} to{' '}
              <Text style={s.instructionHighlight}>paypal.me/amp202247</Text>
              {' '}and include{' '}
              <Text style={s.instructionHighlight}>{order.orderNumber}</Text>
              {' '}as the note.
            </Text>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#003087', marginBottom: 8 }]}
              onPress={() => Linking.openURL('https://paypal.me/amp202247')}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-paypal" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.actionBtnText}>Open PayPal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.brand }]}
              onPress={() => Alert.alert('Thank you', "We'll verify your payment and confirm your order shortly.")}
              activeOpacity={0.85}
            >
              <Text style={[s.actionBtnText, { color: colors.brand }]}>I've Sent Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Espees instructions ───────────────────────────────────── */}
        {isPending && payMethod === 'espees' && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="wallet-outline" size={18} color="#7C3AED" />
              <Text style={[s.sectionTitle, { color: '#7C3AED' }]}>Espees Payment</Text>
            </View>
            <View style={s.espeesBox}>
              <Text style={s.espeesLabel}>Send to username</Text>
              <Text style={s.espeesUsername}>ANGELMP</Text>
              <Text style={s.espeesNote}>
                Amount: <Text style={{ fontWeight: '700' }}>{formatCurrency(order.total, currency)}</Text>
                {'\n'}Reference: <Text style={{ fontWeight: '700' }}>{order.orderNumber}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#7C3AED' }]}
              onPress={() => Alert.alert('Thank you', "We'll verify your Espees payment shortly.")}
              activeOpacity={0.85}
            >
              <Text style={s.actionBtnText}>I've Sent Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Order timeline ────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="map-outline" size={18} color={colors.brand} />
            <Text style={s.sectionTitle}>Order Progress</Text>
          </View>
          <OrderTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </View>

        {/* ── Tracking number ───────────────────────────────────────── */}
        {order.trackingNumber && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="airplane-outline" size={18} color={colors.brand} />
              <Text style={s.sectionTitle}>Tracking Number</Text>
            </View>
            <TouchableOpacity
              style={s.trackingBox}
              onPress={() => Share.share({ message: order.trackingNumber!, title: 'Tracking Number' })}
              activeOpacity={0.8}
            >
              <Text style={s.trackingNum}>{order.trackingNumber}</Text>
              <Ionicons name="copy-outline" size={18} color={colors.brand} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Items ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="bag-outline" size={18} color={colors.brand} />
            <Text style={s.sectionTitle}>Items ({order.items.length})</Text>
          </View>
          {order.items.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[s.itemRow, idx < order.items.length - 1 && s.itemRowBorder]}
              onPress={() => router.push(`/product/${item.product.slug}` as any)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.product.images?.[0] || config.IMAGE_PLACEHOLDER }}
                style={s.itemImg}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={s.itemMeta}>
                  {formatCurrency(item.price, currency)} × {item.quantity}
                </Text>
              </View>
              <Text style={s.itemTotal}>{formatCurrency(item.price * item.quantity, currency)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Delivery address ──────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="location-outline" size={18} color={colors.brand} />
            <Text style={s.sectionTitle}>{pickup ? 'Collection' : 'Delivery Address'}</Text>
          </View>
          {pickup ? (
            <Text style={s.addrLine}>Store Pickup — no delivery charge</Text>
          ) : (
            <>
              <Text style={s.addrName}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </Text>
              <Text style={s.addrLine}>
                {order.shippingAddress.address}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
              </Text>
              {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode) && (
                <Text style={s.addrLine}>
                  {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode]
                    .filter(Boolean).join(', ')}
                </Text>
              )}
              {order.shippingAddress.country ? (
                <Text style={s.addrLine}>{order.shippingAddress.country}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* ── Order summary ─────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="receipt-outline" size={18} color={colors.brand} />
            <Text style={s.sectionTitle}>Order Summary</Text>
          </View>
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
        </View>

        {/* ── Leave a review ────────────────────────────────────────── */}
        {isDelivered && (
          <TouchableOpacity
            style={s.reviewBtn}
            onPress={() => setReviewModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="star-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>
        )}

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

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Screen / layout
  loadingScreen: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingBody:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  scroll:        { flex: 1, backgroundColor: '#F9FAFB' },
  content:       { paddingHorizontal: 16, paddingTop: 12 },

  // Custom header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  // Error
  errorText: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  retryBtn:  { backgroundColor: colors.brand, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Hero card
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTop:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  heroOrderNum:  { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  heroDate:      { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
  statusPill:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText:{ fontSize: 12, fontWeight: '700' },
  thumbStrip:    { gap: 8 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },

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
  },
  pendingTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  pendingBody:  { fontSize: 12, color: '#A16207', lineHeight: 17 },

  // Generic section card
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },

  // Bank transfer
  bankBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  bankText:     { fontSize: 13, color: '#374151', lineHeight: 22 },
  bankDivider:  { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  bankRefLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  bankRefValue: { fontSize: 18, fontWeight: '800', color: colors.brand, marginTop: 2 },
  bankRefNote:  { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  // PayPal / generic instructions
  instructionText:      { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 12 },
  instructionHighlight: { fontWeight: '700', color: '#111827' },

  // Espees
  espeesBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  espeesLabel:    { fontSize: 11, fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.5 },
  espeesUsername: { fontSize: 26, fontWeight: '800', color: '#4C1D95', marginVertical: 6 },
  espeesNote:     { fontSize: 13, color: '#6D28D9', textAlign: 'center', lineHeight: 20 },

  // Action button (pay / confirm)
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Tracking
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackingNum: { fontSize: 15, fontWeight: '700', color: colors.brand, letterSpacing: 0.5 },

  // Items
  itemRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemImg:       { width: 60, height: 60, borderRadius: 10, backgroundColor: '#F3F4F6' },
  itemName:      { fontSize: 13, fontWeight: '600', color: '#111827' },
  itemMeta:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemTotal:     { fontSize: 14, fontWeight: '700', color: '#111827' },

  // Address
  addrName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  addrLine: { fontSize: 13, color: '#6B7280', lineHeight: 20 },

  // Order summary
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel:  { fontSize: 14, color: '#6B7280' },
  summaryValue:  { fontSize: 14, color: '#111827', fontWeight: '500' },
  summaryDivider:{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 8 },
  totalLabel:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue:    { fontSize: 16, fontWeight: '800', color: colors.brand },

  // Leave review
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 4,
  },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
