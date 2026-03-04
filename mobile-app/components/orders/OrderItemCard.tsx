import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils';
import { colors } from '@/constants/colors';
import { config } from '@/constants/config';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:    { label: 'Pending',    color: '#92400E', bg: '#FFFBEB', dot: '#F59E0B' },
  CONFIRMED:  { label: 'Confirmed',  color: '#1E40AF', bg: '#EFF6FF', dot: '#3B82F6' },
  PROCESSING: { label: 'Processing', color: '#5B21B6', bg: '#F5F3FF', dot: '#8B5CF6' },
  SHIPPED:    { label: 'Shipped',    color: '#075985', bg: '#F0F9FF', dot: '#0EA5E9' },
  DELIVERED:  { label: 'Delivered',  color: '#14532D', bg: '#F0FDF4', dot: '#22C55E' },
  CANCELLED:  { label: 'Cancelled',  color: '#7F1D1D', bg: '#FEF2F2', dot: '#EF4444' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface OrderItemCardProps {
  id: string;
  // order-level fields
  orderId: string;
  orderNumber?: string;
  createdAt?: string;
  itemCount?: number;
  // item-level fields (first/representative item)
  productName: string;
  size: string;
  price: number;          // order total
  status: string;
  image: any;             // first item image
  images?: any[];         // all item images for strip
  isCompleted?: boolean;
  rating?: number;
  onPress?: () => void;
  onTrackOrder?: () => void;
  onLeaveReview?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OrderItemCard({
  orderNumber,
  createdAt,
  itemCount = 1,
  productName,
  price,
  status,
  image,
  images,
  isCompleted = false,
  rating,
  onPress,
  onTrackOrder,
  onLeaveReview,
}: OrderItemCardProps) {
  const statusKey  = status?.toUpperCase() ?? '';
  const meta       = STATUS_STYLE[statusKey] ?? { label: status, color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' };
  const displayDate = createdAt ? formatDate(createdAt) : '';

  // Build thumbnail list — up to 4
  const thumbs: any[] = images?.slice(0, 4) ?? [image];

  return (
    <Pressable
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
      onPress={onPress ?? onTrackOrder}
      android_ripple={{ color: '#F3F4F6' }}
    >
      {/* ── Top row: order number + status pill ── */}
      <View style={s.topRow}>
        <View style={s.orderMeta}>
          <Text style={s.orderNumber}>{orderNumber ?? 'Order'}</Text>
          {displayDate ? <Text style={s.orderDate}>{displayDate}</Text> : null}
        </View>
        <View style={[s.pill, { backgroundColor: meta.bg }]}>
          <View style={[s.pillDot, { backgroundColor: meta.dot }]} />
          <Text style={[s.pillText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={s.divider} />

      {/* ── Middle row: thumbnails + product info ── */}
      <View style={s.middleRow}>
        {/* Thumbnail strip */}
        <View style={s.thumbsWrap}>
          {thumbs.map((src, i) => (
            <Image
              key={i}
              source={src}
              style={[
                s.thumb,
                i > 0 && { marginLeft: -12 },
                { zIndex: thumbs.length - i },
              ]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ))}
          {itemCount > 4 && (
            <View style={[s.thumbMore, { marginLeft: -12, zIndex: 0 }]}>
              <Text style={s.thumbMoreText}>+{itemCount - 4}</Text>
            </View>
          )}
        </View>

        {/* Name + item count */}
        <View style={s.productInfo}>
          <Text style={s.productName} numberOfLines={2}>
            {productName}
          </Text>
          {itemCount > 1 && (
            <Text style={s.itemCount}>+{itemCount - 1} more item{itemCount - 1 !== 1 ? 's' : ''}</Text>
          )}
        </View>
      </View>

      {/* ── Bottom row: total + action buttons ── */}
      <View style={s.bottomRow}>
        <View>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>{formatCurrency(price)}</Text>
        </View>

        <View style={s.actions}>
          {isCompleted ? (
            <>
              {rating != null ? (
                <View style={s.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={s.ratingText}>{Number(rating).toFixed(1)}</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [s.btnOutline, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={(e) => { e.stopPropagation?.(); onLeaveReview?.(); }}
                  hitSlop={6}
                >
                  <Ionicons name="star-outline" size={13} color={colors.brand} style={{ marginRight: 4 }} />
                  <Text style={s.btnOutlineText}>Review</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [s.btnFill, { opacity: pressed ? 0.8 : 1 }]}
                onPress={(e) => { e.stopPropagation?.(); (onTrackOrder ?? onPress)?.(); }}
                hitSlop={6}
              >
                <Ionicons name="locate-outline" size={13} color="#fff" style={{ marginRight: 4 }} />
                <Text style={s.btnFillText}>Track</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={({ pressed }) => [s.btnFill, { opacity: pressed ? 0.8 : 1 }]}
              onPress={(e) => { e.stopPropagation?.(); (onTrackOrder ?? onPress)?.(); }}
              hitSlop={6}
            >
              <Ionicons name="locate-outline" size={13} color="#fff" style={{ marginRight: 4 }} />
              <Text style={s.btnFillText}>Track Order</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ── Date formatter ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: '#FAFAFA',
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderMeta: { flex: 1, marginRight: 8 },
  orderNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Status pill
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    flexShrink: 0,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },

  // Middle row
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  thumbsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#fff',
  },
  thumbMore: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },
  itemCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Buttons
  btnFill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  btnFillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },

  // Rating badge
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
});
