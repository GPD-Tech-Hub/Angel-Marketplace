import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomNavBarStyles as styles } from '@/styles/bottomNavBar';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartQuery } from '@/queries/useCart';
import { useFavoritesQuery } from '@/queries/useFavorites';

type TabItem = {
  key: string;
  label: string;
  route: string;
  icon: any;
};

const tabs: TabItem[] = [
  { key: 'home',    label: 'Home',    route: '/(tabs)',         icon: require('../../assets/icons/home.png') },
  { key: 'shop',    label: 'Shop',    route: '/(tabs)/shop',    icon: require('../../assets/icons/tag.png') },
  { key: 'saved',   label: 'Saved',   route: '/(tabs)/saved',   icon: require('../../assets/icons/saved.png') },
  { key: 'cart',    label: 'Cart',    route: '/(tabs)/cart',    icon: require('../../assets/icons/cart.png') },
  { key: 'account', label: 'Account', route: '/(tabs)/profile', icon: require('../../assets/icons/profile.png') },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);
  return (
    <View style={[b.badge, label.length > 1 && b.badgeWide]}>
      <Text style={b.badgeText}>{label}</Text>
    </View>
  );
}

export function BottomNavBar() {
  const router   = useRouter();
  const segments = useSegments();
  const insets   = useSafeAreaInsets();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Cart count
  const localCartCount  = useCartStore((s) => s.itemCount());
  const { data: apiCart } = useCartQuery({ enabled: isAuthenticated });
  const cartCount = isAuthenticated
    ? (apiCart?.items ?? []).reduce((sum, i) => sum + i.quantity, 0)
    : localCartCount;

  // Saved count
  const localSavedCount = useFavoritesStore((s) => s.items.length);
  const { data: apiFavorites } = useFavoritesQuery({ enabled: isAuthenticated });
  const savedCount = isAuthenticated
    ? (apiFavorites ?? []).length
    : localSavedCount;

  const getActiveTabKey = (): string | null => {
    const segs = Array.isArray(segments) ? segments : [];
    if (segs[0] !== '(tabs)') return null;
    const screen = segs[1] as string | undefined;
    if (!screen || screen === 'index') return 'home';
    if (screen === 'shop')    return 'shop';
    if (screen === 'saved')   return 'saved';
    if (screen === 'cart')    return 'cart';
    if (screen === 'profile') return 'account';
    return 'home';
  };

  const activeTabKey = getActiveTabKey();

  const segmentsArray = Array.isArray(segments) ? segments : [];
  if ((segmentsArray[1] as string) === 'orders') return null;

  const badgeFor = (key: string) => {
    if (key === 'cart')  return cartCount;
    if (key === 'saved') return savedCount;
    return 0;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      {tabs.map((tab) => {
        const active = activeTabKey === tab.key;
        const badge  = badgeFor(tab.key);
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
                    style={[styles.icon, { tintColor: active ? '#F43F5E' : '#6B7280' }]}
                    resizeMode="contain"
                  />
                  <Badge count={badge} />
                </View>
                <Text style={[styles.label, active && styles.labelActive]}>
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

const b = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeWide: {
    minWidth: 20,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});

export default BottomNavBar;
