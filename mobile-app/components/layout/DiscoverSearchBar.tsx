import React from 'react';
import { View, TextInput, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { discoverSearchBarStyles as styles } from '@/styles/discoverSearchBar';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function DiscoverSearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.searchRow, containerStyle]}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
      </View>

      <Pressable style={styles.filterButton} onPress={onFilterPress}>
        {({ pressed }) => (
          <Image
            source={require('../../assets/icons/filter.png')}
            style={[styles.filterIcon, { opacity: pressed ? 0.7 : 1 }]}
            contentFit="contain"
          />
        )}
      </Pressable>
    </View>
  );
}

export default DiscoverSearchBar;

