import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getFirestore, collection, query, onSnapshot, where } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const categories = [
  'All',
  'General Knowledge',
  'Science',
  'History',
  'Mathematics',
  'Literature',
  'Technology',
  'Geography',
  'Sports',
  'Movies',
  'Current Affairs',
  'Tech Titans',
  'World Mastery',
  'Elite Mind'
];

const LeaderBoardScreen = ({ navigation }) => {
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading2, setLoading2] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = () => {
      const leaderboardRef = collection(db, 'leaderboard');
      let q;
      if (selectedCategory === 'All') {
        q = query(leaderboardRef);
      } else {
        q = query(leaderboardRef, where('category', '==', selectedCategory));
      }

      // Listen for real-time updates using onSnapshot
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let users = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          users.push({
            uid: data.uid,
            username: data.username || 'Anonymous',
            score: data.score || 0,
            photoURL: data.photoURL || require('../assets/default.jpeg'),
          });
        });

        // Group by user and sum scores for "All" category
        if (selectedCategory === 'All') {
          const userScores = {};
          users.forEach(user => {
            if (userScores[user.uid]) {
              userScores[user.uid].score += user.score;
            } else {
              userScores[user.uid] = { ...user };
            }
          });
          users = Object.values(userScores);
        }

        // Sort by score in descending order
        users.sort((a, b) => b.score - a.score);

        // Find current user's rank
        const currentUserIndex = users.findIndex(user => user.uid === currentUser?.uid);
        setCurrentUserRank(currentUserIndex !== -1 ? currentUserIndex + 1 : null);

        // Limit to top 9, append current user at 10th if not in top 9
        let displayData = users.slice(0, 9);
        if (currentUserIndex !== -1 && currentUserIndex >= 9) {
          const currentUserData = users[currentUserIndex];
          displayData = [...displayData, currentUserData];
        }

        setLeaderboardData(displayData);

        setTimeout(() => {
          setLoading2(false);
        }, 500);
      }, (error) => {
        console.error('Error listening to leaderboard data:', error);
      });

      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    };

    // Call the function and store the unsubscribe function
    const unsubscribe = fetchLeaderboardData();

    // Clean up the listener when the component unmounts or selectedCategory changes
    return () => unsubscribe();
  }, [selectedCategory]);

  const renderTopThree = () => {
    const topThree = leaderboardData.slice(0, 3);
    if (topThree.length === 0) return null;

    return (
      <View style={styles.topThreeContainer}>
        {topThree[1] && (
          <View style={styles.secondPlace}>
            <View style={styles.starContainer}>
              <Icon name="star" size={30} color="#C0C0C0" />
              <Text style={styles.starText}>2</Text>
            </View>
            <Image source={{ uri: topThree[1].photoURL }} style={styles.secondImage} />
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>2</Text>
            </View>
            <Text style={styles.topUserName} numberOfLines={1} ellipsizeMode="tail">
              {topThree[1].username}
            </Text>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>💎 {topThree[1].score.toFixed(0)}</Text>
            </View>
          </View>
        )}
        {topThree[0] && (
          <View style={styles.firstPlace}>
            <View style={styles.starContainer}>
              <Icon name="star" size={40} color="#FFD700" />
              <Text style={[styles.starText, { fontSize: 14 }]}>1</Text>
            </View>
            <Image source={{ uri: topThree[0].photoURL }} style={styles.firstImage} />
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>1</Text>
            </View>
            <Text style={styles.topUserName} numberOfLines={1} ellipsizeMode="tail">
              {topThree[0].username}
            </Text>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>💎 {topThree[0].score.toFixed(0)}</Text>
            </View>
          </View>
        )}
        {topThree[2] && (
          <View style={styles.thirdPlace}>
            <View style={styles.starContainer}>
              <Icon name="star" size={30} color="#CD7F32" />
              <Text style={styles.starText}>3</Text>
            </View>
            <Image source={{ uri: topThree[2].photoURL }} style={styles.thirdImage} />
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>3</Text>
            </View>
            <Text style={styles.topUserName} numberOfLines={1} ellipsizeMode="tail">
              {topThree[2].username}
            </Text>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>💎 {topThree[2].score.toFixed(0)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item, index }) => {
    const rank = index + 4; // Starting from 4th place
    return (
      <View style={styles.userCard}>
        <Text style={styles.rankLabel}>{rank}</Text>
        <Image source={{ uri: item.photoURL }} style={styles.userImage} />
        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
          {item.username}
        </Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.gemIcon}>💎</Text>
          <Text style={styles.userScore}>{item.score.toFixed(0)}</Text>
        </View>
      </View>
    );
  };

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

  const CustomPicker = ({ selectedCategory, setSelectedCategory, categories, styles }) => {
    return (
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            // flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            // paddingHorizontal: 10,
            width: 120,

          }}
        >
          <Text numberOfLines={1} style={{ fontSize: 15, color: 'white',width:'79%' }}>
            {selectedCategory}
          </Text>
          <Icon name="arrow-drop-down" size={25} color="white" />
        </TouchableOpacity>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
          }}
        >
          {categories.map((category, index) => (
            <Picker.Item key={index} label={category} value={category} />
          ))}
        </Picker>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#6B48FF', '#D1C9FF']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
        <CustomPicker
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          styles={{
            pickerContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 10,
              paddingHorizontal: 15,
              height: 50
            },
          }}
        />
      </View>

      {renderTopThree()}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={leaderboardData.slice(3)}
        renderItem={renderUserItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No data available for this category.</Text>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pickerContainer: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFF',
    height: 40,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  firstPlace: {
    alignItems: 'center',
    marginHorizontal: 10,
    position: 'relative',
  },
  starContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    top: -20,
    zIndex: 1
  },
  starText: {
    position: 'absolute',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  secondPlace: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  thirdPlace: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  firstImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  secondImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#C0C0C0',
  },
  thirdImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#CD7F32',
  },
  crown: {
    position: 'absolute',
    top: -20,
    zIndex: 1,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rankText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topUserName: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    maxWidth: 90, // Prevent overflow for 2nd and 3rd
  },
  scoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scoreText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    // paddingBottom:200
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  rankLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width: 30,
    textAlign: 'center',
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  userScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LeaderBoardScreen;