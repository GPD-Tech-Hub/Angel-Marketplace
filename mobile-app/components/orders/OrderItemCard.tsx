import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils';
import { colors } from '@/constants/colors';

// ── Status pill config ────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    color: '#92400E', bg: '#FFFBEB' },
  CONFIRMED:  { label: 'Confirmed',  color: '#1D4ED8', bg: '#EFF6FF' },
  PROCESSING: { label: 'Processing', color: '#6D28D9', bg: '#F5F3FF' },
  SHIPPED:    { label: 'Shipped',    color: '#0369A1', bg: '#F0F9FF' },
  DELIVERED:  { label: 'Delivered',  color: '#166534', bg: '#F0FDF4' },
  CANCELLED:  { label: 'Cancelled',  color: '#991B1B', bg: '#FEF2F2' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface OrderItemCardProps {
  id: string;
  productName: string;
  size: string;
  price: number;
  status: string;
  image: any;
  isCompleted?: boolean;
  rating?: number;
  onPress?: () => void;
  onTrackOrder?: () => void;
  onLeaveReview?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OrderItemCard({
  productName,
  size,
  price,
  status,
  image,
  isCompleted = false,
  rating,
  onPress,
  onTrackOrder,
  onLeaveReview,
}: OrderItemCardProps) {
  const statusKey = status?.toUpperCase() ?? '';
  const statusMeta = STATUS_STYLE[statusKey] ?? { label: status, color: '#374151', bg: '#F3F4F6' };

  return (
    <Pressable style={({ pressed }) => [s.card, { opacity: pressed ? 0.95 : 1 }]} onPress={onPress ?? onTrackOrder}>
      {/* Image */}
      <Image source={image} style={s.image} contentFit="cover" />

      {/* Details */}
      <View style={s.details}>

        {/* Name + status pill */}
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={2}>{productName}</Text>
          <View style={[s.pill, { backgroundColor: statusMeta.bg }]}>
            <Text style={[s.pillText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>

        {/* Size — only if meaningful */}
        {size && size !== '-' && (
          <Text style={s.meta}>Size: {size}</Text>
        )}

        {/* Price + action */}
        <View style={s.footer}>
          <Text style={s.price}>{formatCurrency(price)}</Text>

          {isCompleted ? (
            <View style={s.completedActions}>
              {rating ? (
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [s.btn, s.btnOutline, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={onLeaveReview}
                >
                  <Text style={s.btnOutlineText}>Leave Review</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [s.btn, s.btnFill, { opacity: pressed ? 0.8 : 1 }]}
                onPress={onTrackOrder ?? onPress}
              >
                <Ionicons name="locate-outline" size={13} color="#fff" style={{ marginRight: 4 }} />
                <Text style={s.btnFillText}>Track</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [s.btn, s.btnFill, { opacity: pressed ? 0.8 : 1 }]}
              onPress={onTrackOrder ?? onPress}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 19,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  // Buttons
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  btnFill: {
    backgroundColor: colors.brand,
  },
  btnFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
  },
  // Completed tab actions row
  completedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
});
