import { StyleSheet } from 'react-native';

export const emptyNotificationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bellContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  bellIcon: {
    width: 80,
    height: 80,
    tintColor: '#F43F5E',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#171717',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  emptySubtitle: {
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
});
