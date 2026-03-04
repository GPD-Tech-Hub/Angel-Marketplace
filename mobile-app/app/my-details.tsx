import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, useWindowDimensions, Modal, Platform, ActivityIndicator, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { myDetailsScreenStyles as styles } from '@/styles/myDetailsScreen';
import { useUserProfile, useUpdateProfile } from '@/queries';
import { colors } from '@/constants/colors';

const cm = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#fff' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title:       { fontSize: 18, fontWeight: '700', color: '#111827' },
  closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12 },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#111827' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  rowActive:   { backgroundColor: '#FFF0F3' },
  flag:        { fontSize: 24, marginRight: 12 },
  countryName: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  dialCode:    { fontSize: 14, color: '#6B7280', marginRight: 8 },
  separator:   { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
});

// Gender options
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// Full country dial code list
const COUNTRY_CODES = [
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+1',   flag: '🇦🇬', name: 'Antigua & Barbuda' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+1',   flag: '🇧🇸', name: 'Bahamas' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+1',   flag: '🇧🇧', name: 'Barbados' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+238', flag: '🇨🇻', name: 'Cape Verde' },
  { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
  { code: '+235', flag: '🇹🇩', name: 'Chad' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+53',  flag: '🇨🇺', name: 'Cuba' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+1',   flag: '🇩🇲', name: 'Dominica' },
  { code: '+1',   flag: '🇩🇴', name: 'Dominican Republic' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+1',   flag: '🇬🇩', name: 'Grenada' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
  { code: '+592', flag: '🇬🇾', name: 'Guyana' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+1',   flag: '🇯🇲', name: 'Jamaica' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+7',   flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+674', flag: '🇳🇷', name: 'Nauru' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+680', flag: '🇵🇼', name: 'Palau' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+1',   flag: '🇰🇳', name: 'Saint Kitts & Nevis' },
  { code: '+1',   flag: '🇱🇨', name: 'Saint Lucia' },
  { code: '+1',   flag: '🇻🇨', name: 'Saint Vincent' },
  { code: '+685', flag: '🇼🇸', name: 'Samoa' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+239', flag: '🇸🇹', name: 'São Tomé & Príncipe' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+597', flag: '🇸🇷', name: 'Suriname' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+1',   flag: '🇹🇹', name: 'Trinidad & Tobago' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
];

type CountryCode = typeof COUNTRY_CODES[0];

export default function MyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  // Form state (synced from API)
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName]   = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    COUNTRY_CODES.find((c) => c.name === 'United Kingdom') ?? COUNTRY_CODES[0]
  );
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setGender(profile.gender || '');
      const phone = profile.phone || '';
      setPhoneNumber(phone.replace(/^\+\d+\s*/, '').trim());
    }
  }, [profile]);

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
  const isFormValid = firstName.trim().length > 0 &&
                      lastName.trim().length > 0 &&
                      dateOfBirth.trim().length > 0 && 
                      gender.trim().length > 0 && 
                      phoneNumber.trim().length > 0;

  const handleSave = async () => {
    if (!isFormValid || updateProfile.isPending) return;
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: `${selectedCountryCode.code} ${phoneNumber}`.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      });
      router.back();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      Alert.alert('Could not save', message);
    }
  };

  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountryCode(country);
    setShowCountryPicker(false);
    setCountrySearch('');
  };

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [countrySearch]);

  if (profileLoading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      </SafeAreaView>
    );
  }

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
        {/* First Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            First Name
          </Text>
          <TextInput
            style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        {/* Last Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Last Name
          </Text>
          <TextInput
            style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
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
            disabled={!isFormValid || updateProfile.isPending}
          >
            {({ pressed }) => (
              <View style={[
                styles.saveButtonInner,
                isFormValid && styles.saveButtonActive,
                { opacity: pressed ? 0.9 : 1 }
              ]}>
                {updateProfile.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.saveButtonText,
                    isFormValid && styles.saveButtonTextActive,
                    { fontSize: Math.round(16 * scale) }
                  ]}>
                    Save Details
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowCountryPicker(false); setCountrySearch(''); }}
      >
        <SafeAreaView style={cm.container} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={cm.header}>
            <Text style={cm.title}>Select Country</Text>
            <Pressable
              onPress={() => { setShowCountryPicker(false); setCountrySearch(''); }}
              hitSlop={10}
              style={cm.closeBtn}
            >
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          {/* Search */}
          <View style={cm.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" style={cm.searchIcon} />
            <TextInput
              style={cm.searchInput}
              placeholder="Search country or code…"
              placeholderTextColor="#9CA3AF"
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={[
                  cm.row,
                  item.name === selectedCountryCode.name && cm.rowActive,
                ]}
                onPress={() => handleSelectCountry(item)}
              >
                <Text style={cm.flag}>{item.flag}</Text>
                <Text style={cm.countryName}>{item.name}</Text>
                <Text style={cm.dialCode}>{item.code}</Text>
                {item.name === selectedCountryCode.name && (
                  <Ionicons name="checkmark" size={18} color="#F43F5E" />
                )}
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={cm.separator} />}
          />
        </SafeAreaView>
      </Modal>

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
