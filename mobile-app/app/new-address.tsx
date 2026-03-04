import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SuccessModal } from '@/components/ui';
import { newAddressScreenStyles as styles } from '@/styles/newAddressScreen';
import { geocode, geocodeSearch } from '@/services/geocoding.service';
import type { GeoResult } from '@/services/geocoding.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateAddress } from '@/queries';
import { useAuthStore } from '@/store';

const ADDRESS_NICKNAMES = ['Home', 'Office', 'Apartment', "Parent's House", 'Other'];

const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function NewAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createAddressMutation = useCreateAddress();

  const [addressNickname, setAddressNickname] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNicknamePicker, setShowNicknamePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [markerPosition, setMarkerPosition] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const mapRef = useRef<MapView>(null);
  const sheetScrollRef = useRef<ScrollView>(null);

  const debouncedQuery = useDebounce(fullAddress, 400);

  // Suggestions list while typing (no map update until user selects or presses Enter)
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setIsLoadingSuggestions(true);
    geocodeSearch(query, 5)
      .then((results) => {
        if (!cancelled) setSuggestions(results);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSuggestions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleAddressSubmit = () => {
    const query = fullAddress.trim();
    if (query.length < 3) return;
    setSuggestions([]);
    Keyboard.dismiss();
    setIsGeocoding(true);
    geocode(query)
      .then((result) => {
        if (!result) return;
        const newRegion: Region = {
          latitude: result.lat,
          longitude: result.lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMarkerPosition({ latitude: result.lat, longitude: result.lon });
        mapRef.current?.animateToRegion(newRegion, 400);
      })
      .finally(() => setIsGeocoding(false));
  };

  const handleSelectSuggestion = (item: GeoResult) => {
    setMarkerPosition({ latitude: item.lat, longitude: item.lon });
    mapRef.current?.animateToRegion(
      {
        latitude: item.lat,
        longitude: item.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400
    );
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const updatePinPosition = (latitude: number, longitude: number) => {
    setMarkerPosition({ latitude, longitude });
  };

  const handleMarkerDragEnd = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updatePinPosition(latitude, longitude);
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updatePinPosition(latitude, longitude);
  };

  const isFormValid = addressNickname.trim().length > 0 && fullAddress.trim().length > 0;

  const handleAdd = async () => {
    if (!isFormValid || isSaving) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to save an address.');
      return;
    }

    setIsSaving(true);
    try {
      // Parse the free-text address into structured fields as best we can.
      // Expected patterns: "Street, City, Postcode, Country" or similar.
      const parts = fullAddress.split(',').map((p) => p.trim()).filter(Boolean);
      const street = parts[0] ?? fullAddress;
      const city = parts[1] ?? addressNickname;
      const state = parts[2] ?? parts[1] ?? '';
      const zipCode = parts[3] ?? parts[2] ?? '';
      const country = parts[4] ?? parts[3] ?? 'United Kingdom';

      await createAddressMutation.mutateAsync({
        firstName: addressNickname, // nickname becomes the label (first field)
        lastName: '',
        address: street,
        city,
        state,
        zipCode,
        country,
        phone: '',
        isDefault,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleClose = () => router.back();
  const handleSelectNickname = (nickname: string) => {
    setAddressNickname(nickname);
    setShowNicknamePicker(false);
  };

  const mapHeight = height * 0.5;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>New Address</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.mainContent}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <MapView
            ref={mapRef}
            style={styles.mapImage}
            initialRegion={DEFAULT_REGION}
            showsUserLocation={false}
            mapType="standard"
            onPress={handleMapPress}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
              pinColor="#F43F5E"
            />
          </MapView>
          {isGeocoding && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="small" color="#F43F5E" />
              <Text style={styles.mapLoadingText}>Searching…</Text>
            </View>
          )}
        </View>

        <View style={[styles.bottomSheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.dragHandle} />
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { fontSize: Math.round(18 * scale) }]}>Address</Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              {({ pressed }) => (
                <Ionicons name="close" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
              )}
            </Pressable>
          </View>

          <ScrollView
            ref={sheetScrollRef}
            style={styles.sheetScrollView}
            contentContainerStyle={styles.sheetScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>Address Nickname</Text>
              <Pressable style={styles.pickerButton} onPress={() => setShowNicknamePicker(!showNicknamePicker)}>
                <Text
                  style={[
                    styles.pickerText,
                    { fontSize: Math.round(14 * scale), color: addressNickname ? '#111827' : '#9CA3AF' },
                  ]}
                >
                  {addressNickname || 'Choose one'}
                </Text>
                <Ionicons name="chevron-down" size={Math.round(20 * scale)} color="#6B7280" />
              </Pressable>
              {showNicknamePicker && (
                <View style={styles.pickerDropdown}>
                  {ADDRESS_NICKNAMES.map((nickname) => (
                    <Pressable key={nickname} style={styles.pickerOption} onPress={() => handleSelectNickname(nickname)}>
                      <Text style={[styles.pickerOptionText, { fontSize: Math.round(14 * scale) }]}>{nickname}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
                Full Address (tap map, move pin, or press Enter to search)
              </Text>
              <TextInput
                style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
                placeholder="Type address, then Enter or pick a suggestion..."
                placeholderTextColor="#9CA3AF"
                value={fullAddress}
                onChangeText={setFullAddress}
                onSubmitEditing={handleAddressSubmit}
                returnKeyType="search"
                multiline={false}
                onFocus={() => {
                  setTimeout(() => sheetScrollRef.current?.scrollToEnd({ animated: true }), 100);
                }}
              />
              {(isLoadingSuggestions || suggestions.length > 0) && (
                <View style={styles['suggestionsList']}>
                  {isLoadingSuggestions && suggestions.length === 0 ? (
                    <View style={styles['suggestionItem']}>
                      <ActivityIndicator size="small" color="#F43F5E" />
                      <Text style={[styles['suggestionText'], { fontSize: Math.round(13 * scale) }]}>Searching…</Text>
                    </View>
                  ) : (
                    suggestions.slice(0, 5).map((item) => (
                      <Pressable
                        key={`${item.lat}-${item.lon}`}
                        style={({ pressed }) => [styles['suggestionItem'], pressed && styles['suggestionItemPressed']]}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <Text style={[styles['suggestionText'], { fontSize: Math.round(13 * scale) }]} numberOfLines={2}>
                          {item.displayName}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>

            <Pressable style={styles.checkboxContainer} onPress={() => setIsDefault(!isDefault)}>
              <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                {isDefault && <Ionicons name="checkmark" size={Math.round(16 * scale)} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxLabel, { fontSize: Math.round(14 * scale) }]}>
                Make this as a default address
              </Text>
            </Pressable>

            <Pressable style={styles.addButton} onPress={handleAdd} disabled={!isFormValid || isSaving}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.addButtonInner,
                    isFormValid ? styles.addButtonEnabled : styles.addButtonDisabled,
                    { opacity: pressed && isFormValid ? 0.9 : 1 },
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.addButtonText,
                        { fontSize: Math.round(16 * scale), color: isFormValid ? '#FFFFFF' : '#6B7280' },
                      ]}
                    >
                      Add Address
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
            <View style={{ height: Math.max(insets.bottom, 16) }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title="Congratulations!"
        message="Your new address has been added."
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}
