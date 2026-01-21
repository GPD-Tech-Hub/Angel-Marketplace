import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFocus?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search products...',
  value,
  onChangeText,
  onSubmit,
  onFocus,
  autoFocus = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const displayValue = value !== undefined ? value : localValue;

  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setLocalValue(text);
    }
    onChangeText?.(text);
  };

  const handleClear = () => {
    handleChangeText('');
  };

  const handleSubmit = () => {
    onSubmit?.(displayValue);
  };

  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
      <Ionicons name="search-outline" size={20} color="#9ca3af" />
      <TextInput
        className="flex-1 ml-2 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={displayValue}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={onFocus}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {displayValue.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default SearchBar;
