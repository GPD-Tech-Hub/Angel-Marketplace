import { Link, Stack, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function toQueryString(params: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => search.append(key, entry));
    } else {
      search.set(key, value);
    }
  }

  return search.toString();
}

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const normalizedPath = useMemo(() => (pathname ?? '').replace(/^\/+/, ''), [pathname]);
  const queryString = useMemo(
    () => toQueryString(params as Record<string, string | string[] | undefined>),
    [params]
  );

  useEffect(() => {
    const isKingsChatCallbackPath =
      normalizedPath === 'auth/kingschat/callback' ||
      normalizedPath.endsWith('/auth/kingschat/callback');

    if (isKingsChatCallbackPath) {
      const target = queryString ? `/kingschat-callback?${queryString}` : '/kingschat-callback';
      router.replace(target as any);
    }
  }, [normalizedPath, queryString, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.title}>This page does not exist.</Text>
        <Link href="/" style={styles.link}>
          Go to home screen
        </Link>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  title: {
    fontSize: 16,
    color: '#111827',
  },
  link: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
});
