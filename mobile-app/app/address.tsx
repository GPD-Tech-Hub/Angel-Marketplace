import { colors } from '@/constants/colors';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AddressCard, AddNewAddressButton } from '@/components/address';
import { useAddresses } from '@/queries';
import { addressScreenStyles as styles } from '@/styles/addressScreen';
import type { Address } from '@/types/user';

function formatAddressLine(a: Address): string {
  const parts = [
    `${a.firstName} ${a.lastName}`,
    a.address,
    ...(a.apartment ? [a.apartment] : []),
    `${a.city}, ${a.state} ${a.zipCode}`,
    a.country,
  ];
  return parts.join(', ');
}

function addressLabel(a: Address): string {
  return a.isDefault ? 'Default' : `${a.firstName} ${a.lastName}`;
}

export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const { data, isLoading, isError, error, refetch, isRefetching } = useAddresses();
  const addresses = data?.addresses ?? [];

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0],
    [addresses]
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  );

  const handleApply = () => {
    const id = selectedAddressId ?? defaultAddress?.id;
    const selected = id ? addresses.find((a) => a.id === id) : undefined;
    if (selected) {
      // Could pass selected back via params/context for checkout
    }
    router.back();
  };

  const handleAddNewAddress = () => {
    router.push('/new-address');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>Address</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>Address</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#6B7280', textAlign: 'center' }}>
            {(error as Error)?.message ?? 'Failed to load addresses'}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ marginTop: 16, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F43F5E', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          Address
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.brand}
          />
        }
      >
        <Text style={[styles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Saved Addresses
        </Text>

        {addresses.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', textAlign: 'center' }}>
              No saved addresses. Add one below.
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              label={addressLabel(address)}
              address={formatAddressLine(address)}
              isDefault={address.isDefault}
              isSelected={address.id === (selectedAddressId ?? defaultAddress?.id)}
              onPress={() => setSelectedAddressId(address.id)}
            />
          ))
        )}

        <AddNewAddressButton onPress={handleAddNewAddress} />
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.applyButton} onPress={handleApply}>
          {({ pressed }) => (
            <View style={[styles.applyButtonInner, { opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[styles.applyButtonText, { fontSize: Math.round(16 * scale) }]}>
                Apply
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
