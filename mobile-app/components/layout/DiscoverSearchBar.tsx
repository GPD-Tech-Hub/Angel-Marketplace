import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  /** When provided, shows a filter button to the right of the search input */
  onFilterPress?: () => void;
  /** Fills the filter button with brand colour when a filter is active */
  hasActiveFilter?: boolean;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function DiscoverSearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  hasActiveFilter = false,
  placeholder = 'Search products…',
  containerStyle,
}: Props) {
  return (
    <View style={[s.row, containerStyle]}>

      {/* ── Search input ── */}
      <View style={s.inputWrap}>
        <Ionicons name="search-outline" size={17} color={colors.gray[400]} />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
      </View>

      {/* ── Filter button — always shown when handler provided ── */}
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          hitSlop={6}
          style={({ pressed }) => [
            s.filterBtn,
            hasActiveFilter && s.filterBtnActive,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={19}
            color={hasActiveFilter ? '#fff' : colors.brand}
          />
          {hasActiveFilter && <View style={s.activeDot} />}
        </Pressable>
      )}
    </View>
  );
}

const BTN = 44;   // filter button size — matches search bar height

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Search input box
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: BTN,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[800],
    paddingVertical: 0,   // prevent Android from adding extra height
  },

  // Filter button
  filterBtn: {
    width: BTN,
    height: BTN,
    borderRadius: 12,
    backgroundColor: '#FEF2F4',   // light brand tint when inactive
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtnActive: {
    backgroundColor: colors.brand,   // solid brand when filter is on
  },

  // Small dot indicator on the button corner
  activeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
});

export default DiscoverSearchBar;
