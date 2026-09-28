import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import { getFirestore, collection, query, where, getDocs, setDoc, doc, addDoc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 30;
const POINTS_PER_CORRECT = 1;
const AUTO_NEXT_DELAY = 2000;

const QuizPlayScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [highlightWrong, setHighlightWrong] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [userData, setUserData] = useState({ username: 'User', profilePic: null });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, 'questions'), where('category', '==', category));
        const querySnapshot = await getDocs(q);
        const fetchedQuestions = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetchedQuestions.push({
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer,
          });
        });

        const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, TOTAL_QUESTIONS);
        setQuestions(selectedQuestions);
        setTimeout(() => {
          setLoading2(false);
        }, 500);
        if (selectedQuestions.length === 0) {
          Alert.alert('Error', 'No questions found for this category.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Error', 'Failed to load questions.');
        navigation.goBack();
      }
    };

    fetchQuestions();
  }, [category, navigation]);

  useEffect(() => {
    let unsubscribeUser = null;
    const currentUser = auth.currentUser;

    const listenToUserData = () => {
      if (!currentUser) return;

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

    listenToUserData();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Quit Confirmation", "Are you sure you want to Quit this game?", [
          { text: "Cancel", style: "cancel" },
          { text: "Quit", onPress: () => navigation.goBack() }
        ]);
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    if (quizEnded || !timerRunning || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestionIndex, quizEnded, timerRunning, questions]);

  const saveScoreToFirestore = async (category, score, isAllCategory = false) => {
    try {
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const percentage = (score / TOTAL_QUESTIONS) * 100;
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(
        leaderboardRef,
        where('uid', '==', user.uid),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);

      const timestamp = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      const userName = userData.name || 'Anonymous';
      const photoURL = userData.profilePic || require('../assets/default.jpeg');

      if (!querySnapshot.empty) {
        // Update existing score
        const docRef = querySnapshot.docs[0].ref;
        const existingScore = querySnapshot.docs[0].data().score || 0;
        await setDoc(
          docRef,
          {
            uid: user.uid,
            username: userName,
            category,
            score: existingScore + percentage,
            timestamp,
            photoURL: photoURL || require('../assets/default.jpeg')
          },
          { merge: true }
        );
      } else {
        // Create new score entry
        await addDoc(leaderboardRef, {
          uid: user.uid,
          username: userName,
          category,
          score: percentage,
          timestamp,
          photoURL: photoURL || require('../assets/default.jpeg')
        });
      }
    } catch (error) {
      console.error('Error saving score to Firestore:', error);
    }
  };

  const handleTimeUp = () => {
    setTimerRunning(false);
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOption(null);
      setTimerRunning(true);
      setIsAnswered(false);
      setHighlightWrong(false);
    } else {
      setQuizEnded(true);
      saveScoreToFirestore(category, score);
      saveScoreToFirestore('All', score, true);
    }
  };

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setTimerRunning(false);

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.options[index] === currentQuestion.correctAnswer) {
      setScore(prev => prev + POINTS_PER_CORRECT);
    } else {
      setHighlightWrong(true);
      setTimeout(() => {
        setHighlightWrong(false);
      }, 1000);
    }

    setTimeout(() => {
      if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setSelectedOption(null);
        setTimerRunning(true);
        setIsAnswered(false);
        setHighlightWrong(false);
      } else {
        setQuizEnded(true);
        saveScoreToFirestore(category, score);
        // saveScoreToFirestore('All', score, true);
      }
    }, AUTO_NEXT_DELAY);
  };

  const handleSkip = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOption(null);
      setTimerRunning(true);
      setIsAnswered(false);
      setHighlightWrong(false);
    } else {
      setQuizEnded(true);
      saveScoreToFirestore(category, score);
      // saveScoreToFirestore('All', score, true);
    }
  };

  const handleAddTime = () => {
    setTimeLeft(prev => Math.min(prev + 5, TIME_PER_QUESTION));
  };

  const handleAudience = () => {
    ToastAndroid.show('This is Audience poll', ToastAndroid.SHORT);
  };

  const handlePlayAgain = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setQuizEnded(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimerRunning(true);
    setHighlightWrong(false);

    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
  };

  const onBackPress = () => {
    Alert.alert("Quit Confirmation", "Are you sure you want to Quit this game?", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", onPress: () => navigation.goBack() }
    ]);
    return true;
  };

  // if (questions.length === 0) {
  //   return (
  //     <LinearGradient
  //       colors={['#6B48FF', '#D1C9FF']}
  //       style={styles.container}
  //     >
  //       <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#FFFFFF" />
  //         <Text style={styles.loadingText}>Loading questions...</Text>
  //       </View>
  //     </LinearGradient>
  //   );
  // }

  if (quizEnded) {
    const percentage = (score / TOTAL_QUESTIONS) * 100;
    return (
      <LinearGradient colors={['#6B48FF', '#D1C9FF']} style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            width: '85%',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}>
            <View style={{
              position: 'relative',
              top: -90,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: '#D1C9FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image
                source={userData.profilePic ? { uri: userData.profilePic } : require('../assets/default.jpeg')}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />
            </View>
            <Text style={{
              marginTop: -70,
              fontSize: 24,
              fontWeight: '700',
              color: '#1F2937',
            }}>{userData.username}</Text>
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              fontWeight: '500',
              color: '#6B48FF',
            }}>Score</Text>
            <Text style={{
              fontSize: 26,
              fontWeight: '500',
              color: '#1F2937',
              marginBottom: 20,
              marginTop: 10
            }}>
              {score}/10
            </Text>
            <Text style={{
              fontSize: 22,
              fontWeight: '600',
              color: '#1F2937',
              textAlign: 'center',
              marginHorizontal: 20,
            }}>Congratulations, you’ve completed the quiz!</Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '400',
              color: '#6B7280',
              textAlign: 'center',
              marginHorizontal: 20,
              marginTop: 20,
              marginBottom: 20,
            }}>Let’s keep testing your knowledge by playing more quizzes!</Text>
            <TouchableOpacity style={{
              width: '80%',
              borderRadius: 25,
              marginVertical: 8,
            }} onPress={handlePlayAgain}>
              <LinearGradient colors={['#FF9500', '#FF6200']} style={{
                paddingVertical: 12,
                borderRadius: 25,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '80%',
                borderRadius: 25,
                marginVertical: 8,
              }}
              onPress={() => navigation.replace('User')}
            >
              <LinearGradient colors={['#FF9500', '#FF6200']} style={{
                paddingVertical: 12,
                borderRadius: 25,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}>Back to Categories</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = timeLeft / TIME_PER_QUESTION;

  return (
    <LinearGradient
      colors={['#6B48FF', '#D1C9FF']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
        <View style={styles.header}>
            <TouchableOpacity style={{ height: 45, width: 45, backgroundColor: 'white', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }} onPress={() => onBackPress()}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              Question {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
            </Text>
            <TouchableOpacity style={{ height: 45, width: 45, backgroundColor: 'white', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.shareButton}>☰</Text>
            </TouchableOpacity>
          </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, padding: 15 }}>
          <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
          
          <View style={styles.mainCard}>
            <LinearGradient
              colors={['#A78BFA', '#D1C9FF']}
              style={styles.innerQuestionCard}
            >
              <Text style={styles.innerQuestionText}>{currentQuestion.question}</Text>
            </LinearGradient>

            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Time</Text>
              <Progress.Bar
                progress={progress}
                width={240}
                height={10}
                color="#FF9500"
                unfilledColor="#E0E0E0"
                borderWidth={0}
              />
              <Text style={styles.timerText}>
                {String(Math.floor(timeLeft)).padStart(2, '0')}s
              </Text>
            </View>

            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === index &&
                  option === currentQuestion.correctAnswer &&
                  styles.correctOption,
                  selectedOption === index &&
                  option !== currentQuestion.correctAnswer &&
                  highlightWrong &&
                  styles.wrongOption,
                  selectedOption === index &&
                  option !== currentQuestion.correctAnswer &&
                  !highlightWrong &&
                  styles.wrongOptionPersisted,
                  selectedOption !== null &&
                  option === currentQuestion.correctAnswer &&
                  !highlightWrong &&
                  styles.correctOption,

                ]}
                onPress={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
                <Text style={styles.optionContent}>{option}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.footer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{score}/{TOTAL_QUESTIONS}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleAudience}>
                <Text style={styles.actionButtonText}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddTime}>
                <Text style={styles.actionButtonText}>⏳</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSkip}>
                <Text style={styles.actionButtonText}>➡️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 30,
    margin:15
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  shareButton: {
    fontSize: 24,
    color: '#000',
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 500,
  },
  innerQuestionCard: {
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerQuestionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center'
  },
  timerLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  timerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  optionButton: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    alignSelf: "center"
  },
  correctOption: {
    backgroundColor: '#D1E8E2',
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
  },
  wrongOptionPersisted: {
    backgroundColor: '#FEE2E2',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    width: 30,
    textAlign: 'left',
    fontWeight: "bold"
  },
  optionContent: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginEnd: 35
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 10
  },
  scoreContainer: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 60,
    justifyContent: 'center',
    width: 80,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 10,
    width: 75,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 60,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  finalScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalScoreTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  percentageText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 40,
  },
  finalButton: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default QuizPlayScreen;