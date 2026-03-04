import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '@/types';
import { colors } from '@/constants/colors';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const timelineSteps: TimelineStep[] = [
  { status: 'PENDING',    label: 'Order Placed',  description: 'We have received your order',        icon: 'receipt-outline' },
  { status: 'CONFIRMED',  label: 'Confirmed',      description: 'Your order has been confirmed',      icon: 'checkmark-circle-outline' },
  { status: 'PROCESSING', label: 'Processing',     description: 'We are preparing your items',        icon: 'cube-outline' },
  { status: 'SHIPPED',    label: 'Shipped',        description: 'Your order is on the way',           icon: 'bicycle-outline' },
  { status: 'DELIVERED',  label: 'Delivered',      description: 'Your order has been delivered',      icon: 'home-outline' },
];

const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export function OrderTimeline({ currentStatus, createdAt, updatedAt }: OrderTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <View style={s.cancelledBox}>
        <View style={s.cancelledIcon}>
          <Ionicons name="close-circle" size={26} color="#EF4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cancelledTitle}>Order Cancelled</Text>
          <Text style={s.cancelledSub}>This order has been cancelled</Text>
        </View>
      </View>
    );
  }

  const currentStepIndex = statusOrder.indexOf(currentStatus);

  return (
    <View>
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent   = index === currentStepIndex;
        const isLast      = index === timelineSteps.length - 1;

        return (
          <View key={step.status} style={s.stepRow}>
            {/* Left column: dot + connector line */}
            <View style={s.dotCol}>
              <View style={[s.dot, isCompleted ? s.dotDone : s.dotPending]}>
                <Ionicons
                  name={isCompleted ? (isCurrent ? step.icon : 'checkmark') : step.icon}
                  size={isCurrent ? 16 : 14}
                  color={isCompleted ? '#fff' : '#9CA3AF'}
                />
              </View>
              {!isLast && (
                <View style={[s.line, index < currentStepIndex ? s.lineDone : s.linePending]} />
              )}
            </View>

            {/* Right column: label + sub */}
            <View style={[s.content, isLast ? s.contentLast : s.contentSpaced]}>
              <Text style={[s.label, isCompleted ? s.labelDone : s.labelPending]}>
                {step.label}
              </Text>
              {isCurrent && (
                <Text style={s.currentTag}>Current status</Text>
              )}
              {!isCurrent && isCompleted && (
                <Text style={s.subDone}>{step.description}</Text>
              )}
              {!isCompleted && (
                <Text style={s.subPending}>{step.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default OrderTimeline;

const s = StyleSheet.create({
  // Cancelled
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    gap: 12,
  },
  cancelledIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledTitle: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  cancelledSub:   { fontSize: 13, color: '#EF4444', marginTop: 2 },

  // Step row
  stepRow: { flexDirection: 'row' },

  // Dot column
  dotCol:  { alignItems: 'center', width: 36 },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone:    { backgroundColor: colors.brand },
  dotPending: { backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  line:       { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  lineDone:   { backgroundColor: colors.brand },
  linePending:{ backgroundColor: '#E5E7EB' },

  // Content column
  content:        { flex: 1, paddingLeft: 12 },
  contentSpaced:  { paddingBottom: 20 },
  contentLast:    { paddingBottom: 4 },
  label:          { fontSize: 14, fontWeight: '600' },
  labelDone:      { color: '#111827' },
  labelPending:   { color: '#9CA3AF' },
  currentTag:     { fontSize: 12, fontWeight: '600', color: colors.brand, marginTop: 2 },
  subDone:        { fontSize: 12, color: '#6B7280', marginTop: 2 },
  subPending:     { fontSize: 12, color: '#D1D5DB', marginTop: 2 },
});
