import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AddressCard, AddNewAddressButton } from '@/components/address';
import { addressScreenStyles as styles } from '@/styles/addressScreen';

// Mock addresses data
const MOCK_ADDRESSES = [
  {
    id: '1',
    label: 'Home',
    address: '925 S Chugach St #APT 10, Alaska 99645',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: '925 S Chugach St #APT 10, Alaska 99645',
    isDefault: false,
  },
  {
    id: '3',
    label: 'Apartment',
    address: '925 S Chugach St #APT 10, Alaska 99645',
    isDefault: false,
  },
  {
    id: '4',
    label: "Parent's House",
    address: '925 S Chugach St #APT 10, Alaska 99645',
    isDefault: false,
  },
];

export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Find default address or use first one
  const defaultAddress = MOCK_ADDRESSES.find((addr) => addr.isDefault) || MOCK_ADDRESSES[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress.id);

  const handleApply = () => {
    // TODO: Return selected address to checkout screen
    const selectedAddress = MOCK_ADDRESSES.find((addr) => addr.id === selectedAddressId);
    console.log('Selected address:', selectedAddress);
    router.back();
  };

  const handleAddNewAddress = () => {
    router.push('/new-address');
  };

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
          Address
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Addresses Title */}
        <Text style={[styles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Saved Addresses
        </Text>

        {/* Address Cards */}
        {MOCK_ADDRESSES.map((address) => (
          <AddressCard
            key={address.id}
            label={address.label}
            address={address.address}
            isDefault={address.isDefault}
            isSelected={address.id === selectedAddressId}
            onPress={() => setSelectedAddressId(address.id)}
          />
        ))}

        {/* Add New Address Button */}
        <AddNewAddressButton onPress={handleAddNewAddress} />

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
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
