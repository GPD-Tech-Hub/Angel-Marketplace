import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Control, FieldErrors } from 'react-hook-form';
import { FormField } from './FormField';
import { FormButton } from './FormButton';
import { Ionicons } from '@expo/vector-icons';

export interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'password' | 'phone';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  required?: boolean;
}

interface FormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  fields: FormFieldConfig[];
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
  footerText?: React.ReactNode;
  showDivider?: boolean;
  secondaryButton?: {
    label: string;
    onPress: () => void;
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
    variant?: 'primary' | 'secondary' | 'outline';
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
  };
  submitButton?: {
    disabled?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  className?: string;
  scrollable?: boolean; // If false, Form won't create its own ScrollView (for use inside existing ScrollView)
}

export function Form({
  control,
  errors,
  fields,
  onSubmit,
  submitLabel,
  isLoading = false,
  footerText,
  showDivider = false,
  secondaryButton,
  submitButton,
  className,
  scrollable = true,
}: FormProps) {
  const formContent = (
    <View className={className || ''}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type={field.type}
          autoCapitalize={field.autoCapitalize}
          autoComplete={field.autoComplete}
          error={errors[field.name] as any}
          required={field.required}
        />
      ))}

      {footerText && <View className="mb-28 mt-[5px]">{footerText}</View>}

      <FormButton
        title={submitLabel}
        onPress={onSubmit}
        loading={isLoading}
        variant="primary"
        disabled={submitButton?.disabled}
        backgroundColor={submitButton?.backgroundColor}
        textColor={submitButton?.textColor}
      />

      {showDivider && (
        <View className="flex-row items-center my-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-500 font-medium text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>
      )}

      {secondaryButton && (
        <FormButton
          title={secondaryButton.label}
          onPress={secondaryButton.onPress}
          variant={secondaryButton.variant || 'secondary'}
          icon={secondaryButton.icon}
          iconPosition="right"
          leftElement={secondaryButton.leftElement}
          rightElement={secondaryButton.rightElement}
        />
      )}
    </View>
  );

  // If scrollable is false, return content directly (for use inside existing ScrollView)
  if (!scrollable) {
    return formContent;
  }

  // Otherwise, wrap in KeyboardAvoidingView and ScrollView
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {formContent}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Form;
