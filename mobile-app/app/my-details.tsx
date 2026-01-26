import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, useWindowDimensions, Modal, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { myDetailsScreenStyles as styles } from '@/styles/myDetailsScreen';

// Gender options
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// Country codes (simplified - just US for now)
const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
];

export default function MyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Form state
  const [fullName, setFullName] = useState<string>('Cody Fisher'); // Non-editable, mock data
  const [email, setEmail] = useState<string>('cody.fisher45@example'); // Non-editable, mock data
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]);

  // Dropdown states
  const [showGenderPicker, setShowGenderPicker] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date as MM/DD/YYYY
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle date picker change
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      setDateOfBirth(formatDate(date));
      
      if (Platform.OS === 'ios') {
        // On iOS, keep the picker open until user confirms
      }
    } else if (Platform.OS === 'android') {
      // User cancelled on Android
      setShowDatePicker(false);
    }
  };

  // Handle calendar icon press
  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  // Handle date picker confirm (iOS)
  const handleDatePickerConfirm = () => {
    setShowDatePicker(false);
  };

  // Format date of birth as MM/DD/YYYY (for manual input)
  const handleDateOfBirthChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    setDateOfBirth(formatted);
  };

  // Format phone number with spaces
  const handlePhoneNumberChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 3 digits
    const formatted = cleaned.match(/.{1,3}/g)?.join(' ') || cleaned;
    setPhoneNumber(formatted);
  };

  // Check if form is valid (all editable fields filled)
  const isFormValid = dateOfBirth.trim().length > 0 && 
                      gender.trim().length > 0 && 
                      phoneNumber.trim().length > 0;

  const handleSave = () => {
    if (!isFormValid) return;
    
    // TODO: Save user details to backend
    console.log('Save details:', {
      fullName,
      email,
      dateOfBirth,
      gender,
      phoneNumber: `${selectedCountryCode.code} ${phoneNumber}`,
    });
    
    // Navigate back
    router.back();
  };

  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  const handleSelectCountry = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountryCode(country);
    setShowCountryPicker(false);
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
          My Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full Name Field - Non-editable */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Full Name
          </Text>
          <TextInput
            style={[styles.textInput, styles.textInputDisabled, { fontSize: Math.round(14 * scale) }]}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            value={fullName}
            editable={false}
          />
        </View>

        {/* Email Address Field - Non-editable */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Email Address
          </Text>
          <TextInput
            style={[styles.textInput, styles.textInputDisabled, { fontSize: Math.round(14 * scale) }]}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            value={email}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Date of Birth Field - Input and calendar in same container */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Date of Birth
          </Text>
          <View style={[styles.textInput, styles.inputWithIcon]}>
            <TextInput
              style={[styles.textInputInner, { fontSize: Math.round(14 * scale) }]}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              value={dateOfBirth}
              onChangeText={handleDateOfBirthChange}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Pressable onPress={handleCalendarPress} hitSlop={8}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
            </Pressable>
          </View>
        </View>

        {/* Gender Field - Input and chevron in same container */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Gender
          </Text>
          <Pressable
            style={[styles.textInput, styles.inputWithIcon]}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <TextInput
              style={[styles.textInputInner, { fontSize: Math.round(14 * scale) }]}
              placeholder="Select gender"
              placeholderTextColor="#9CA3AF"
              value={gender}
              editable={false}
            />
            <Ionicons
              name="chevron-down"
              size={20}
              color="#6B7280"
              style={styles.inputIcon}
            />
          </Pressable>
          {showGenderPicker && (
            <View style={styles.pickerDropdown}>
              {GENDER_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={styles.pickerOption}
                  onPress={() => handleSelectGender(option)}
                >
                  <Text style={[styles.pickerOptionText, { fontSize: Math.round(14 * scale) }]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Phone Number Field - Country code and input in same container */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Phone Number
          </Text>
          <View style={[styles.textInput, styles.phoneNumberContainer]}>
            {/* Country Code Selector */}
            <Pressable
              style={styles.countryCodeSelector}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={[styles.countryFlag, { fontSize: Math.round(18 * scale) }]}>
                {selectedCountryCode.flag}
              </Text>
              <Text style={[styles.countryCode, { fontSize: Math.round(14 * scale) }]}>
                {selectedCountryCode.code}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#6B7280"
                style={styles.countryChevron}
              />
            </Pressable>
            {showCountryPicker && (
              <View style={styles.countryPickerDropdown}>
                {COUNTRY_CODES.map((country) => (
                  <Pressable
                    key={country.code}
                    style={styles.pickerOption}
                    onPress={() => handleSelectCountry(country)}
                  >
                    <Text style={[styles.pickerOptionText, { fontSize: Math.round(14 * scale) }]}>
                      {country.flag} {country.name} ({country.code})
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {/* Phone Number Input */}
            <TextInput
              style={[styles.phoneNumberInput, { fontSize: Math.round(14 * scale) }]}
              placeholder="Phone number"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Details Button - Just below phone number */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!isFormValid}
          >
            {({ pressed }) => (
              <View style={[
                styles.saveButtonInner,
                isFormValid && styles.saveButtonActive,
                { opacity: pressed ? 0.9 : 1 }
              ]}>
                <Text style={[
                  styles.saveButtonText,
                  isFormValid && styles.saveButtonTextActive,
                  { fontSize: Math.round(16 * scale) }
                ]}>
                  Save Details
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.datePickerCancel, { fontSize: Math.round(16 * scale) }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Text style={[styles.datePickerTitle, { fontSize: Math.round(18 * scale) }]}>
                  Select Date
                </Text>
                <Pressable onPress={handleDatePickerConfirm}>
                  <Text style={[styles.datePickerConfirm, { fontSize: Math.round(16 * scale) }]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}
    </SafeAreaView>
  );
}
