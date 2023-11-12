import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { saveJWT } from './service/authService';

const conf = require('./KakaoAPI.json');

const CLIENT_ID = conf.CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";
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
      const response = await fetch('http://10.10.1.99:4000/auth', {
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
  },
});

export default KakaoWebView;
