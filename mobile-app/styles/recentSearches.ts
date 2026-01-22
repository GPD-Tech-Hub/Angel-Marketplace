import { StyleSheet } from 'react-native';

export const recentSearchesStyles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  clearAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F43F5E',
  },
  list: {
    paddingHorizontal: 20,
  },
  itemWrapper: {
    width: '100%',
  },
  item: {
    paddingVertical: 12,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  searchText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
});
