import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

export default function CategoryQuestionListScreen({ navigation, route }) {
  const { category } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'questions'),
      (snapshot) => {
        const filtered = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.category === category);
        setQuestions(filtered);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      },
      (error) => {
        Alert.alert('Error', 'Fetch failed: ' + error.message);
      }
    );
    return () => unsubscribe();
  }, [category]);

  const handleDelete = (id, questionText) => {
    Alert.alert(
      'Delete Question',
      `Are you sure you want to delete: "${questionText}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'questions', id));
              // Alert.alert('Deleted', 'Question removed successfully.');
              ToastAndroid.show('Question removed successfully.',ToastAndroid.SHORT);
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderQuestionItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('UpdateQuestionScreen', { questionData: item })}
      onLongPress={() => handleDelete(item.id, item.question)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        elevation: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      <Text style={{
        backgroundColor: '#8D70FF',
        color: 'white',
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        marginRight: 18,
      }}>
        {index + 1}
      </Text>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
          {item.question}
        </Text>
        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Category: {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    loading
      ? <ActivityIndicator size="large" color="white" style={{ marginTop: '90%' }} />
      : <Text style={{ color: 'white', textAlign: 'center', marginTop: '90%', fontSize: 16 }}>No questions found.</Text>
  );

  if (loading) {
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

  return (
    <LinearGradient
      colors={['#6B48FF', '#D1C9FF']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingTop: 50 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'white',
          marginBottom: 8,
        }}>{category} Questions</Text>
        <Text style={{ textAlign: 'center', color: 'white', fontSize: 14, marginBottom: 20 }}>
          Manage all questions in this category
        </Text>

        <FlatList
          data={questions}
          renderItem={renderQuestionItem}
          keyExtractor={(item) => item.id}
          // ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB
        <TouchableOpacity
          onPress={() => navigation.navigate('InsertQuestionScreen', { defaultCategory: category })}
          style={{
            position: 'absolute',
            bottom: 25,
            right: 25,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#22C55E',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity> */}
      </SafeAreaView>
    </LinearGradient>
  );
}
