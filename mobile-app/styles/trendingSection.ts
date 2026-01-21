import { StyleSheet } from 'react-native';

export const trendingSectionStyles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  viewAllWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: '#737373',
    marginRight: 6,
    fontWeight: '500',
  },
  viewAllIcon: {
    width: 16,
    height: 16,
  },
  gridRowGap: {
    marginBottom: 12,
  },
});

