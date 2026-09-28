import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  Image,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function QuestionListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const db = getFirestore();
  const [loading, setLoading] = useState(true);

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
    default: require('../assets/default.jpeg'),
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'questions'), (querySnapshot) => {
      const categorySet = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categorySet.add(data.category);
        }
      });
      setCategories([...categorySet]);
      setTimeout(() => setLoading(false), 500);
    }, (error) => {
      Alert.alert('Error', 'Failed to fetch categories: ' + error.message);
    });

    return () => unsubscribe();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     const onBackPress = () => {
  //       Alert.alert("Logout Confirmation", "Are you sure you want to logout?", [
  //         { text: "Cancel", style: "cancel" },
  //         { text: "Logout", onPress: () => navigation.replace('Login') }
  //       ]);
  //       return true;
  //     };
  //     const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //     return () => subscription.remove();
  //   }, [])
  // );

  const handleLogout = () => {
    Alert.alert("Logout Confirmation", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: async () => { navigation.replace('Login'); await AsyncStorage.setItem('IsLogin', 'null'); await AsyncStorage.setItem('LoginRole', 'null'); } }
    ]);
    return true;
  }

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={customStyles.categoryCard}
      onPress={() => navigation.navigate('CategoryQuestionListScreen', { category: item })}
    >
      <Image
        source={categoryImages[item] || categoryImages.default}
        style={customStyles.categoryImage}
        resizeMode="stretch"
      />
      <View style={customStyles.categoryTextContainer}>
        <Text numberOfLines={1} style={customStyles.categoryCardText}>{item}</Text>
      </View>
    </TouchableOpacity>
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
      style={customStyles.container}

    >
      <SafeAreaView style={{ marginTop: 50, paddingHorizontal: 15, flex: 1 }}>
        <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingHorizontal: 10,
          }}
        >
          <Text style={customStyles.title}>Quiz Categories</Text>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              elevation: 3, // For Android shadow
              shadowColor: '#000', // iOS shadow
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <Icon name="logout" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={customStyles.subtitle}>Select a category to manage questions</Text>

        <FlatList
          showsVerticalScrollIndicator={false}
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item}
          contentContainerStyle={customStyles.listContainer}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        // ListEmptyComponent={() =>
        //   loading ? (
        //     <ActivityIndicator color={'white'} size={'large'} style={{ marginTop: '90%' }} />
        //   ) : (
        //     <View style={{ flex: 1, justifyContent: 'center' }}>
        //       <Text style={[customStyles.noQuestionsText, { marginTop: '90%' }]}>No categories found.</Text>
        //     </View>
        //   )
        // }
        />

        <TouchableOpacity
          activeOpacity={1}
          style={customStyles.fab}
          onPress={() => navigation.navigate('InsertQuestionScreen')}
        >
          <Icon name="add" size={28} color="#FFFFFF" />

        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const customStyles = {
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    // marginTop: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    // paddingBottom: 120,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 6,
    marginBottom: 10,
    width: (width - 40) / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    height: 200
  },
  categoryImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryTextContainer: {
    padding: 10,
    alignItems: 'center',
  },
  categoryCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    elevation: 6,
    backgroundColor: '#8D70FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500'
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
};
