import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  backgroundColor?: string;
  textColor?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function FormButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  backgroundColor,
  textColor,
  leftElement,
  rightElement,
}: FormButtonProps) {
  const variantStyles = {
    primary: 'bg-gray-100',
    secondary: 'bg-blue-500',
    outline: 'bg-transparent border-2 border-gray-300',
  };

  const textStyles = {
    primary: 'text-black',
    secondary: 'text-white',
    outline: 'text-black',
  };

  const isDisabled = disabled || loading;
  const resolvedTextColor =
    textColor ?? (variant === 'secondary' ? '#ffffff' : '#000000');

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${variantStyles[variant]} rounded-xl py-4 ${fullWidth ? 'w-full' : ''} ${
        isDisabled ? 'opacity-50' : ''
      }`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {({ pressed }) => (
        <View className="flex-row items-center justify-center">
          {loading ? (
            <ActivityIndicator
              color={resolvedTextColor}
              size="small"
            />
          ) : (
            <>
              {leftElement}
              {icon && iconPosition === 'left' && (
                <Ionicons
                  name={icon}
                  size={20}
                  color={resolvedTextColor}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                className={`text-base font-semibold ${textStyles[variant]} ${pressed ? 'opacity-70' : ''}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <Ionicons
                  name={icon}
                  size={20}
                  color={resolvedTextColor}
                  style={{ marginLeft: 8 }}
                />
              )}
              {rightElement}
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default FormButton;
