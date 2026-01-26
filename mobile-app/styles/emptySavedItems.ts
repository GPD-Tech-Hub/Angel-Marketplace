import { StyleSheet } from 'react-native';

export const emptySavedItemsStyles = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
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
