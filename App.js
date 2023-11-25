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
import { ReportScreen } from './screens/ReportScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import LoginProfileScreen from './screens/LoginProfileScreen';
import LoginProfileScreen2 from './screens/LoginProfileScreen2';

// jwt-decode 라이브러리는 일반적으로 웹 환경에서 작동
// React Native에서 사용하기 위해 base64 추가 설치 및 polyfill 적용
global.atob = base64.decode;
global.btoa = base64.encode;

// 네비게이션 구조를 위한 탭 및 스택 생성자 초기화
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 하단 탭 네비게이션 컴포넌트
function MyTabs() {
  return (
    <Tab.Navigator initialRouteName="홈">
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
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
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

// 앱의 메인 네비게이션 로직을 담당하는 컴포넌트
function AppNavigator({ userId, userName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!userId); // 사용자 인증 여부 상태

  useEffect(() => {
    // 사용자 인증 여부에 따라 초기 화면 설정
    setIsAuthenticated(!!userId);
    const initialScreenName = isAuthenticated ? "Kakao" : "MainTabs";
    console.log("Initial screen set to:", initialScreenName);
  }, [userId]);

  // 사용자 인증 여부에 따라 초기 화면 설정
  return (
    <Stack.Navigator initialRouteName={isAuthenticated ? "Kakao" : "MainTabs"}>
      <Stack.Screen name="Kakao" component={Kakao} options={{ headerShown: false }} />
      <Stack.Screen name="KakaoWebView" component={KakaoWebView} />
      <Stack.Screen name="LoginProfile" component={LoginProfileScreen} initialParams={{ userName: userName }} />
      <Stack.Screen name="LoginProfile2" component={LoginProfileScreen2} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MyTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    // JWT를 확인하여 사용자 인증 처리
    const verifyUserExists = async () => {
      const token = await getJWT(); // 토큰 불러오기
      console.log('저장된 JWT:', token);

      if (token) {
        let decodedToken;
        try {
          decodedToken = jwtDecode(token);
          console.log('디코딩된 토큰: ', decodedToken); // 디코딩된 토큰 로그 출력
        } catch (error) {
          console.error("Error decoding the token:", error);
          return;
        }

        // 토큰에서 사용자 ID 추출
        const extractedUserId = decodedToken && decodedToken.userId && decodedToken.userId[0] && decodedToken.userId[0].u_id;
        console.log('JWT에서 ID 추출:', extractedUserId);

        // 사용자 ID가 있을 경우 서버에 확인 요청
        if (extractedUserId) {
          try {
            const response = await fetch(`http://172.30.1.11:4000/auth/info?user_id=${extractedUserId}`);
            const data = await response.json();
            console.log('사용자 정보(DB 추출):', data);

            if (data.result && data.result.length > 0) {
              console.log('DB에 사용자 존재함');
              setUserId(data.result[0].u_id);
              return <AppNavigator userId={userId} userName={decodedToken.userId[0].u_name} />;
            } else {
              console.log('User not found in the database');
            }
          } catch (fetchError) {
            console.error('Error fetching user info:', fetchError);
          }
        } else {
          console.error('User ID not found in decoded token');
        }
      }
    };

    verifyUserExists();
  }, []);

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <AppNavigator userId={userId} userName={userName} />
      </NavigationContainer>
    </NativeBaseProvider>
  );
}