import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SuccessModal } from '@/components/ui';
import { newAddressScreenStyles as styles } from '@/styles/newAddressScreen';

// Address nickname options
const ADDRESS_NICKNAMES = ['Home', 'Office', 'Apartment', "Parent's House", 'Other'];

export default function NewAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const [addressNickname, setAddressNickname] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [showNicknamePicker, setShowNicknamePicker] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Button is enabled when both fields are filled
  const isFormValid = addressNickname.trim().length > 0 && fullAddress.trim().length > 0;

  const handleAdd = () => {
    if (!isFormValid) return;
    
    // TODO: Save address
    console.log('Add address:', { addressNickname, fullAddress, isDefault });
    
    // Show success modal
    setShowSuccessModal(true);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  const handleSelectNickname = (nickname: string) => {
    setAddressNickname(nickname);
    setShowNicknamePicker(false);
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
          New Address
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Map Section */}
      <View style={[styles.mapContainer, { height: height * 0.5 }]}>
        <ExpoImage
          source={require('../assets/image/map-placeholder.png')}
          style={styles.mapImage}
          contentFit="cover"
        />
      </View>

      {/* Bottom Sheet Form */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Form Header */}
        <View style={styles.formHeader}>
          <Text style={[styles.formTitle, { fontSize: Math.round(18 * scale) }]}>
            Address
          </Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            {({ pressed }) => (
              <Ionicons
                name="close"
                size={24}
                color="#111827"
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </Pressable>
        </View>

        {/* Address Nickname Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Address Nickname
          </Text>
          <Pressable
            style={styles.pickerButton}
            onPress={() => setShowNicknamePicker(!showNicknamePicker)}
          >
            <Text
              style={[
                styles.pickerText,
                {
                  fontSize: Math.round(14 * scale),
                  color: addressNickname ? '#111827' : '#9CA3AF',
                },
              ]}
            >
              {addressNickname || 'Choose one'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={Math.round(20 * scale)}
              color="#6B7280"
            />
          </Pressable>

          {/* Dropdown Picker */}
          {showNicknamePicker && (
            <View style={styles.pickerDropdown}>
              {ADDRESS_NICKNAMES.map((nickname) => (
                <Pressable
                  key={nickname}
                  style={styles.pickerOption}
                  onPress={() => handleSelectNickname(nickname)}
                >
                  <Text style={[styles.pickerOptionText, { fontSize: Math.round(14 * scale) }]}>
                    {nickname}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Full Address Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Full Address
          </Text>
          <TextInput
            style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="Enter your full address..."
            placeholderTextColor="#9CA3AF"
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
          />
        </View>

        {/* Default Address Checkbox */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setIsDefault(!isDefault)}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && (
              <Ionicons name="checkmark" size={Math.round(16 * scale)} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.checkboxLabel, { fontSize: Math.round(14 * scale) }]}>
            Make this as a default address
          </Text>
        </Pressable>

        {/* Add Button */}
        <Pressable
          style={styles.addButton}
          onPress={handleAdd}
          disabled={!isFormValid}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.addButtonInner,
                isFormValid ? styles.addButtonEnabled : styles.addButtonDisabled,
                { opacity: pressed && isFormValid ? 0.9 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.addButtonText,
                  {
                    fontSize: Math.round(16 * scale),
                    color: isFormValid ? '#FFFFFF' : '#6B7280',
                  },
                ]}
              >
                Add
              </Text>
            </View>
          )}
        </Pressable>

        {/* Bottom spacing for safe area */}
        <View style={{ height: Math.max(insets.bottom, 16) }} />
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Congratulations!"
        message="Your new address has been added."
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}
