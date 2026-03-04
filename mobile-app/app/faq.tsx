import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';

interface FAQ {
  question: string;
  answer: string;
}

const FALLBACK_FAQS: FAQ[] = [
  { question: 'How do I place an order?', answer: 'Browse our products, add items to your cart, and proceed to checkout. You will need an account to complete your purchase.' },
  { question: 'What payment methods do you accept?', answer: 'We accept major credit and debit cards through our secure Stripe payment gateway.' },
  { question: 'How long does delivery take?', answer: 'Standard delivery typically takes 3–5 working days. You will receive a tracking number once your order is dispatched.' },
  { question: 'Can I return or exchange a product?', answer: 'Yes, we offer a 14-day return policy. Please contact our Help Center to initiate a return.' },
  { question: 'How do I track my order?', answer: 'Once your order is shipped, you can find the tracking number in your Order Details screen inside the app.' },
  { question: 'Is my payment information secure?', answer: 'Absolutely. We use Stripe for payment processing. We never store your card details on our servers.' },
];

function useFAQs() {
  return useQuery<FAQ[]>({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.SETTINGS.GET);
      const faqContent = res.data.data?.faqContent;
      if (!faqContent) return FALLBACK_FAQS;
      // Support JSON array of { question, answer } objects OR plain text
      if (typeof faqContent === 'string') {
        try {
          const parsed = JSON.parse(faqContent);
          if (Array.isArray(parsed)) return parsed as FAQ[];
        } catch {}
      } else if (Array.isArray(faqContent)) {
        return faqContent as FAQ[];
      }
      return FALLBACK_FAQS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function FAQScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { data: faqs = FALLBACK_FAQS, isLoading } = useFAQs();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((prev) => (prev === i ? null : i));
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
        <Text style={[s.headerTitle, { fontSize: Math.round(20 * scale) }]}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          faqs.map((faq, i) => (
            <View key={i} style={s.card}>
              <Pressable style={s.questionRow} onPress={() => toggle(i)}>
                <Text style={[s.question, { fontSize: Math.round(14 * scale) }]}>{faq.question}</Text>
                <Ionicons
                  name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.brand}
                  style={{ marginLeft: 8, flexShrink: 0 }}
                />
              </Pressable>
              {openIndex === i && (
                <Text style={[s.answer, { fontSize: Math.round(14 * scale) }]}>{faq.answer}</Text>
              )}
            </View>
          ))
        )}

        {/* Help prompt */}
        <View style={s.helpCard}>
          <Text style={[s.helpTitle, { fontSize: Math.round(14 * scale) }]}>Still have questions?</Text>
          <Text style={[s.helpBody, { fontSize: Math.round(13 * scale) }]}>
            Contact our team and we'll be happy to help.
          </Text>
          <Pressable style={s.helpBtn} onPress={() => router.push('/contact' as any)}>
            {({ pressed }) => (
              <Text style={[s.helpBtnText, { fontSize: Math.round(14 * scale) }, { opacity: pressed ? 0.7 : 1 }]}>
                Go to Help Center
              </Text>
            )}
          </Pressable>
        </View>

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
  scrollContent:{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  center:       { paddingVertical: 60, alignItems: 'center' },
  card:         { marginBottom: 10, borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  questionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  question:     { flex: 1, fontWeight: '600', color: '#111827', lineHeight: 20 },
  answer:       { paddingHorizontal: 16, paddingBottom: 16, color: '#4B5563', lineHeight: 21 },
  helpCard:     { marginTop: 12, backgroundColor: '#FFF0F3', borderRadius: 12, padding: 20, alignItems: 'center' },
  helpTitle:    { fontWeight: '700', color: '#111827', marginBottom: 4 },
  helpBody:     { color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  helpBtn:      { backgroundColor: colors.brand, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  helpBtnText:  { color: '#fff', fontWeight: '700' },
});
