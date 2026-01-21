import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100',
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
  };

  const textVariantStyles = {
    default: 'text-gray-700',
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={`
        rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className || ''}
      `}
      {...props}
    >
      <Text
        className={`
          font-medium
          ${textVariantStyles[variant]}
          ${textSizeStyles[size]}
        `}
      >
        {label}
      </Text>
    </View>
  );
}

// Number badge for cart, notifications, etc.
interface NumberBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md';
}

export function NumberBadge({ count, maxCount = 99, size = 'sm' }: NumberBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeStyles = {
    sm: 'min-w-[18px] h-[18px] px-1',
    md: 'min-w-[22px] h-[22px] px-1.5',
  };

  const textSizeStyles = {
    sm: 'text-[10px]',
    md: 'text-xs',
  };

  return (
    <View
      className={`
        items-center justify-center rounded-full bg-red-500
        ${sizeStyles[size]}
      `}
    >
      <Text className={`font-bold text-white ${textSizeStyles[size]}`}>
        {displayCount}
      </Text>
    </View>
  );
}

export default Badge;
