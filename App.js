import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { jwtDecode } from 'jwt-decode';
import base64 from 'base-64';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { NativeBaseProvider } from "native-base";

import Kakao from './Kakao';
import KakaoWebView from './KakaoWebView';
import { getJWT } from './service/authService';
import { HomeScreen } from './screens/HomeScreen';
import { BookmarkScreen } from './screens/BookmarkScreen';
import { SearchScreen } from './screens/SearchScreen';
import LoginProfileScreen from './screens/LoginProfileScreen';
import LoginProfileScreen2 from './screens/LoginProfileScreen2';

// jwt-decode 라이브러리는 일반적으로 웹 환경에서 작동
// React Native에서 사용하기 위해 base64 추가 설치 및 polyfill 적용
global.atob = base64.decode;
global.btoa = base64.encode;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ReportScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
    </View>
  );
}

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="리포트"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="barschart" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="검색"
        component={SearchScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="search1" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="보관함"
        component={BookmarkScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator({ userId }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!userId);

  useEffect(() => {
    setIsAuthenticated(!!userId);
    const initialScreenName = isAuthenticated ? "Kakao" : "MainTabs";
    console.log("Initial screen set to:", initialScreenName);
  }, [userId]);

  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? "Kakao" : "MainTabs"}>
      <Stack.Screen name="Kakao" component={Kakao} />
      <Stack.Screen name="KakaoWebView" component={KakaoWebView} />
      <Stack.Screen name="LoginProfile" component={LoginProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LoginProfile2" component={LoginProfileScreen2} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MyTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const verifyUserExists = async () => {
      const token = await getJWT();
      console.log('Stored JWT:', token);

      if (token) {
        let decodedToken;
        try {
          decodedToken = jwtDecode(token);
        } catch (error) {
          console.error("Error decoding the token:", error);
          return;
        }

        const extractedUserId = decodedToken && decodedToken.userId && decodedToken.userId[0] && decodedToken.userId[0].u_id;
        console.log('Extracted user_id from JWT:', extractedUserId);

        if (extractedUserId) {
          const response = await fetch(`http://172.30.1.11:4000/auth/info?user_id=${extractedUserId}`);
          const data = await response.json();

          console.log('Server response:', data);  // <== 로그 출력 추가

          if (data.result && data.result.length > 0) {
            console.log('User exists in the database');
            setUserId(extractedUserId); // userId 상태 설정
          } else {
            console.log('User not found in the database');
          }
        }
      }
    };

    verifyUserExists();
  }, []);

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <AppNavigator userId={userId} />
      </NavigationContainer>
    </NativeBaseProvider>
  );
}