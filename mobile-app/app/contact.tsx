import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';

export default function ContactScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = name.trim() && email.trim() && message.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post(ENDPOINTS.CONTACT.SUBMIT, { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });
      Alert.alert('Message Sent', "Thanks for reaching out! We'll get back to you as soon as possible.", [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
          )}
        </Pressable>
        <Text style={[s.headerTitle, { fontSize: Math.round(20 * scale) }]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[s.intro, { fontSize: Math.round(14 * scale) }]}>
          Have a question or need support? Fill in the form below and our team will get back to you.
        </Text>

        {/* Name */}
        <View style={s.field}>
          <Text style={[s.label, { fontSize: Math.round(13 * scale) }]}>Full Name *</Text>
          <TextInput
            style={[s.input, { fontSize: Math.round(14 * scale) }]}
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View style={s.field}>
          <Text style={[s.label, { fontSize: Math.round(13 * scale) }]}>Email Address *</Text>
          <TextInput
            style={[s.input, { fontSize: Math.round(14 * scale) }]}
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Subject */}
        <View style={s.field}>
          <Text style={[s.label, { fontSize: Math.round(13 * scale) }]}>Subject</Text>
          <TextInput
            style={[s.input, { fontSize: Math.round(14 * scale) }]}
            placeholder="What is this about?"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Message */}
        <View style={s.field}>
          <Text style={[s.label, { fontSize: Math.round(13 * scale) }]}>Message *</Text>
          <TextInput
            style={[s.input, s.textarea, { fontSize: Math.round(14 * scale) }]}
            placeholder="Describe your issue or question..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <Pressable
          style={[s.submitBtn, !isValid && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.85 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[s.submitBtnText, { fontSize: Math.round(16 * scale) }]}>Send Message</Text>
              }
            </View>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontWeight: '700', color: '#111827' },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 },
  intro:        { color: '#6B7280', lineHeight: 20, marginBottom: 24 },
  field:        { marginBottom: 16 },
  label:        { fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:        { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#111827', backgroundColor: '#FAFAFA' },
  textarea:     { height: 120, paddingTop: 12 },
  submitBtn:        { backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled:{ backgroundColor: '#E5E7EB' },
  submitBtnText:    { color: '#fff', fontWeight: '700' },
});
