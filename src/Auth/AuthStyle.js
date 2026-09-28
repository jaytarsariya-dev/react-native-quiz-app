import { StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop:StatusBar.currentHeight
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom:10,
    paddingHorizontal: width * 0.06,

  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Roboto-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 28,
    fontFamily: 'Roboto-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Roboto-Regular',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#1F2937',
    fontFamily: 'Roboto-Regular',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    // marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    // backgroundColor:'#FF9500'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    height: 24,
    width: 24,
    marginRight: 10,
  },
  googleText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Regular',
  },
  link: {
    color: '#F3F4F6',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  linkBold: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  questionText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Roboto-Regular',
    marginBottom: 4,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 6,
    width: (width - width * 0.12 - 7) / 2, // Two cards per row with spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    height: 200
  },
  categoryImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryTextContainer: {
    padding: 12,
    alignItems: 'center',
  },
  categoryCardText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Roboto-Regular',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#F3F4F6',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Roboto-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});