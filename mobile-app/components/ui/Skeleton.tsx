import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps } from 'react-native';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius,
  variant = 'rectangular',
  className,
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'circular':
        return typeof height === 'number' ? height / 2 : 50;
      case 'text':
        return 4;
      default:
        return 8;
    }
  };

  return (
    <Animated.View
      className={`bg-gray-200 ${className || ''}`}
      style={[
        {
          width,
          height,
          borderRadius: getBorderRadius(),
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}

// Pre-built skeleton components
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <View className={`gap-2 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
          variant="text"
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <View className={`rounded-2xl bg-white p-4 ${className || ''}`}>
      <Skeleton height={150} className="mb-3" />
      <Skeleton height={20} width="80%" className="mb-2" />
      <Skeleton height={16} width="50%" />
    </View>
  );
}

export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <View className={`w-44 ${className || ''}`}>
      <Skeleton height={176} className="mb-2 rounded-xl" />
      <Skeleton height={16} width="80%" className="mb-1" />
      <Skeleton height={14} width="50%" />
    </View>
  );
}

export default Skeleton;
