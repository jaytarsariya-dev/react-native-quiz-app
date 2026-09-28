import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions,
    StatusBar,
    Animated,
    ActivityIndicator,
    ScrollView,
    ToastAndroid,
} from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// TODO: Replace with your actual Stripe publishable key or fetch from an environment variable.
const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';

const { width, height } = Dimensions.get('window');
const SLIDING_CARD_WIDTH = width * 0.9; // 90% for sliding cards
const SMALL_CARD_WIDTH = width * 0.4; // 40% for All and Featured categories
const SMALL_CARD_HEIGHT = 170; // Height for All and Featured categories

export default function QuizScreen({ navigation }) {
    const [categories, setCategories] = useState([]);
    const [premiumCategories, setPremiumCategories] = useState([]);
    const [userData, setUserData] = useState({ username: 'User', profilePic: null });
    const [scaleAnimCards, setScaleAnimCards] = useState([]);
    const [gems, setGems] = useState(0);
    const [unlockedCategories, setUnlockedCategories] = useState({
        'Tech Titans': false,
        'World Mastery': false,
        'Elite Mind': false,
    });
    const db = getFirestore();
    const auth = getAuth();
    const scrollRef = useRef(null);
    const sliderIndex = useRef(0);
    const [loading, setLoading] = useState(true);
    const [disable, setDisable] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const categoryImages = {
        'General Knowledge': require('../assets/general.png'),
        'Science': require('../assets/science.png'),
        'History': require('../assets/history.png'),
        'Mathematics': require('../assets/maths.png'),
        'Literature': require('../assets/literature.png'),
        'Technology': require('../assets/technology.png'),
        'Geography': require('../assets/geography.png'),
        'Sports': require('../assets/sports.png'),
        'Movies': require('../assets/movies.png'),
        'Current Affairs': require('../assets/current.png'),
        'Tech Titans': require('../assets/techtitans.png'),
        'World Mastery': require('../assets/worldmastery.png'),
        'Elite Mind': require('../assets/elitemind.png'),
        default: require('../assets/google.png'),
    };

    // Define static premium images
    const premiumCategoryImages = {
        'Tech Titans': require('../assets/techtitans.png'),
        'World Mastery': require('../assets/worldmastery.png'),
        'Elite Mind': require('../assets/elitemind.png'),
    };

    // Define 3 static sliding cards with images
    const slidingCards = [
        { category: 'General Knowledge', image: require('../assets/banner1.jpeg') },
        { category: 'Science', image: require('../assets/banner.jpeg') },
        { category: 'History', image: require('../assets/banner3.jpeg') },
    ];

    useEffect(() => {
        let unsubscribeUser = null;
        let unsubscribeLeaderboard = null;
        let unsubscribeCategories = null;
        let unsubscribePremiumCategories = null;
        let unsubscribeUnlockedCategories = null;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userRef = doc(db, 'users', currentUser.uid);

        // Real-time user info listener
        const listenToUserData = () => {
            const userQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));

            unsubscribeUser = onSnapshot(userQuery, (userSnapshot) => {
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0].data();
                    setUserData({
                        username: userDoc.name || 'User',
                        profilePic: userDoc.profilePic || null,
                    });
                }
            }, (error) => {
                console.error("Error fetching user data:", error);
                setUserData({ username: 'User', profilePic: null });
            });
        };

        // Real-time leaderboard (gems) listener
        const listenToLeaderboard = () => {
            const leaderboardRef = collection(db, 'leaderboard');
            const scoreQuery = query(leaderboardRef, where('uid', '==', currentUser.uid));

            unsubscribeLeaderboard = onSnapshot(scoreQuery, (snapshot) => {
                let total = 0;
                snapshot.forEach(doc => {
                    total += doc.data().score || 0;
                });
                setGems(Math.floor(total));
            }, (error) => {
                console.error("Error fetching leaderboard data:", error);
                setGems(0);
            });
        };

        // Real-time category listener (excluding premium categories)
        const fetchCategories = () => {
            const questionsRef = collection(db, 'questions');
            unsubscribeCategories = onSnapshot(questionsRef, (snapshot) => {
                const categorySet = new Set();
                const premiumSet = new Set(['Tech Titans', 'World Mastery', 'Elite Mind']);
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.category && !premiumSet.has(data.category)) {
                        categorySet.add(data.category);
                    }
                });

                const sortedCategories = Array.from(categorySet).sort();
                setCategories(sortedCategories);
                setTimeout(() => setLoading(false), 500);
            }, (error) => {
                console.error("Error fetching categories:", error);
                setCategories([]);
            });
        };

        // Real-time premium category listener
        const fetchPremiumCategories = () => {
            const questionsRef = collection(db, 'questions');
            unsubscribePremiumCategories = onSnapshot(questionsRef, (snapshot) => {
                const premiumCategorySet = new Set(['Tech Titans', 'World Mastery', 'Elite Mind']);
                const availablePremiumCategories = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.category && premiumCategorySet.has(data.category)) {
                        availablePremiumCategories.push(data.category);
                    }
                });

                // Ensure all premium categories are included, even if not in DB
                const finalPremiumCategories = ['Tech Titans', 'World Mastery', 'Elite Mind'].filter(category =>
                    availablePremiumCategories.includes(category)
                );
                setPremiumCategories(finalPremiumCategories);
            }, (error) => {
                console.error("Error fetching premium categories:", error);
                setPremiumCategories(['Tech Titans', 'World Mastery', 'Elite Mind']); // Fallback
            });
        };

        // Real-time listener for unlocked premium categories
        const fetchUnlockedCategories = () => {
            unsubscribeUnlockedCategories = onSnapshot(userRef, (doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    setUnlockedCategories({
                        'Tech Titans': userData.premium_techtitans || false,
                        'World Mastery': userData.premium_worldmastery || false,
                        'Elite Mind': userData.premium_elitemind || false,
                    });
                }
            }, (error) => {
                console.error("Error fetching unlocked categories:", error);
                setUnlockedCategories({
                    'Tech Titans': false,
                    'World Mastery': false,
                    'Elite Mind': false,
                });
            });
        };

        listenToUserData();
        listenToLeaderboard();
        fetchCategories();
        fetchPremiumCategories();
        fetchUnlockedCategories();

        return () => {
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribeLeaderboard) unsubscribeLeaderboard();
            if (unsubscribeCategories) unsubscribeCategories();
            if (unsubscribePremiumCategories) unsubscribePremiumCategories();
            if (unsubscribeUnlockedCategories) unsubscribeUnlockedCategories();
        };
    }, []);

    useEffect(() => {
        setScaleAnimCards(slidingCards.map(() => new Animated.Value(1)));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current && slidingCards.length > 0) {
                sliderIndex.current = (sliderIndex.current + 1) % slidingCards.length;
                scrollRef.current.scrollTo({
                    x: sliderIndex.current * width, // Adjusted to account for full width snapping
                    animated: true,
                });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const animateButton = (scaleValue, toValue) => {
        if (scaleValue) {
            Animated.timing(scaleValue, {
                toValue,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    };

    const fetchPaymentIntent = async (category) => {
        try {
            // TODO: In a production app, fetch the client_secret from your secure backend.
            // DO NOT call the Stripe API directly from the client with a secret key.
            const backendUrl = 'YOUR_SECURE_BACKEND_URL/create-payment-intent';
            
            console.warn("Payment endpoint not configured. Payments are currently disabled.");
            
            // Example of how the fetch should look once your backend is ready:
            /*
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 10000,
                    category: category,
                    customer_email: auth.currentUser.email
                }),
            });
            const { client_secret } = await response.json();
            return client_secret;
            */
            
            // Stub returning a dummy secret so the app compiles
            return "dummy_client_secret_needs_backend";
        } catch (error) {
            console.error("Error fetching payment intent", error);
            throw error;
        }
    };

    const setup = async (category) => {
        try {
            const clientSecret = await fetchPaymentIntent(category);
            const { error } = await initPaymentSheet({
                merchantDisplayName: 'QuizApp',
                paymentIntentClientSecret: clientSecret,
                allowsDelayedPaymentMethods: true,
            });
            if (error) {
                console.log("Error", error.message);
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error setting up payment sheet", error);
            return false;
        }
    };

    const checkout = async (category) => {
        const { error } = await presentPaymentSheet();
        if (error) {
            console.log("Error", error.message);
        } else {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const fieldName = `premium_${category.toLowerCase().replace(' ', '')}`;
                await updateDoc(userRef, {
                    [fieldName]: true,
                });
                ToastAndroid.show("Payment Successful", ToastAndroid.SHORT);
            }
        }
    };

    const handlePurchase = async (category) => {
        setDisable(true);
        try {
            const setupSuccess = await setup(category);
            if (setupSuccess) {
                await checkout(category);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setDisable(false);
        }
    };

    const renderCard = (item, index, cardWidth, cardHeight, showTitle = true, isStatic = false) => (
        <View
            key={item.category || item}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                marginHorizontal: (width - cardWidth) / 2, // Center the card within the full-width container
                width: cardWidth,
                height: cardHeight,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
                overflow: 'hidden',
                marginVertical: 8,
                alignSelf: isStatic ? 'center' : 'flex-start',
            }}
        >
            {/* <Animated.View style={{ transform: [{ scale: scaleAnimCards[index] || new Animated.Value(1) }] }}> */}
            <View>
                <Image
                    source={item.image || categoryImages[item] || categoryImages.default}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                    resizeMode="stretch"
                />
                {showTitle && (
                    <View style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text
                            style={{
                                fontSize: 12,
                                color: '#1F2937',
                                fontWeight: '600',
                                textAlign: 'center',
                            }}
                        >
                            {item.category || item}
                        </Text>
                    </View>
                )}
            </View>
            {/* </Animated.View> */}
        </View>
    );

    const renderInteractiveCard = (item, index, cardWidth, cardHeight, isPremium = false) => {
        const isUnlocked = unlockedCategories[item];

        return (
            <TouchableOpacity
                key={item}
                activeOpacity={0.9}
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    marginHorizontal: 8,
                    width: cardWidth,
                    height: cardHeight,
                    borderWidth: 1,
                    borderColor: isPremium && !isUnlocked ? '#FFD700' : '#E5E7EB', // Gold border for locked premium
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                    overflow: 'hidden',
                    marginVertical: 8,
                }}
                disabled={disable}
                onPress={() => {
                    if (isPremium && !isUnlocked) {
                        handlePurchase(item);
                    } else {
                        navigation.navigate('QuizPlayScreen', { category: item });
                    }
                }}
                onPressIn={() => animateButton(scaleAnimCards[index], 0.95)}
                onPressOut={() => animateButton(scaleAnimCards[index], 1)}
            >
                {/* <Animated.View style={{ transform: [{ scale: scaleAnimCards[index] || new Animated.Value(1) }] }}> */}
                <View>
                    <Image
                        source={isPremium ? premiumCategoryImages[item] : (categoryImages[item] || categoryImages.default)}
                        style={{
                            width: '100%',
                            height: '80%',
                        }}
                        resizeMode="stretch"
                    />
                    {isPremium && !isUnlocked && (
                        <View style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: '#FFD700',
                            borderRadius: 12,
                            padding: 4,
                        }}>
                            <Text style={{ fontSize: 10, color: '#1F2937', fontWeight: '600' }}>Premium</Text>
                        </View>
                    )}
                    <View style={{ padding: 8, alignItems: 'center', justifyContent: 'center' }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: 12,
                                color: '#1F2937',
                                fontWeight: '600',
                                textAlign: 'center',
                            }}
                        >
                            {item}
                        </Text>
                    </View>
                </View>
                {/* </Animated.View> */}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={['#7C3AED', '#C4B5FD']} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#F59E0B" />
                        <Text style={{ color: '#1F2937', marginTop: 12, fontSize: 16, fontWeight: '500' }}>
                            Loading Quizzes...
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <LinearGradient colors={['#7C3AED', '#C4B5FD']} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
                    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 85, paddingTop: 20 }}>
                        {/* Header */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginHorizontal: 16,
                                marginBottom: 24,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={userData.profilePic ? { uri: userData.profilePic } : require('../assets/default.jpeg')}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                        marginRight: 12,
                                        borderWidth: 2,
                                        borderColor: '#FFFFFF',
                                    }}
                                />
                                <View>
                                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '500' }}>Welcome back</Text>
                                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>{userData.username}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 20,
                                        padding: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 20
                                    }}
                                >
                                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600', marginRight: 4 }}>
                                        💎
                                    </Text>
                                    <Text style={{ fontSize: 16, color: '#1F2937', fontWeight: '600' }}>{gems}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Auto-sliding cards (3 static cards, centered) */}
                        <ScrollView
                            horizontal
                            ref={scrollRef}
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width} // Snap to full screen width
                            decelerationRate="fast"
                            contentContainerStyle={{
                                width: width * slidingCards.length, // Ensure the container takes the full width for each card
                            }}
                            contentOffset={{ x: 0, y: 0 }} // Start at the first card
                        >
                            {slidingCards.map((item, index) => renderCard(item, index, SLIDING_CARD_WIDTH, 170, false, true))}
                        </ScrollView>

                        {/* All Categories (fixed order, excluding premium) */}
                        <Text
                            style={{
                                color: '#FFF',
                                fontSize: 22,
                                fontWeight: '600',
                                marginHorizontal: 16,
                                marginTop: 10,
                                marginBottom: 10,
                            }}
                        >
                            All Categories
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        >
                            {categories.map((item, index) => renderInteractiveCard(item, index, SMALL_CARD_WIDTH, SMALL_CARD_HEIGHT))}
                        </ScrollView>

                        {/* Premium Categories */}
                        <Text
                            style={{
                                color: '#FFF',
                                fontSize: 22,
                                fontWeight: '600',
                                marginHorizontal: 16,
                                marginTop: 10,
                                marginBottom: 10,
                            }}
                        >
                            Premium Categories
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        >
                            {premiumCategories.map((item, index) => renderInteractiveCard(item, index, SMALL_CARD_WIDTH, SMALL_CARD_HEIGHT, true))}
                        </ScrollView>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </StripeProvider>
    );
}