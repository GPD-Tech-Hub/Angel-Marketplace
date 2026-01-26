import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { orderStatusTabsStyles as styles } from '@/styles/orderStatusTabs';

type OrderStatus = 'ongoing' | 'completed';

interface OrderStatusTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
}

export function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.tabContainer}
        onPress={() => onTabChange('ongoing')}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.tab,
              activeTab === 'ongoing' && styles.tabActive,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'ongoing' && styles.tabTextActive,
                { fontSize: Math.round(14 * scale) },
              ]}
            >
              Ongoing
            </Text>
          </View>
        )}
      </Pressable>
      <Pressable
        style={styles.tabContainer}
        onPress={() => onTabChange('completed')}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.tab,
              activeTab === 'completed' && styles.tabActive,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.tabTextActive,
                { fontSize: Math.round(14 * scale) },
              ]}
            >
              Completed
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
