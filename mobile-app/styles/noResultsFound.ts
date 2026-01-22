import { StyleSheet } from 'react-native';

export const noResultsFoundStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: -12,
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 24,
    tintColor: '#F43F5E',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  message: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});
