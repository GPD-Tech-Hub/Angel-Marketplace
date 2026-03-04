import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';
import { colors } from '@/constants/colors';

async function subscribe(email: string) {
  await api.post(ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email });
}

export function NewsletterCard() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const mutation = useMutation({
    mutationFn: () => subscribe(email.trim()),
    onSuccess: () => {
      setSubscribed(true);
      setEmail('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not subscribe. Please try again.');
    },
  });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  if (subscribed) {
    return (
      <View style={s.card}>
        <Ionicons name="checkmark-circle" size={28} color={colors.brand} />
        <Text style={s.successTitle}>You're subscribed!</Text>
        <Text style={s.successBody}>Thanks for signing up. Watch your inbox for exclusive deals.</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <Text style={s.title}>Stay in the Loop</Text>
      <Text style={s.body}>Subscribe for exclusive deals and new arrivals.</Text>
      <View style={s.row}>
        <TextInput
          style={s.input}
          placeholder="your@email.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={() => { if (isValidEmail) mutation.mutate(); }}
        />
        <Pressable
          style={[s.btn, !isValidEmail && s.btnDisabled]}
          onPress={() => mutation.mutate()}
          disabled={!isValidEmail || mutation.isPending}
        >
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.8 : 1 }}>
              {mutation.isPending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="arrow-forward" size={18} color="#fff" />
              }
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card:         { backgroundColor: '#FFF0F3', borderRadius: 16, padding: 20, marginVertical: 16, alignItems: 'center' },
  title:        { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  body:         { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  row:          { flexDirection: 'row', width: '100%', gap: 8 },
  input:        { flex: 1, borderWidth: 1.5, borderColor: '#FECDD3', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', fontSize: 14, color: '#111827' },
  btn:          { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  btnDisabled:  { backgroundColor: '#E5E7EB' },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 10 },
  successBody:  { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 },
});
