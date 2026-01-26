import { StyleSheet } from 'react-native';

export const orderStatusTabsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  tabContainer: {
    flex: 1,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  tabText: {
    fontWeight: '500',
    color: '#111827',
  },
  tabTextActive: {
    fontWeight: '600',
  },
});
