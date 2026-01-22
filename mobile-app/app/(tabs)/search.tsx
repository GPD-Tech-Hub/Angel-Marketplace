import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { RecentSearches, NoResultsFound } from '@/components/search';
import { searchScreenStyles as styles } from '@/styles/searchScreen';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Shirts',
    'Gift',
    'Jacket',
    'Gown',
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Perform actual search
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches([searchQuery.trim(), ...recentSearches].slice(0, 10));
      }
      // TODO: Perform search and show results
    }
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const handleRemoveSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== search));
  };

  const handleSearchPress = (search: string) => {
    setSearchQuery(search);
    handleSearchSubmit();
  };

  // Show no results if there's a search query but no results
  const showNoResults = searchQuery.trim().length > 0;
  // Show recent searches if no search query or empty results
  const showRecentSearches = !showNoResults && recentSearches.length > 0;

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          onFilterPress={() => {
            // TODO: Open filters
          }}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={
          showNoResults
            ? styles.scrollContentCentered
            : styles.scrollContentNormal
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showNoResults ? (
          <NoResultsFound searchQuery={searchQuery} />
        ) : showRecentSearches ? (
          <RecentSearches
            searches={recentSearches}
            onSearchPress={handleSearchPress}
            onClearAll={handleClearAll}
            onRemoveSearch={handleRemoveSearch}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
