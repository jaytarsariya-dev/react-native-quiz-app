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
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, getDoc, getFirestore, setDoc } from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar'; // Import Snackbar
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading3, setLoading3] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  // Animation values
  const headerOpacity = useState(new Animated.Value(0))[0];
  const headerTranslateY = useState(new Animated.Value(20))[0];
  const emailOpacity = useState(new Animated.Value(0))[0];
  const emailTranslateY = useState(new Animated.Value(20))[0];
  const passwordOpacity = useState(new Animated.Value(0))[0];
  const passwordTranslateY = useState(new Animated.Value(20))[0];
  const forgotOpacity = useState(new Animated.Value(0))[0];
  const forgotTranslateY = useState(new Animated.Value(20))[0];
  const signInOpacity = useState(new Animated.Value(0))[0];
  const signInTranslateY = useState(new Animated.Value(20))[0];
  const dividerOpacity = useState(new Animated.Value(0))[0];
  const dividerTranslateY = useState(new Animated.Value(20))[0];
  const googleOpacity = useState(new Animated.Value(0))[0];
  const googleTranslateY = useState(new Animated.Value(20))[0];
  const signUpOpacity = useState(new Animated.Value(0))[0];
  const signUpTranslateY = useState(new Animated.Value(20))[0];

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
      // TODO: Replace with your actual Google Web Client ID
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
      offlineAccess: true,
    });
  }, []);

  // Handle auth state changes (commented out, but updated with Snackbar)
  // useEffect(() => {
  //   const checkWelcomeAndAuth = async () => {
  //     try {
  //       const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");

  //       if (!hasSeenWelcome) {
  //         navigation.replace("WelcomeScreen");
  //         return;
  //       }

  //       // Otherwise, check Firebase Auth state
  //       const unsubscribe = auth.onAuthStateChanged((user) => {
  //         if (user) {
  //           const providerData = user.providerData[0];
  //           const providerId = providerData?.providerId;

  //           if (providerId === "google.com") {
  //             console.log("Logged in with Google:", user);
  //             navigation.replace("User");
  //           } else if (providerId === "password") {
  //             if (user.emailVerified) {
  //               console.log("Logged in with email/password:", user);
  //               navigation.replace("User");
  //             } else {
  //               console.log("Email not verified");
  //               // Alert.alert(
  //               //   "Email Not Verified",
  //               //   "Please verify your email before logging in."
  //               // );
  //               // auth.signOut();
  //               navigation.replace("Login");
  //             }
  //           } else {
  //             navigation.replace("Login");
  //           }
  //         } else {
  //           navigation.replace("Login");
  //         }
  //       });

  //       return unsubscribe; // Cleanup listener
  //     } catch (error) {
  //       console.error("Error checking welcome/auth:", error);
  //       navigation.replace("Login"); // fallback
  //     }
  //   };

  //   checkWelcomeAndAuth();
  // }, []);

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
      Animated.timing(forgotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(forgotTranslateY, {
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
    ];

    Animated.stagger(80, animations).start();
  }, [
    headerOpacity,
    headerTranslateY,
    emailOpacity,
    emailTranslateY,
    passwordOpacity,
    passwordTranslateY,
    forgotOpacity,
    forgotTranslateY,
    signInOpacity,
    signInTranslateY,
    dividerOpacity,
    dividerTranslateY,
    googleOpacity,
    googleTranslateY,
    signUpOpacity,
    signUpTranslateY,
  ]);

  const login = async () => {
    if (!email.trim() || !password) {
      Snackbar.show({
        text: 'Please enter both email and password!',
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

    // TODO: In a production app, do NOT hardcode admin credentials.
    // Implement role-based access control (e.g., Firebase Custom Claims or a Firestore 'admins' collection).
    // For now, this uses placeholder configuration values that must be set securely.
    if (email === 'YOUR_ADMIN_EMAIL' && password === 'YOUR_ADMIN_PASSWORD') {

      await AsyncStorage.setItem('IsLogin', 'true');
      await AsyncStorage.setItem('LoginRole', 'admin');

      navigation.replace('QuestionListScreen');
      Snackbar.show({
        text: 'Admin Login Successful',
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
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.emailVerified) {

        await AsyncStorage.setItem('IsLogin', 'true');
        await AsyncStorage.setItem('LoginRole', 'user');

        // Snackbar.show({
        //   text: 'Login Successful',
        //   duration: Snackbar.LENGTH_SHORT,
        //   backgroundColor: '#10B981', // Green for success
        //   textColor: '#fff',
        //   fontWeight: '500',
        //   action: {
        //     text: 'OK',
        //     textColor: '#fff',
        //     onPress: () => console.log('OK pressed'),
        //   },
        // });
        navigation.replace('User');
      } else {
        Snackbar.show({
          text: 'Please verify your email before logging in.',
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: '#fe6c6a', // Red for error
          textColor: '#fff',
          fontWeight: '500',
          action: {
            text: 'OK',
            textColor: '#fff',
            onPress: () => console.log('OK pressed'),
          },
        });
        await auth.signOut();
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      Snackbar.show({
        text: 'Plaese enter valid data for Login',
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

  const handleGoogleLogin = async () => {
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

      // Snackbar.show({
      //   text: 'Login with Google Successful',
      //   duration: Snackbar.LENGTH_SHORT,
      //   backgroundColor: '#10B981', // Green for success
      //   textColor: '#fff',
      //   fontWeight: '500',
      //   action: {
      //     text: 'OK',
      //     textColor: '#fff',
      //     onPress: () => console.log('OK pressed'),
      //   },
      // });
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
      //     text: 'Ok',
      //     textColor: '#fff',
      //     onPress: () => console.log('Retry pressed'),
      //   },
      // });
      console.log('Error', error.message);
    } finally {
      setLoading1(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.replace('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.replace('Register');
  };

  //  if (loading3) {
  //     return (
  //       <LinearGradient colors={['#6B48FF', '#D1C9FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
  //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
  //           <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 20, paddingHorizontal: 50 }}>
  //             <ActivityIndicator size={'large'} color={'orange'}></ActivityIndicator>
  //             <Text style={{ color: 'black', marginTop: 10 }}>Loading...</Text>
  //           </View>
  //         </View>
  //       </LinearGradient>
  //     )
  //   }

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
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Please sign in to your account</Text>
            <Text style={styles.signInTitle}>Sign in</Text>
          </Animated.View>

          <View style={styles.formContainer}>
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
                placeholder="Enter your email"
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
                { marginBottom: height * 0.03 },
                {
                  opacity: passwordOpacity,
                  transform: [{ translateY: passwordTranslateY }],
                },
              ]}
            >
              <MaterialIcons name="lock" size={width * 0.05} color="#6b7280" style={styles.icon} />
              <TextInput
                style={[styles.input, { paddingRight: width * 0.1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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

            {/* Forgot Password */}
            <Animated.View
              style={[
                styles.forgotPasswordContainer,
                {
                  opacity: forgotOpacity,
                  transform: [{ translateY: forgotTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Sign In Button */}
            <Animated.View
              style={[
                {
                  opacity: signInOpacity,
                  transform: [{ translateY: signInTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={login} disabled={loading}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInButton}
                >
                  {loading ? (
                    <ActivityIndicator size={width * 0.06} color="#fff" />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign in</Text>
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

            {/* Google Sign In Button */}
            <Animated.View
              style={[
                {
                  opacity: googleOpacity,
                  transform: [{ translateY: googleTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleGoogleLogin} disabled={loading1}>
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

          {/* Sign Up Link */}
          <Animated.View
            style={[
              styles.signUpContainer,
              {
                opacity: signUpOpacity,
                transform: [{ translateY: signUpTranslateY }],
              },
            ]}
          >
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text style={styles.signUpLink} onPress={handleSignUp}>
                Sign Up
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
    paddingTop: height * 0.1,
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
    marginBottom: height * 0.05,
  },
  signInTitle: {
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: height * 0.03,
  },
  forgotPasswordText: {
    fontSize: width * 0.04,
    color: '#fff',
    fontWeight: '500',
  },
  signInButton: {
    paddingVertical: height * 0.02,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
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
    backgroundColor: 'white',
  },
  dividerText: {
    color: 'white',
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
    marginBottom: height * 0.03,
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
  signUpContainer: {
    alignItems: 'center',
    marginTop: height * 0.13,
  },
  signUpText: {
    fontSize: width * 0.04,
    color: 'white',
  },
  signUpLink: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LoginScreen;