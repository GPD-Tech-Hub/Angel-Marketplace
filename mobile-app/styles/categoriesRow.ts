import { StyleSheet } from 'react-native';

export const categoriesRowStyles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  viewAllWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  scrollContent: {
    paddingRight: 8,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    alignItems: 'center',
    width: 68,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 15,
  },
});
