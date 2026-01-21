import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldError } from 'react-hook-form';

interface FormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  error?: FieldError;
  type?: 'text' | 'email' | 'password' | 'phone';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  required?: boolean;
}

export function FormField({
  control,
  name,
  label,
  placeholder,
  error,
  type = 'text',
  autoCapitalize = 'none',
  autoComplete,
  required = false,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-black mb-2">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <View
              className={`bg-gray-50 rounded-xl border flex-row items-center ${
                error ? 'border-red-500' : 'border-gray-200'
              } ${isPassword ? 'px-4' : ''}`}
            >
              {!isPassword && (
                <TextInput
                  className="flex-1 px-4 py-[14px] text-base text-black"
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={
                    type === 'email'
                      ? 'email-address'
                      : type === 'phone'
                      ? 'phone-pad'
                      : 'default'
                  }
                  autoCapitalize={autoCapitalize}
                  autoComplete={autoComplete as any}
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
              {isPassword && (
                <>
                  <TextInput
                    className="flex-1 py-[14px] text-base text-black"
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {({ pressed }) => (
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color={pressed ? '#4b5563' : '#6b7280'}
                      />
                    )}
                  </Pressable>
                </>
              )}
            </View>
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

export default FormField;
