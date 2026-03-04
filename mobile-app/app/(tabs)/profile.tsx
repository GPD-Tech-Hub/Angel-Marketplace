import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, Modal, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks';
import { useUnreadNotificationCount } from '@/queries';
import { NumberBadge } from '@/components/ui/Badge';
import { profileScreenStyles as styles } from '@/styles/profileScreen';
import { useCurrencyStore, CURRENCIES } from '@/store/currencyStore';
import { useCartStore } from '@/store/cartStore';
import { cartAvailableCurrencies } from '@/utils';
import { colors } from '@/constants/colors';

interface MenuItem {
  icon?: any; // require() path for image
  ionicon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  badge?: string;  // small text badge (e.g. currency code)
  onPress: () => void;
  isLogout?: boolean;
  showSeparator?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { isAuthenticated, logout } = useAuth();
  const { data: unreadData } = useUnreadNotificationCount({ enabled: isAuthenticated });
  const unreadCount = unreadData?.unreadCount ?? 0;
  const { currency, setCurrency } = useCurrencyStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCurrencyCodes = cartAvailableCurrencies(cartItems);
  const hasCartItems = cartItems.length > 0;
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: require('../../assets/icons/package.png'),
      label: 'My Orders',
      onPress: () => {
        router.push('/(tabs)/orders');
      },
      showSeparator: true,
    },
    {
      icon: require('../../assets/icons/user-cog.png'),
      label: 'My Details',
      onPress: () => {
        router.push('/my-details');
      },
    },
    {
      icon: require('../../assets/icons/map-pin-house.png'),
      label: 'Address Book',
      onPress: () => {
        router.push('/address');
      },
    },
    {
      icon: require('../../assets/icons/credit-card.png'),
      label: 'Payment Method',
      onPress: () => {
        router.push('/payment-method');
      },
    },
    {
      icon: require('../../assets/icons/notifications.png'),
      label: 'Notifications',
      onPress: () => {
        router.push('/notifications');
      },
    },
    {
      ionicon: 'globe-outline',
      label: 'Currency',
      badge: currency.code,
      onPress: () => setShowCurrencyPicker(true),
      showSeparator: true,
    },
    {
      icon: require('../../assets/icons/Question.png'),
      label: 'FAQs',
      onPress: () => {
        router.push('/faq' as any);
      },
    },
    {
      icon: require('../../assets/icons/headphones.png'),
      label: 'Help Center',
      onPress: () => {
        router.push('/contact' as any);
      },
    },
    {
      icon: require('../../assets/icons/circle-user.png'),
      label: 'About Us',
      onPress: () => {
        router.push('/about' as any);
      },
      showSeparator: false,
    },
    {
      icon: require('../../assets/icons/log-out.png'),
      label: 'Logout',
      onPress: () => {
        // TODO: Implement logout when authentication is ready
        if (isAuthenticated) {
          logout();
        }
      },
      isLogout: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111827"
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Account
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            <Pressable style={styles.menuItem} onPress={item.onPress}>
              {({ pressed }) => (
                <View style={[styles.menuItemInner, { opacity: pressed ? 0.7 : 1 }]}>
                  {item.ionicon ? (
                    <Ionicons
                      name={item.ionicon}
                      size={Math.round(24 * scale)}
                      color="#374151"
                      style={[styles.menuItemIcon, { width: Math.round(24 * scale), height: Math.round(24 * scale) }]}
                    />
                  ) : (
                    <Image
                      source={item.icon}
                      style={[
                        styles.menuItemIcon,
                        item.isLogout && styles.menuItemIconLogout,
                        { width: Math.round(24 * scale), height: Math.round(24 * scale) },
                      ]}
                      contentFit="contain"
                      tintColor={item.isLogout ? '#EF4444' : undefined}
                    />
                  )}
                  <Text
                    style={[
                      styles.menuItemText,
                      item.isLogout && styles.menuItemTextLogout,
                      { fontSize: Math.round(16 * scale) },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <View style={{ marginRight: 8 }}>
                      <NumberBadge count={unreadCount} size="sm" />
                    </View>
                  )}
                  {item.badge && (
                    <View style={cm.badge}>
                      <Text style={cm.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={item.isLogout ? '#EF4444' : '#9ca3af'}
                  />
                </View>
              )}
            </Pressable>
            {item.showSeparator && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <SafeAreaView style={cm.modal} edges={['top', 'bottom']}>
          <View style={cm.modalHeader}>
            <Text style={cm.modalTitle}>Select Currency</Text>
            <Pressable onPress={() => setShowCurrencyPicker(false)} hitSlop={10} style={cm.closeBtn}>
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>
          {hasCartItems && (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F9FAFB' }}>
              <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 16 }}>
                Greyed-out currencies aren't available for all items in your cart.
              </Text>
            </View>
          )}
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const selected = item.code === currency.code;
              const unavailable = hasCartItems && !cartCurrencyCodes.includes(item.code);
              return (
                <Pressable
                  style={[cm.currencyRow, selected && cm.currencyRowActive, unavailable && cm.currencyRowDisabled]}
                  onPress={() => {
                    if (unavailable) return;
                    setCurrency(item);
                    setShowCurrencyPicker(false);
                  }}
                  disabled={unavailable}
                >
                  <View style={cm.currencyLeft}>
                    <Text style={[cm.currencySymbol, unavailable && cm.textDisabled]}>{item.symbol}</Text>
                    <View>
                      <Text style={[cm.currencyCode, unavailable && cm.textDisabled]}>{item.code}</Text>
                      <Text style={[cm.currencyLabel, unavailable && cm.textDisabled]}>{item.label}{unavailable ? ' · Not available for all cart items' : ''}</Text>
                    </View>
                  </View>
                  {selected && <Ionicons name="checkmark" size={20} color={colors.brand} />}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={cm.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const cm = StyleSheet.create({
  badge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: '#111827' },
  closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  currencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  currencyRowActive: { backgroundColor: '#FFF0F3' },
  currencyLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  currencySymbol: { fontSize: 22, fontWeight: '700', color: '#111827', width: 28, textAlign: 'center' },
  currencyCode:  { fontSize: 15, fontWeight: '700', color: '#111827' },
  currencyLabel: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 },
  currencyRowDisabled: { opacity: 0.4 },
  textDisabled: { color: '#9CA3AF' },
});
