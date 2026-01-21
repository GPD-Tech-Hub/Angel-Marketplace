import React, { useRef, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
}

export function OTPInput({
  length = 4,
  value,
  onChange,
  onComplete,
  error = false,
}: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit) {
      const newValue = value.split('');
      newValue[index] = digit;
      const updatedValue = newValue.join('').slice(0, length);
      onChange(updatedValue);

      // Auto-focus next input
      if (index < length - 1 && digit) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete if all digits are filled
      if (updatedValue.length === length && onComplete) {
        onComplete(updatedValue);
      }
    } else {
      // Handle backspace
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View className="flex-row justify-center gap-3">
      {Array.from({ length }).map((_, index) => {
        const digit = value[index] || '';
        const isFocused = focusedIndex === index;
        
        return (
          <Pressable
            key={index}
            onPress={() => inputRefs.current[index]?.focus()}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className={`
                w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold
                ${error ? 'border-red-500' : isFocused ? 'border-[#F43F5E]' : 'border-gray-200'}
                ${digit ? 'bg-white' : 'bg-gray-50'}
              `}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default OTPInput;
