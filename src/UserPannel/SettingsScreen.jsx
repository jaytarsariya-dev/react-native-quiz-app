import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Switch,
  Linking,
  Animated,
  Modal,
  FlatList,
  SafeAreaView,
  Keyboard,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { doc, getFirestore, onSnapshot, updateDoc, query, collection, where, getDocs } from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { openSettings, request } from 'react-native-permissions';
import { checkPermission } from 'react-native-schedule-exact-alarm-permission';

const SOUND_KEY = 'soundEnabled';

const SettingsScreen = ({ soundEnabled, setSoundEnabled }) => {
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;
  const db = getFirestore();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(null);
  // const [soundEnabled, setSoundEnabled] = useState(false);
  const [scaleAnimProfile] = useState(new Animated.Value(1));
  const [scaleAnimSave] = useState(new Animated.Value(1));
  const [scaleAnimLogout] = useState(new Animated.Value(1));
  const [scaleAnimPrivacy] = useState(new Animated.Value(1));
  const [loading2, setLoading2] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const soundRef = useRef(null);

  const messages = [
    'Take today’s quiz and win coins!',
    'Don’t miss your quiz session!',
    'Ready for your next quiz challenge?',
    'Time to boost your knowledge!',
    'Sharpen your mind with today’s quiz!',
    'Another quiz, another chance to win!',
    'Knowledge is power – earn yours now!',
    'Your daily dose of trivia is waiting!',
    'Can you beat your last score?',
    'Time to flex those brain muscles!',
    'A new quiz challenge just dropped!',
    'Grow smarter, one quiz at a time!',
    'Think fast, score big!',
    'Log in now and claim your reward!',
  ];

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
  ];

  const initializeNotifications = () => {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        // notification.finish(PushNotificationIOS?.FetchResult?.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: false, // Handle permissions manually
    });

    PushNotification.createChannel(
      {
        channelId: 'quiz-app-channel',
        channelName: 'Quiz App Notifications',
        channelDescription: 'Notifications for the Quiz App',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  };

  const scheduleNotification = async () => {
    try {
      const index = parseInt(await AsyncStorage.getItem('notifIndex')) || 0;
      const message = messages[index % messages.length];

      PushNotification.localNotificationSchedule({
        channelId: 'quiz-app-channel',
        message: message,
        date: new Date(Date.now() + 12 * 60 * 60 * 1000),
        allowWhileIdle: true,
        repeatType: 'time',
        repeatTime: 12 * 60 * 60 * 1000,
        smallIcon: 'logo',
        largeIcon: 'logo',
      });

      await AsyncStorage.setItem('notifIndex', ((index + 1) % messages.length).toString());
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification: ' + error.message);
    }
  };

  const cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.warn('Notification permission error:', error);
      return false;
    }
  };

  const checkExactAlarmPermission = async () => {
    try {
      const isGranted = await checkPermission();
      if (!isGranted) {
        Alert.alert(
          'Permission Required',
          'Please enable alarm & reminder permission.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Go to Settings',
              onPress: async () => {
                try {
                  await openSettings('alarms');
                } catch (error) {
                  console.warn('Failed to open settings:', error);
                }
              },
            },
          ],
        );
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error checking exact alarm permission:', error);
      return false;
    }
  };


 const toggleSwitch = async (value) => {
  if (value) {
    // Enabling notifications
    setNotificationsEnabled(true);
    try {
      await AsyncStorage.setItem('notifEnabled', 'true');

      const granted = await requestNotificationPermission();
      if (!granted) {
        // Alert.alert(
        //   'Permission Required',
        //   'Do you want to grant notification permissions from settings?',
        //   [
        //     { text: 'No', style: 'cancel' },
        //     {
        //       text: 'Yes',
        //       onPress: async () => {
        //         try {
                  await openSettings('notifications');
        //         } catch (error) {
        //           Alert.alert('Error', 'Failed to open settings: ' + error.message);
        //         }
        //       },
        //       style: 'destructive',
        //     },
        //   ]
        // );
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('notifEnabled', 'false');
        return;
      }

      const exactGranted = await checkExactAlarmPermission();
      if (!exactGranted) {
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('notifEnabled', 'false');
        return;
      }

      scheduleNotification();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings: ' + error.message);
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notifEnabled', 'false');
    }
  } else {
    // Disabling notifications
    setNotificationsEnabled(false);
    try {
      await AsyncStorage.setItem('notifEnabled', 'false');
      cancelAllNotifications();
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings: ' + error.message);
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notifEnabled', 'false');
    }
  }
};


  useEffect(() => {
    initializeNotifications();
    AsyncStorage.getItem('notifEnabled').then((val) => {
      if (val === 'true') {
        setNotificationsEnabled(true);
        requestNotificationPermission().then((granted) => {
          if (!granted) {
            setNotificationsEnabled(false);
            AsyncStorage.setItem('notifEnabled', 'false');
          }
        });
      } else {
        setNotificationsEnabled(false);
      }
    });

    return () => {
      cancelAllNotifications();
    };
  }, []);


  useEffect(() => {
    if (!currentUid) {
      Alert.alert('Error', 'User not logged in.');
      navigation.replace('Login');
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUid), (docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        setUserData({
          name: data.name || '',
          email: data.email || '',
          profilePic: data.profilePic || '',
          uid: data.uid || '', // Store the uid field from the document
        });
        setName(data.name || '');
        setPhoto(data.profilePic || '');
        setTimeout(() => {
          setLoading2(false);
        }, 500);
      } else {
        console.log('No user data found in Firestore');
        Alert.alert('Error', 'User data not found.');
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
      Alert.alert('Error', 'Failed to fetch user data: ' + error.message);
    });

    return () => unsubscribe();
  }, [currentUid, navigation]);

  useEffect(() => {
    initializeNotifications();
    // Load stored toggle state on mount
    AsyncStorage.getItem('notifEnabled').then((val) => {
      if (val === 'true') {
        setNotificationsEnabled(true);
        scheduleNotification(); // Optional: ensure scheduled if already on
      }
    });
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (loading2) {
    return (
      <LinearGradient colors={['#6B48FF', '#D1C9FF']} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
          <View style={{ backgroundColor: 'white', padding: 30, borderRadius: 20, paddingHorizontal: 50 }}>
            <ActivityIndicator size={'large'} color={'orange'}></ActivityIndicator>
            <Text style={{ color: 'black', marginTop: 10 }}>Loading...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const handleLogout = async () => {
    setLoading1(true);
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
              await signOut(auth);
              await AsyncStorage.setItem('IsLogin', 'null');
              await AsyncStorage.setItem('LoginRole', 'null');
              ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
              navigation.replace('Login');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading1(false);
    }
  };

  const toggleSound = (value) => {
    if (value) {
      setSoundEnabled(true);
    }else{
      setSoundEnabled(false);
    }
  };

  const handleSave = async () => {
    if (!userData?.uid) {
      Alert.alert('Error', 'User UID not found.');
      return;
    }

    setLoading(true);
    try {
      if (!name.trim()) {
        Alert.alert('Validation Error', 'Please enter your name.');
        return;
      }

      // Query users collection to find document with matching uid field
      const usersQuery = query(collection(db, 'users'), where('uid', '==', userData.uid));
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        Alert.alert('Error', 'No user document found with matching UID.');
        return;
      }

      // Update all matching user documents
      const userUpdatePromises = usersSnapshot.docs.map(async (docSnap) => {
        await updateDoc(doc(db, 'users', docSnap.id), {
          name: name,
          profilePic: photo || 'https://via.placeholder.com/150',
        });
      });

      // Query leaderboard collection to find documents with matching uid field
      const leaderboardQuery = query(collection(db, 'leaderboard'), where('uid', '==', userData.uid));
      const leaderboardSnapshot = await getDocs(leaderboardQuery);

      // Update all matching leaderboard documents
      const leaderboardUpdatePromises = leaderboardSnapshot.docs.map(async (docSnap) => {
        await updateDoc(doc(db, 'leaderboard', docSnap.id), {
          username: name,
          photoURL: photo || 'https://via.placeholder.com/150',
        });
      });

      // Wait for all updates to complete
      await Promise.all([...userUpdatePromises, ...leaderboardUpdatePromises]);

      ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const animateButton = (scaleValue, toValue) => {
    Animated.timing(scaleValue, {
      toValue,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const selectProfilePic = (url) => {
    setPhoto(url);
    setModalVisible(false);
  };

  const renderProfilePicItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => selectProfilePic(item)}
      style={{
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: photo === item ? '#8D70FF' : 'transparent',
      }}
    >
      <Image
        source={{ uri: item }}
        style={{
          width: 90,
          height: 90,
          borderRadius: 8,
        }}
      />
    </TouchableOpacity>
  );

  const CustomSwitch = ({ value, onChange }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange(!value)}
        style={{
          width: 50,
          height: 25,
          borderRadius: 20,
          padding: 3,
          justifyContent: 'center',
          backgroundColor: value ? '#8D70FF' : '#D1D5DB',
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: value ? '#FFFFFF' : '#F3F4F6',
            transform: [{ translateX: value ? 26 : 2 }],
          }}
        />
      </TouchableOpacity>
    );
  };


  return (
    <LinearGradient colors={['#6B48FF', '#D1C9FF']} style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}></SafeAreaView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: keyboardVisible ? 0 : 75
        }}
      >
        {/* Profile Image Section */}
        <View style={{
          alignItems: 'center',
          marginBottom: 25,
        }}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            onPressIn={() => animateButton(scaleAnimProfile, 0.95)}
            onPressOut={() => animateButton(scaleAnimProfile, 1)}
          >
            <Animated.View style={{
              transform: [{ scale: scaleAnimProfile }],
              borderRadius: 70,
              borderWidth: 2,
              borderColor: 'white',
              padding: 4,
            }}>
              <Image
                source={
                  photo ? { uri: photo } : require('../assets/default.jpeg')
                }
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 60,
                }}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontFamily: 'Roboto-Medium',
            fontWeight: '500',
            marginTop: 8,
          }}>
            Change Profile Picture
          </Text>
        </View>

        {/* Modal for Profile Picture Selection */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxHeight: '80%',
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: 15,
                textAlign: 'center',
              }}>
                Select Profile Picture
              </Text>
              <FlatList
                data={profilePicUrls}
                renderItem={renderProfilePicItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Name Input */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#BFDBFE',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Text style={{
            fontSize: 14,
            color: '#374151',
            fontFamily: 'Roboto-Medium',
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Full Name
          </Text>
          <TextInput
            placeholder="Enter Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              color: '#1F2937',
              backgroundColor: '#F9FAFB',
              borderRadius: 8,
              fontSize: 16,
              fontFamily: 'Roboto-Regular',
              borderWidth: 1,
              borderColor: '#BFDBFE',
            }}
          />
        </View>

        {/* Email Input (Disabled) */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#BFDBFE',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Text style={{
            fontSize: 14,
            color: '#374151',
            fontFamily: 'Roboto-Medium',
            fontWeight: '500',
            marginBottom: 8,
          }}>
            Email Address
          </Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={userData?.email || ''}
            editable={false}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              color: '#6B7280',
              backgroundColor: '#F9FAFB',
              borderRadius: 8,
              fontSize: 16,
              fontFamily: 'Roboto-Regular',
              borderWidth: 1,
              borderColor: '#BFDBFE',
            }}
          />
        </View>

        {/* Notifications Toggle */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: '#BFDBFE',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Text style={{
            fontSize: 16,
            color: '#1F2937',
            fontFamily: 'Roboto-Medium',
            fontWeight: '500',
          }}>
            Notifications
          </Text>
          <CustomSwitch
            value={notificationsEnabled ?? false}
            onChange={toggleSwitch}
          />
        </View>

        {/* Sound Toggle */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: '#BFDBFE',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Text style={{
            fontSize: 16,
            color: '#1F2937',
            fontFamily: 'Roboto-Medium',
            fontWeight: '500',
          }}>
            Sound
          </Text>
          <CustomSwitch
            value={soundEnabled}
            onChange={toggleSound}
          />
        </View>

        {/* Privacy Policy Link */}
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/afa3f0ae-ee28-436b-82c6-c0c31477bb23')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#BFDBFE',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPressIn={() => animateButton(scaleAnimPrivacy, 0.95)}
          onPressOut={() => animateButton(scaleAnimPrivacy, 1)}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnimPrivacy }] }}>
            <Text style={{
              fontSize: 16,
              color: '#8D70FF',
              fontFamily: 'Roboto-Medium',
              fontWeight: '500',
            }}>
              Privacy Policy
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <TouchableOpacity
            onPress={handleSave}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              width: '48%',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
            disabled={loading}
            onPressIn={() => animateButton(scaleAnimSave, 0.95)}
            onPressOut={() => animateButton(scaleAnimSave, 1)}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnimSave }] }}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Roboto-Bold',
                    fontWeight: '600',
                  }}>
                    Save
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading1}
            onPress={handleLogout}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              width: '48%',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPressIn={() => animateButton(scaleAnimLogout, 0.95)}
            onPressOut={() => animateButton(scaleAnimLogout, 1)}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnimLogout }] }}>
              <LinearGradient
                colors={['#F87171', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading1 ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Roboto-Bold',
                    fontWeight: '600',
                  }}>
                    Logout
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsScreen;