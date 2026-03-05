import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function KingsChatCallbackScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator size="small" color="#F43F5E" />
      <Text className="mt-4 text-center text-sm text-gray-500">
        Completing KingsChat sign in...
      </Text>
    </View>
  );
}
