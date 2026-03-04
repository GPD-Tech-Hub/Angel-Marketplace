import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomNavBarStyles as styles } from '@/styles/bottomNavBar';

type TabItem = {
  key: string;
  label: string;
  route: string;
  icon: any;
  activeIcon?: any;
};

const tabs: TabItem[] = [
  {
    key: 'home',
    label: 'Home',
    route: '/(tabs)',
    icon: require('../../assets/icons/home.png'),
  },
  {
    key: 'shop',
    label: 'Shop',
    route: '/(tabs)/shop',
    icon: require('../../assets/icons/tag.png'),
  },
  {
    key: 'saved',
    label: 'Saved',
    route: '/(tabs)/saved',
    icon: require('../../assets/icons/saved.png'),
  },
  {
    key: 'cart',
    label: 'Cart',
    route: '/(tabs)/cart',
    icon: require('../../assets/icons/cart.png'),
  },
  {
    key: 'account',
    label: 'Account',
    route: '/(tabs)/profile',
    icon: require('../../assets/icons/profile.png'),
  },
];

export function BottomNavBar() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  // Determine active tab based on segments (more reliable than pathname)
  // segments will be like: ['(tabs)', 'index'] or ['(tabs)', 'cart'], etc.
  const getActiveTabKey = (): string | null => {
    const segmentsArray = Array.isArray(segments) ? segments : [];
    
    // Check if we're in the tabs group
    if (segmentsArray[0] !== '(tabs)') {
      return null;
    }

    const screen = segmentsArray[1];
    
    // Map screen names to tab keys
    // Type assertion needed because TypeScript doesn't know 'index' is a valid segment
    if (!screen || (screen as string) === 'index') return 'home';
    if (screen === 'shop') return 'shop';
    if (screen === 'saved') return 'saved';
    if (screen === 'cart') return 'cart';
    if (screen === 'profile') return 'account';
    
    return 'home'; // Default to home if in tabs but unknown screen
  };

  const activeTabKey = getActiveTabKey();

  // Hide bottom nav bar on orders screen
  const segmentsArray = Array.isArray(segments) ? segments : [];
  const screen = segmentsArray[1];
  if (screen === 'orders') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          // paddingBottom = safe area inset (home indicator / gesture bar)
          // + 12pt fixed inner padding so tab labels don't sit flush to the edge
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = activeTabKey === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            hitSlop={8}
          >
            {({ pressed }) => (
              <View style={[styles.tabContent, { opacity: pressed ? 0.7 : 1 }]}>
                <View style={styles.iconContainer}>
                  <Image
                    source={tab.icon}
                    style={[
                      styles.icon,
                      { tintColor: active ? '#F43F5E' : '#6B7280' }
                    ]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.label,
                  active && styles.labelActive
                ]}>
                  {tab.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default BottomNavBar;
