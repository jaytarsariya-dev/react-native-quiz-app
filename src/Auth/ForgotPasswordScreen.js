import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const resetPassword = async () => {
    if (!email.trim()) {
      Snackbar.show({
        text: 'Please enter your email address!',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#fe6c6a',
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'Ok',
          textColor: '#fff',
          onPress: () => console.log('Retry pressed'),
        },
      });
      return;
    }

    const emailRegex = /^(?!\.)(?!.*\.\.)(?!.*\.\_)(?!.*__)([a-z0-9]+(?:[\._][a-zA-Z0-9]+)*)@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Snackbar.show({
        text: 'Enter a valid email address',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#fe6c6a',
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'Ok',
          textColor: '#fff',
          onPress: () => console.log('Retry pressed'),
        },
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Snackbar.show({
        text: 'Password reset email sent! Check your inbox.',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#10B981',
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('Login'),
        },
      });
      setEmail('');
      navigation.replace('Login')
    } catch (error) {
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#fe6c6a',
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'Ok',
          textColor: '#fff',
          onPress: () => console.log('Retry pressed'),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6B48FF', '#D1C9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.headerSubtitle}>Enter your email to receive a reset link</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={width * 0.05} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity onPress={resetPassword} disabled={loading}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetButton}
              >
                {loading ? (
                  <ActivityIndicator size={width * 0.06} color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.signInContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
            <Text style={styles.signInText}>
              Back to{' '}
              <Text style={styles.signInLink} onPress={() => navigation.replace('Login')}>
                Sign In
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.35,
    paddingHorizontal: width * 0.05,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  headerTitle: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.01,
  },
  headerSubtitle: {
    fontSize: width * 0.04,
    color: '#d1d5db',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: height * 0.02,
  },
  icon: {
    marginLeft: width * 0.03,
  },
  input: {
    flex: 1,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.045,
    color: '#1f2937',
  },
  resetButton: {
    paddingVertical: height * 0.02,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  signInContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  signInText: {
    fontSize: width * 0.04,
    color: '#fff',
  },
  signInLink: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;