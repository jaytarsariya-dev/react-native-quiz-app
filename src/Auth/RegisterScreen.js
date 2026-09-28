import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, getFirestore, setDoc } from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar'; // Import Snackbar
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // Animation values
  const headerOpacity = useState(new Animated.Value(0))[0];
  const headerTranslateY = useState(new Animated.Value(20))[0];
  const nameOpacity = useState(new Animated.Value(0))[0];
  const nameTranslateY = useState(new Animated.Value(20))[0];
  const emailOpacity = useState(new Animated.Value(0))[0];
  const emailTranslateY = useState(new Animated.Value(20))[0];
  const passwordOpacity = useState(new Animated.Value(0))[0];
  const passwordTranslateY = useState(new Animated.Value(20))[0];
  const confirmPasswordOpacity = useState(new Animated.Value(0))[0];
  const confirmPasswordTranslateY = useState(new Animated.Value(20))[0];
  const signUpOpacity = useState(new Animated.Value(0))[0];
  const signUpTranslateY = useState(new Animated.Value(20))[0];
  const dividerOpacity = useState(new Animated.Value(0))[0];
  const dividerTranslateY = useState(new Animated.Value(20))[0];
  const googleOpacity = useState(new Animated.Value(0))[0];
  const googleTranslateY = useState(new Animated.Value(20))[0];
  const signInOpacity = useState(new Animated.Value(0))[0];
  const signInTranslateY = useState(new Animated.Value(20))[0];

  const profilePicUrls = [
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/sew7fgpqcdqddg35i4lq.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/wpamlfo22wd0pokjzqbj.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/sazzzuf3jscaeieibx8i.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/nf108xztpvtjodbt6nu4.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/umbhdwz9b98agienhozf.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007380/qsuguf44lgyzn678d30d.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/cgqlqcbazn1c7v7ouxju.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/whe4crqzspukt15dwcrc.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007378/kiswpssiwxdw0m1fedeg.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007378/fghtyhvp2autazvdfncs.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007379/yjui2iqex4zq5rh0tj93.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007378/sqzqjjhx2ja82jsaj01w.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007377/kimc47hulmfuyjnabipg.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007377/xxrdofsc81oucojq5hdu.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007377/jt322hj68nmouufajtsg.png",
    "https://res.cloudinary.com/dqpm9nx2h/image/upload/v1748007377/zibymxydpugxadxs4z4o.png"
  ];

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '834954623199-11llvmqomleiqieghh4u1csemb0ok74c.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // Animation effect
  useEffect(() => {
    const animations = [
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nameOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nameTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emailOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emailTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(passwordTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmPasswordOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(confirmPasswordTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(signUpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(signUpTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dividerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dividerTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(googleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(googleTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(signInOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(signInTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(80, animations).start();
  }, [
    headerOpacity,
    headerTranslateY,
    nameOpacity,
    nameTranslateY,
    emailOpacity,
    emailTranslateY,
    passwordOpacity,
    passwordTranslateY,
    confirmPasswordOpacity,
    confirmPasswordTranslateY,
    signUpOpacity,
    signUpTranslateY,
    dividerOpacity,
    dividerTranslateY,
    googleOpacity,
    googleTranslateY,
    signInOpacity,
    signInTranslateY,
  ]);

  const register = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Snackbar.show({
        text: 'All fields are required!',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#fe6c6a', // Red for error
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('OK pressed'),
        },
      });
      return;
    }

    if (!/^(?!\.)(?!.\.\.)(?!.*\.\_)(?!.*__)([a-z0-9]+(?:[\._][a-zA-Z0-9]+)*)@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(email)) {
      Snackbar.show({
        text: 'Enter a valid email address',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#fe6c6a', // Red for error
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('OK pressed'),
        },
      });
      return;
    }

    if (password !== confirmPassword) {
      Snackbar.show({
        text: 'Passwords do not match!',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#fe6c6a', // Red for error
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('OK pressed'),
        },
      });
      return;
    }

    if (password.length < 6) {
      Snackbar.show({
        text: 'Password must be at least 6 characters',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#fe6c6a', // Red for error
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('OK pressed'),
        },
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        profilePic: profilePicUrls[Math.floor(Math.random() * profilePicUrls.length)]
      });

      await user.sendEmailVerification();
      Snackbar.show({
        text: 'Registration successful! Verify your email before logging in.',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#10B981', // Green for success
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('Login'), // Navigate on OK
        },
      });

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      navigation.replace('Login'),
        await auth.signOut(); // Sign out to require email verification
      // Navigation moved to Snackbar action for better UX
    } catch (error) {
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#fe6c6a', // Red for error
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

  const handleGoogleSignUp = async () => {
    setLoading1(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userData = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(userData.data.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);

      // Check if the document already exists
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists) {
        // Only create the document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePic: profilePicUrls[Math.floor(Math.random() * profilePicUrls.length)],
        });
      }
      await AsyncStorage.setItem('IsLogin', 'true');
      await AsyncStorage.setItem('LoginRole', 'user');

      Snackbar.show({
        text: 'Sign-up with Google successful',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#10B981', // Green for success
        textColor: '#fff',
        fontWeight: '500',
        action: {
          text: 'OK',
          textColor: '#fff',
          onPress: () => console.log('OK pressed'),
        },
      });
      navigation.replace('User');
      console.log('Google user data:', userData);
    } catch (error) {
      // Snackbar.show({
      //   text: error.message,
      //   duration: Snackbar.LENGTH_LONG,
      //   backgroundColor: '#fe6c6a', // Red for error
      //   textColor: '#fff',
      //   fontWeight: '500',
      //   action: {
      //     text: 'OK',
      //     textColor: '#fff',
      //     onPress: () => console.log('Retry pressed'),
      //   },
      // });
      console.log('Error', error.message);
    } finally {
      setLoading1(false);
    }
  };

  const handleSignIn = () => {
    navigation.replace('Login');
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
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Text style={styles.headerTitle}>Create an Account</Text>
            <Text style={styles.headerSubtitle}>Join us today and get started</Text>
            <Text style={styles.signUpTitle}>Sign up</Text>
          </Animated.View>

          <View style={styles.formContainer}>
            {/* Name Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  opacity: nameOpacity,
                  transform: [{ translateY: nameTranslateY }],
                },
              ]}
            >
              <MaterialIcons name="person" size={width * 0.05} color="#6b7280" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </Animated.View>

            {/* Email Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  opacity: emailOpacity,
                  transform: [{ translateY: emailTranslateY }],
                },
              ]}
            >
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
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  opacity: passwordOpacity,
                  transform: [{ translateY: passwordTranslateY }],
                },
              ]}
            >
              <MaterialIcons name="lock" size={width * 0.05} color="#6b7280" style={styles.icon} />
              <TextInput
                style={[styles.input, { paddingRight: width * 0.1 }]}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={width * 0.05}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  opacity: confirmPasswordOpacity,
                  transform: [{ translateY: confirmPasswordTranslateY }],
                },
              ]}
            >
              <MaterialIcons name="lock" size={width * 0.05} color="#6b7280" style={styles.icon} />
              <TextInput
                style={[styles.input, { paddingRight: width * 0.1 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={width * 0.05}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Sign Up Button */}
            <Animated.View
              style={[
                {
                  opacity: signUpOpacity,
                  transform: [{ translateY: signUpTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={register} disabled={loading}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpButton}
                >
                  {loading ? (
                    <ActivityIndicator size={width * 0.06} color="#fff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* OR Divider */}
            <Animated.View
              style={[
                styles.dividerContainer,
                {
                  opacity: dividerOpacity,
                  transform: [{ translateY: dividerTranslateY }],
                },
              ]}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Google Sign Up Button */}
            <Animated.View
              style={[
                {
                  opacity: googleOpacity,
                  transform: [{ translateY: googleTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleGoogleSignUp} disabled={loading1}>
                <View style={styles.googleButton}>
                  {loading1 ? (
                    <ActivityIndicator size={width * 0.06} color="#000" />
                  ) : (
                    <View style={styles.googleButtonContent}>
                      <Image
                        source={require('../assets/google.png')}
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Sign In Link */}
          <Animated.View
            style={[
              styles.signInContainer,
              {
                opacity: signInOpacity,
                transform: [{ translateY: signInTranslateY }],
              },
            ]}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink} onPress={handleSignIn}>
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
    paddingTop: StatusBar.currentHeight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.05,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  headerTitle: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.01,
  },
  headerSubtitle: {
    fontSize: width * 0.04,
    color: '#d1d5db',
    marginBottom: height * 0.03,
  },
  signUpTitle: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#fff',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  eyeIcon: {
    position: 'absolute',
    right: width * 0.03,
    padding: width * 0.02,
  },
  signUpButton: {
    paddingVertical: height * 0.02,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.03,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
  },
  dividerText: {
    color: '#fff',
    fontSize: width * 0.04,
    paddingHorizontal: width * 0.02,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: height * 0.02,
    borderRadius: 8,
    marginBottom: height * 0.1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: width * 0.05,
    height: width * 0.05,
    marginRight: width * 0.02,
  },
  googleButtonText: {
    fontSize: width * 0.045,
    color: '#1f2937',
    fontWeight: '500',
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

export default RegisterScreen;