import React from 'react';
import { View, Text } from 'react-native';
import { useCart } from '@/hooks';
import { useAuthStore } from '@/store';
import { useCartQuery } from '@/queries';

interface CartBadgeProps {
  size?: 'sm' | 'md';
}

export function CartBadge({ size = 'sm' }: CartBadgeProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: apiCart } = useCartQuery({ enabled: isAuthenticated });
  const { itemCount: storeItemCount } = useCart();

  // Prefer API cart count when logged in; fall back to local store
  const itemCount = isAuthenticated && apiCart
    ? apiCart.itemCount ?? apiCart.items?.length ?? 0
    : storeItemCount;

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
        rounded-full bg-brand
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
