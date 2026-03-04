import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';

interface SiteSettings {
  siteName?: string;
  siteEmail?: string;
  sitePhone?: string;
  siteAddress?: string;
  aboutUs?: string;
}

function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.SETTINGS.GET);
      return res.data.data as SiteSettings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

const FALLBACK_ABOUT = `Angel Marketplace is a curated online destination for quality products delivered with care.

We believe shopping should be simple, trustworthy, and enjoyable. Our team works hard to source products you'll love and to deliver them safely to your door.

If you have any questions, please reach out through our Help Center.`;

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { data: settings, isLoading } = useSettings();

  const aboutText = settings?.aboutUs || FALLBACK_ABOUT;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
          )}
        </Pressable>
        <Text style={[s.headerTitle, { fontSize: Math.round(20 * scale) }]}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          <>
            {/* Brand mark */}
            <View style={s.brandMark}>
              <Text style={[s.brandName, { fontSize: Math.round(28 * scale) }]}>
                {settings?.siteName || 'Angel Marketplace'}
              </Text>
              <View style={s.brandLine} />
            </View>

            <Text style={[s.body, { fontSize: Math.round(15 * scale) }]}>{aboutText}</Text>

            {/* Contact info */}
            {(settings?.siteEmail || settings?.sitePhone || settings?.siteAddress) && (
              <View style={s.contactCard}>
                <Text style={[s.contactTitle, { fontSize: Math.round(14 * scale) }]}>Get in Touch</Text>
                {settings?.siteEmail && (
                  <View style={s.contactRow}>
                    <Ionicons name="mail-outline" size={16} color={colors.brand} />
                    <Text style={[s.contactText, { fontSize: Math.round(13 * scale) }]}>{settings.siteEmail}</Text>
                  </View>
                )}
                {settings?.sitePhone && (
                  <View style={s.contactRow}>
                    <Ionicons name="call-outline" size={16} color={colors.brand} />
                    <Text style={[s.contactText, { fontSize: Math.round(13 * scale) }]}>{settings.sitePhone}</Text>
                  </View>
                )}
                {settings?.siteAddress && (
                  <View style={s.contactRow}>
                    <Ionicons name="location-outline" size={16} color={colors.brand} />
                    <Text style={[s.contactText, { fontSize: Math.round(13 * scale) }]}>{settings.siteAddress}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
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
  scrollContent:{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  brandMark:    { alignItems: 'center', marginBottom: 28 },
  brandName:    { fontWeight: '800', color: colors.brand, textAlign: 'center' },
  brandLine:    { width: 40, height: 3, backgroundColor: colors.brand, borderRadius: 2, marginTop: 8 },
  body:         { color: '#374151', lineHeight: 24, marginBottom: 24 },
  contactCard:  { backgroundColor: '#FFF0F3', borderRadius: 12, padding: 16, gap: 10 },
  contactTitle: { fontWeight: '700', color: '#111827', marginBottom: 4 },
  contactRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText:  { color: '#374151', flex: 1 },
});
