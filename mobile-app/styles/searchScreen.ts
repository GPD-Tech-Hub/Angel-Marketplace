import { StyleSheet } from 'react-native';

export const searchScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '600',
    color: '#171717',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  content: {
    flex: 1,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 0,
  },
  scrollContentNormal: {
    flexGrow: 1,
  },
});
