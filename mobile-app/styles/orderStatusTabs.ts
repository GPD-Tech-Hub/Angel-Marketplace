import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export const orderStatusTabsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 16,
  },
  tabContainer: {
    flex: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.brand,
  },
});
