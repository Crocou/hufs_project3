import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { saveJWT } from './service/authService';
import { jwtDecode } from 'jwt-decode';

const CLIENT_ID = "695757edacbf01e55c4d269a9ff165ba";
const REDIRECT_URI = "https://localhost:3000/auth/kakao/callback";
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

const KakaoWebView = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(null);
  const [codeSent, setCodeSent] = useState(false);

  // 코드가 설정되면 서버에 토큰 요청
  useEffect(() => {
    if (code && !codeSent) {
      const fetchToken = async () => {
        const userJWT = await sendCodeToServer(code);
        setCodeSent(true);
        if (userJWT) {
          handleAuthentication(userJWT);
          navigation.navigate('LoginProfile');
        }
      };

      fetchToken();
    }
  }, [code, codeSent]);

  // 웹뷰 내의 URL 변화를 감지하여 인증 코드를 추출
  const handleNavigationStateChange = (newNavState) => {
    const url = newNavState.url;
    if (url.includes('localhost:3000/auth/kakao/callback?code=')) {
      const extractedCode = url.split('=')[1];
      setCode(extractedCode);
    }
  };

  // 인증 코드를 서버에 전송하고 JWT 토큰을 받는 함수입니다.
  const sendCodeToServer = async (code) => {
    try {
      const response = await fetch('http://172.30.1.11:4000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Authorization code sent to the server successfully.');
        return data;
      } else {
        console.error('Failed to send authorization code to the server.');
        return null;
      }
    } catch (error) {
      console.error('Error sending authorization code to the server:', error);
      return null;
    }
  };

  // JWT 토큰을 저장하는 함수
  const handleAuthentication = async (userJWT) => {
    try {
      await saveJWT(userJWT);
      console.log('JWT saved successfully');

      // JWT를 이용해 서버에 사용자 정보 요청
      const verifyUserExists = async () => {
        try {
          let decodedToken = jwtDecode(userJWT); // userJWT 디코딩
          const extractedUserId = decodedToken?.userId?.[0]?.u_id;
          console.log('JWT에서 ID 추출:', extractedUserId);

          if (extractedUserId) {
            const response = await fetch(`http://172.30.1.11:4000/auth/info?user_id=${extractedUserId}`);
            const data = await response.json();
            console.log('사용자 정보(DB 추출):', data);

            if (data.result && data.result.length > 0) {
              console.log('DB에 사용자 존재함');
              navigation.navigate('MainTabs'); // 사용자가 존재하면 MainTabs로 이동
            } else {
              console.log('User not found in the database');
              // 필요하다면 여기에 추가적인 로직 구현
            }
          } else {
            console.error('User ID not found in decoded token');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };

      verifyUserExists();
    } catch (error) {
      console.error('Failed in handleAuthentication', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: KAKAO_AUTH_URL }}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    color: 'white'
  },
});

export default KakaoWebView;
