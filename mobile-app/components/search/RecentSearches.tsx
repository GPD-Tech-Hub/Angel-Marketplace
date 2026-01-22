import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recentSearchesStyles as styles } from '@/styles/recentSearches';

type Props = {
  searches: string[];
  onSearchPress?: (search: string) => void;
  onClearAll?: () => void;
  onRemoveSearch?: (search: string) => void;
};

export function RecentSearches({
  searches,
  onSearchPress,
  onClearAll,
  onRemoveSearch,
}: Props) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <Pressable onPress={onClearAll} hitSlop={8}>
          {({ pressed }) => (
            <Text style={[styles.clearAll, { opacity: pressed ? 0.7 : 1 }]}>
              Clear all
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.list}>
        {searches.map((search, index) => (
          <View key={index} style={styles.itemWrapper}>
            <Pressable
              style={styles.item}
              onPress={() => onSearchPress?.(search)}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.itemContent,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.searchText} numberOfLines={1}>
                    {search}
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onRemoveSearch?.(search);
                    }}
                    hitSlop={8}
                  >
                    {({ pressed: removePressed }) => (
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color="#9CA3AF"
                        style={{ opacity: removePressed ? 0.7 : 1 }}
                      />
                    )}
                  </Pressable>
                </View>
              )}
            </Pressable>
            {index < searches.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default RecentSearches;
