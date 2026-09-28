import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Keyboard, Easing, AppState, LogBox, Platform, PermissionsAndroid } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import QuizScreen from './QuizScreen'; // Placeholder, replace with actual screen
import LeaderboardScreen from './LeaderboardScreen'; // Placeholder, replace with actual screen
import SettingsScreen from './SettingsScreen'; // Placeholder, replace with actual screen
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_KEY = 'soundEnabled';

const CustomTab = ({ state, navigation }) => {
    const scaleAnims = state.routeNames.map(() => new Animated.Value(1));
    const opacityAnims = state.routeNames.map(() => new Animated.Value(1));

    const translateY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 100, // slide down
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0, // slide back up
                    duration: 200,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        };
    }, []);

    const animateTab = (scaleValue, opacityValue, toScale, toOpacity) => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: toScale,
                friction: 7,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
                toValue: toOpacity,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <Animated.View
            style={{
                height: 75,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: 'white',
                paddingHorizontal: 8,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                position: 'absolute',
                bottom: 0,
                width: '100%',
                transform: [{ translateY }],
                opacity: fadeAnim,
                elevation: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            }}
        >
            {state.routeNames.map((routeName, index) => {
                const isFocused = index === state.index;
                let icon;

                if (routeName === 'Quiz') icon = 'quiz';
                else if (routeName === 'Board') icon = 'leaderboard';
                else if (routeName === 'Settings') icon = 'settings';

                return (
                    <TouchableOpacity
                        key={routeName}
                        onPress={() => {
                            navigation.navigate(routeName);
                            state.routeNames.forEach((_, i) => {
                                if (i === index) {
                                    animateTab(scaleAnims[i], opacityAnims[i], 1.1, 1);
                                } else {
                                    animateTab(scaleAnims[i], opacityAnims[i], 1, 0.7);
                                }
                            });
                        }}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 13,
                            borderRadius: 25,
                            backgroundColor: isFocused ? '#8D70FF' : 'transparent',
                        }}
                    >
                        <Animated.View
                            style={{
                                transform: [{ scale: scaleAnims[index] }],
                                opacity: opacityAnims[index],
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Icon
                                name={icon}
                                color={isFocused ? 'white' : 'gray'}
                                size={28}
                            />
                            {isFocused && (
                                <Text
                                    style={{
                                        marginLeft: 6,
                                        fontSize: 16,
                                        color: 'white',
                                        fontWeight: '700',
                                    }}
                                >
                                    {routeName}
                                </Text>
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </Animated.View>
    );
};

const User = () => {
    const bottomTab = createBottomTabNavigator();

    const [soundEnabled, setSoundEnabled] = useState(false);
    const soundRef = useRef(null);
    const appState = useRef(AppState.currentState);

    // Suppress sound loading warning (optional)
    useEffect(() => {
        LogBox.ignoreLogs(['new Sound']);
    }, []);

    // Load toggle state on launch
    useEffect(() => {
        const loadToggle = async () => {
            const value = await AsyncStorage.getItem(SOUND_KEY);
            if (value !== null) {
                setSoundEnabled(JSON.parse(value));
            }
        };
        loadToggle();
    }, []);

    // Initialize sound engine
    useEffect(() => {
        Sound.setCategory('Playback');

        if (soundEnabled) {
            playSoundLoop();
        }

        return () => {
            stopSound();
        };
    }, [soundEnabled]);

    // Handle app foreground/background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                stopSound();
            } else if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                soundEnabled
            ) {
                playSoundLoop();
            }
            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [soundEnabled]);

    const playSoundLoop = () => {
        if (soundRef.current) return; // prevent multiple instances

        const sound = new Sound(require('../assets/background.mp3'), (error) => {
            if (error) {
                console.log('Sound load error', error);
                return;
            }
            sound.setNumberOfLoops(-1);
            sound.play(success => {
                if (!success) console.log('Playback error');
            });
        });

        soundRef.current = sound;
    };

    const stopSound = () => {
        if (soundRef.current) {
            soundRef.current.stop(() => {
                soundRef.current.release();
                soundRef.current = null;
            });
        }
    };


    return (
        <bottomTab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTab {...props} />}
        >
            <bottomTab.Screen name="Quiz" component={QuizScreen} />
            <bottomTab.Screen name="Board" component={LeaderboardScreen} />
            <bottomTab.Screen
                name="Settings"
                children={() => (
                    <SettingsScreen
                        soundEnabled={soundEnabled}
                        setSoundEnabled={async (val) => {
                            try {
                                setSoundEnabled(val);
                                if (val) {
                                    await AsyncStorage.setItem(SOUND_KEY, JSON.stringify(val));
                                } else {
                                    await AsyncStorage.removeItem(SOUND_KEY);
                                }
                            } catch (error) {
                                console.error('Error saving sound toggle:', error);
                            }
                        }}
                    />
                )}
            />
        </bottomTab.Navigator>
    );
};

export default User;