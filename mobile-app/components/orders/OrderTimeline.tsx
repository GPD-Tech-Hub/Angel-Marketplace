import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '@/types';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const timelineSteps: TimelineStep[] = [
  { status: 'PENDING', label: 'Order Placed', icon: 'receipt-outline' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { status: 'PROCESSING', label: 'Processing', icon: 'cube-outline' },
  { status: 'SHIPPED', label: 'Shipped', icon: 'car-outline' },
  { status: 'DELIVERED', label: 'Delivered', icon: 'home-outline' },
];

const statusOrder: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export function OrderTimeline({
  currentStatus,
  createdAt,
  updatedAt,
}: OrderTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <View className="bg-red-50 rounded-xl p-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </View>
          <View className="ml-3">
            <Text className="text-base font-semibold text-red-600">
              Order Cancelled
            </Text>
            <Text className="text-sm text-gray-500">
              Your order has been cancelled
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const currentStepIndex = statusOrder.indexOf(currentStatus);

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Order Status
      </Text>
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isLast = index === timelineSteps.length - 1;

        return (
          <View key={step.status} className="flex-row">
            {/* Timeline indicator */}
            <View className="items-center mr-4">
              <View
                className={`
                  w-10 h-10 rounded-full items-center justify-center
                  ${isCompleted ? 'bg-primary-500' : 'bg-gray-200'}
                `}
              >
                <Ionicons
                  name={step.icon}
                  size={20}
                  color={isCompleted ? '#ffffff' : '#9ca3af'}
                />
              </View>
              {!isLast && (
                <View
                  className={`
                    w-0.5 h-12
                    ${index < currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </View>

            {/* Content */}
            <View className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
              <Text
                className={`
                  text-base font-medium
                  ${isCompleted ? 'text-gray-900' : 'text-gray-400'}
                `}
              >
                {step.label}
              </Text>
              {isCurrent && (
                <Text className="text-sm text-primary-600 mt-0.5">
                  Current status
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default OrderTimeline;
