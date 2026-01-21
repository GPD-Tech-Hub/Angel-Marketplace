import React from 'react';
import { View, Text } from 'react-native';
import { useCart } from '@/hooks';

interface CartBadgeProps {
  size?: 'sm' | 'md';
}

export function CartBadge({ size = 'sm' }: CartBadgeProps) {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  const sizeStyles = {
    sm: 'min-w-[18px] h-[18px] px-1',
    md: 'min-w-[22px] h-[22px] px-1.5',
  };

  const textSizeStyles = {
    sm: 'text-[10px]',
    md: 'text-xs',
  };

  const displayCount = itemCount > 99 ? '99+' : itemCount.toString();

  return (
    <View
      className={`
        absolute -top-1 -right-1 items-center justify-center 
        rounded-full bg-red-500
        ${sizeStyles[size]}
      `}
    >
      <Text className={`font-bold text-white ${textSizeStyles[size]}`}>
        {displayCount}
      </Text>
    </View>
  );
}

export default CartBadge;
