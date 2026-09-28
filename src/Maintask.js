import React, { useEffect, useRef, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, LogBox, PermissionsAndroid, Platform, View } from "react-native";
import LottieView from "lottie-react-native";

// Screens
import LoginScreen from "./Auth/LoginScreen";
import RegisterScreen from "./Auth/RegisterScreen";
import ForgotPasswordScreen from "./Auth/ForgotPasswordScreen";
import InsertQuestionScreen from "./AdminPannel/InsertQuestionScreen";
import QuestionListScreen from "./AdminPannel/QuestionListScreen";
import UpdateQuestionScreen from "./AdminPannel/UpdateQuestionScreen";
import CategoryQuestionListScreen from "./AdminPannel/CategoryQuestionListScreen";
import User from "./UserPannel/User";
import QuizPlayScreen from "./UserPannel/QuizPlayScreen";
import WelcomeScreen from "./UserPannel/WelcomeScreen";

const Stack = createStackNavigator();

const Maintask = () => {
  const [initialRoute, setInitialRoute] = useState("Loading");
  const [showLottie, setShowLottie] = useState(true);

  useEffect(() => {
    const checkAuthAndWelcome = async () => {
      try {
        const isLogin = await AsyncStorage.getItem("IsLogin");
        const loginRole = await AsyncStorage.getItem("LoginRole");
        const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");

        if (isLogin === "true") {
          if (loginRole === "admin") {
            setInitialRoute("QuestionListScreen"); // Admin panel start screen
          } else if (loginRole === "user") {
            setInitialRoute("User"); // User panel start screen
          } else {
            setInitialRoute("Login"); // fallback
          }
        } else {
          if (hasSeenWelcome === "true") {
            setInitialRoute("Login");
          } else {
            setInitialRoute("WelcomeScreen");
          }
        }
      } catch (error) {
        console.error("Error checking AsyncStorage:", error);
        setInitialRoute("Login");
      }
    };

    checkAuthAndWelcome();

    const timer = setTimeout(() => {
      setShowLottie(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showLottie) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <LottieView
          source={require("./assets/loading.json")}
          autoPlay
          speed={1}
          loop={true}
          style={{ width: 400, height: 400 }}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "none" }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="InsertQuestionScreen" component={InsertQuestionScreen} />
      <Stack.Screen name="QuestionListScreen" component={QuestionListScreen} />
      <Stack.Screen name="UpdateQuestionScreen" component={UpdateQuestionScreen} />
      <Stack.Screen name="CategoryQuestionListScreen" component={CategoryQuestionListScreen} />
      <Stack.Screen name="User" component={User} />
      <Stack.Screen name="QuizPlayScreen" component={QuizPlayScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
    </Stack.Navigator>
  );
};

export default Maintask;
