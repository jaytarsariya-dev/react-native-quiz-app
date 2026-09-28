import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error setting AsyncStorage:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#fff', '#fff']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 5, paddingTop: 50 }}>
          <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />
          {/* Quiz Icon */}
          <Image
            source={require('../assets/quiz.jpg')} // Replace with your icon path
            style={styles.icon}
            resizeMode="cover"
          />

          <Text style={styles.title}>Quiz Master</Text>

          {/* Description */}
          <Text style={styles.description}>
            Challenge yourself with our engaging quizzes on various topics. Test your knowledge, learn new facts, and have fun while improving your skills!
          </Text>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Let's Start</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
  },
  icon: {
    width: '95%',
    height: '60%',
    borderRadius: 40,
    marginBottom: 24,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#8D70FF',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});