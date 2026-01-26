import { StyleSheet } from 'react-native';

export const emptyOrdersStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
