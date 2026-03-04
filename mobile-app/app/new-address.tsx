import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Keyboard,
  Platform,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SuccessModal } from '@/components/ui';
import {
  searchSuggestions,
  placeDetails,
  reverseGeocodeResult,
} from '@/services/geocoding.service';
import type { GeoResult, SearchSuggestion } from '@/services/geocoding.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateAddress } from '@/queries';
import { useAuthStore } from '@/store';
import { colors } from '@/constants/colors';

const ADDRESS_NICKNAMES = ['Home', 'Office', 'Apartment', "Parent's House", 'Other'];

const DEFAULT_REGION: Region = {
  latitude: 6.5244,   // Lagos, Nigeria as default (more relevant)
  longitude: 3.3792,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function geoResultToStructured(item: GeoResult) {
  return {
    address: item.street ?? item.primaryLine ?? item.displayName,
    city: item.city ?? '',
    state: item.state ?? '',
    zipCode: item.postcode ?? '',
    country: item.country ?? '',
  };
}

// ─── Search Modal ─────────────────────────────────────────────────────────────

function AddressSearchModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: GeoResult) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSuggestions([]);
      setSelecting(null);
    } else {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [visible]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    let cancelled = false;
    setLoading(true);
    searchSuggestions(q, 8)
      .then((r) => { if (!cancelled) setSuggestions(r); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = async (suggestion: SearchSuggestion) => {
    setSelecting(suggestion.placeId);
    Keyboard.dismiss();
    try {
      const detail = await placeDetails(suggestion.placeId);
      if (detail) {
        onSelect(detail);
        onClose();
      } else {
        Alert.alert('Error', 'Could not fetch address details. Please try another result.');
      }
    } catch {
      Alert.alert('Error', 'Could not fetch address details.');
    } finally {
      setSelecting(null);
    }
  };

  const showEmpty = query.trim().length < 2;
  const showNoResults = !loading && suggestions.length === 0 && query.trim().length >= 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={m.container} edges={['top']}>

        {/* ── Header ── */}
        <View style={m.header}>
          <View style={m.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              style={[m.searchInput, { fontSize: Math.round(15 * scale) }]}
              placeholder="Search estate, street, city…"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {loading && (
              <ActivityIndicator size="small" color={colors.brand} style={{ marginLeft: 6 }} />
            )}
          </View>
          <Pressable onPress={onClose} style={m.cancelBtn} hitSlop={10}>
            <Text style={[m.cancelText, { fontSize: Math.round(15 * scale) }]}>Cancel</Text>
          </Pressable>
        </View>

        {/* ── Body ── */}
        {showEmpty ? (
          <View style={m.placeholder}>
            <View style={m.placeholderIcon}>
              <Ionicons name="earth-outline" size={32} color="#D1D5DB" />
            </View>
            <Text style={[m.placeholderTitle, { fontSize: Math.round(17 * scale) }]}>
              Search any address
            </Text>
            <Text style={[m.placeholderSub, { fontSize: Math.round(13 * scale) }]}>
              Type an estate, street, city or{'\n'}landmark — worldwide coverage
            </Text>
          </View>
        ) : showNoResults ? (
          <View style={m.placeholder}>
            <View style={m.placeholderIcon}>
              <Ionicons name="location-outline" size={32} color="#D1D5DB" />
            </View>
            <Text style={[m.placeholderTitle, { fontSize: Math.round(17 * scale) }]}>
              No results found
            </Text>
            <Text style={[m.placeholderSub, { fontSize: Math.round(13 * scale) }]}>
              Try being more specific,{'\n'}e.g. "Lonex Gardens Lagos Nigeria"
            </Text>
          </View>
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(s) => s.placeId}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={m.listContent}
            renderItem={({ item }) => {
              const isItemLoading = selecting === item.placeId;
              const isDisabled = selecting !== null;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  disabled={isDisabled}
                  android_ripple={{ color: '#F3F4F6', borderless: false }}
                  style={({ pressed }) => [
                    m.row,
                    pressed && Platform.OS === 'ios' && m.rowPressed,
                  ]}
                >
                  {/* Left: pin icon in coloured square */}
                  <View style={m.iconBox}>
                    <Ionicons name="location-sharp" size={20} color={colors.brand} />
                  </View>

                  {/* Middle: two lines of text */}
                  <View style={m.textBox}>
                    <Text
                      style={[m.primary, { fontSize: Math.round(15 * scale) }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.primaryLine}
                    </Text>
                    {!!item.secondaryLine && (
                      <Text
                        style={[m.secondary, { fontSize: Math.round(13 * scale) }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.secondaryLine}
                      </Text>
                    )}
                  </View>

                  {/* Right: spinner only while loading */}
                  {isItemLoading && (
                    <ActivityIndicator size="small" color={colors.brand} style={{ marginLeft: 10 }} />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={m.sep} />}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    padding: 0,
    fontWeight: '400',
  },
  cancelBtn: { paddingVertical: 4 },
  cancelText: { color: colors.brand, fontWeight: '600' },

  // ── Empty / no-results ──
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingBottom: 80,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSub: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Results list ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Each result card
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rowPressed: { opacity: 0.85 },

  // Square icon badge
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },

  // Text column
  textBox: {
    flex: 1,
    minWidth: 0,
  },
  primary: {
    color: '#111827',
    fontWeight: '600',
    marginBottom: 3,
  },
  secondary: {
    color: '#9CA3AF',
    lineHeight: 18,
  },

  sep: { height: 0 }, // cards have their own margin
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NewAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createAddressMutation = useCreateAddress();
  const mapRef = useRef<MapView>(null);

  const [addressNickname, setAddressNickname] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNicknamePicker, setShowNicknamePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [parsedAddress, setParsedAddress] = useState<ReturnType<typeof geoResultToStructured> | null>(null);
  const [markerPosition, setMarkerPosition] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });

  const handleSelectResult = (item: GeoResult) => {
    setFullAddress(item.displayName);
    setParsedAddress(geoResultToStructured(item));
    if (item.lat !== 0 && item.lon !== 0) {
      const region: Region = {
        latitude: item.lat,
        longitude: item.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMarkerPosition({ latitude: item.lat, longitude: item.lon });
      mapRef.current?.animateToRegion(region, 400);
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    reverseGeocodeResult(latitude, longitude).then((result) => {
      if (result) {
        setFullAddress(result.displayName);
        setParsedAddress(geoResultToStructured(result));
      }
    });
  };

  const handleMarkerDragEnd = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    handleMapPress(e);
  };

  const isFormValid =
    addressNickname.trim().length > 0 &&
    recipientName.trim().length > 0 &&
    fullAddress.trim().length > 0;

  const handleAdd = async () => {
    if (!isFormValid || isSaving) return;
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to save an address.');
      return;
    }
    setIsSaving(true);
    try {
      const structured = parsedAddress ?? { address: fullAddress, city: '', state: '', zipCode: '', country: '' };
      const nameParts = recipientName.trim().split(' ');
      const firstName = nameParts[0] ?? recipientName.trim();
      const lastName = nameParts.slice(1).join(' ');
      await createAddressMutation.mutateAsync({
        firstName,
        lastName,
        address: structured.address || fullAddress,
        city: structured.city,
        state: structured.state,
        zipCode: structured.zipCode,
        country: structured.country,
        phone: phone.trim(),
        isDefault,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.headerBack} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
          )}
        </Pressable>
        <Text style={[s.headerTitle, { fontSize: Math.round(20 * scale) }]}>New Address</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <View style={s.mapWrapper}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={DEFAULT_REGION}
          mapType="standard"
          onPress={handleMapPress}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={handleMarkerDragEnd}
            pinColor={colors.brand}
          />
        </MapView>

        {/* Search trigger */}
        <Pressable style={s.searchTrigger} onPress={() => setShowSearchModal(true)}>
          <Ionicons name="search-outline" size={17} color="#9CA3AF" style={{ marginRight: 8, flexShrink: 0 }} />
          <Text
            style={[s.searchTriggerText, { fontSize: Math.round(14 * scale) }, fullAddress ? s.searchTriggerFilled : null]}
            numberOfLines={1}
          >
            {fullAddress || 'Search estate, street, city…'}
          </Text>
          {fullAddress ? (
            <Pressable
              hitSlop={14}
              onPress={() => { setFullAddress(''); setParsedAddress(null); }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" style={{ marginLeft: 6 }} />
            </Pressable>
          ) : (
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginLeft: 6 }} />
          )}
        </Pressable>
      </View>

      {/* Bottom Sheet */}
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <View style={s.dragHandle} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {/* Label picker */}
          <Text style={[s.fieldLabel, { fontSize: Math.round(14 * scale) }]}>Address Label</Text>
          <Pressable
            style={s.pickerButton}
            onPress={() => setShowNicknamePicker(!showNicknamePicker)}
          >
            <Text style={[s.pickerText, { fontSize: Math.round(14 * scale), color: addressNickname ? '#111827' : '#9CA3AF' }]}>
              {addressNickname || 'Choose one (e.g. Home, Office)'}
            </Text>
            <Ionicons name={showNicknamePicker ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </Pressable>
          {showNicknamePicker && (
            <View style={s.pickerDropdown}>
              {ADDRESS_NICKNAMES.map((n) => (
                <Pressable
                  key={n}
                  style={s.pickerOption}
                  onPress={() => { setAddressNickname(n); setShowNicknamePicker(false); }}
                >
                  <Text style={[s.pickerOptionText, { fontSize: Math.round(14 * scale) }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Recipient name */}
          <Text style={[s.fieldLabel, { fontSize: Math.round(14 * scale) }]}>Full Name</Text>
          <TextInput
            style={[s.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="Recipient's full name"
            placeholderTextColor="#9CA3AF"
            value={recipientName}
            onChangeText={setRecipientName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Phone */}
          <Text style={[s.fieldLabel, { fontSize: Math.round(14 * scale), marginTop: 10 }]}>Phone Number</Text>
          <TextInput
            style={[s.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="+234 800 000 0000"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {/* Selected address */}
          <Text style={[s.fieldLabel, { fontSize: Math.round(14 * scale), marginTop: 10 }]}>Address</Text>
          {fullAddress ? (
            <View style={s.selectedBox}>
              <Ionicons name="location" size={14} color={colors.brand} style={{ marginTop: 2, marginRight: 8, flexShrink: 0 }} />
              <Text style={[s.selectedText, { fontSize: Math.round(13 * scale) }]}>
                {fullAddress}
              </Text>
              <Pressable hitSlop={14} onPress={() => { setFullAddress(''); setParsedAddress(null); }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={s.addressEmptyBox} onPress={() => setShowSearchModal(true)}>
              <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <Text style={[s.hintText, { fontSize: Math.round(13 * scale), marginBottom: 0 }]}>
                Tap to search for your address
              </Text>
            </Pressable>
          )}

          {/* Default toggle */}
          <Pressable style={[s.checkboxRow, { marginTop: 14 }]} onPress={() => setIsDefault(!isDefault)}>
            <View style={[s.checkbox, isDefault && s.checkboxChecked]}>
              {isDefault && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[s.checkboxLabel, { fontSize: Math.round(14 * scale) }]}>
              Set as default address
            </Text>
          </Pressable>

          {/* Save */}
          <Pressable
            onPress={handleAdd}
            disabled={!isFormValid || isSaving}
            style={[s.saveButton, (!isFormValid || isSaving) && s.saveButtonDisabled]}
          >
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.85 : 1, alignItems: 'center' }}>
                {isSaving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={[s.saveButtonText, { fontSize: Math.round(16 * scale) }]}>Add Address</Text>
                }
              </View>
            )}
          </Pressable>
        </ScrollView>
      </View>

      <AddressSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleSelectResult}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Address Saved!"
        message="Your new address has been added."
        onContinue={() => { setShowSuccessModal(false); router.back(); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  headerBack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontWeight: '600', color: '#111827' },

  mapWrapper: { flex: 1 },

  searchTrigger: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchTriggerText: { flex: 1, color: '#9CA3AF' },
  searchTriggerFilled: { color: '#111827' },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    width: 40, height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  fieldLabel: { fontWeight: '500', color: '#111827', marginBottom: 6 },

  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  pickerText: { flex: 1, marginRight: 4 },
  pickerDropdown: {
    marginTop: -6,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: { color: '#111827' },

  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    color: '#111827',
    marginBottom: 4,
  },

  selectedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FFD6DD',
  },
  selectedText: { flex: 1, color: '#374151', lineHeight: 18 },

  addressEmptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 4,
  },

  hintText: { color: '#9CA3AF', marginBottom: 0, lineHeight: 18 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: colors.brand, borderColor: colors.brand },
  checkboxLabel: { color: '#111827', flex: 1 },

  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#E5E7EB' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
