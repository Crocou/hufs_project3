import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import KakaoWebView from './KakaoWebView';

const CLIENT_ID = "695757edacbf01e55c4d269a9ff165ba";
const REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

//const Stack = createStackNavigator();
const Kakao = () => {
    const navigation = useNavigation();
    //const handleKakaoLogin = () => {
        //navigation.navigate('KakaoWebView');
        
    //};
    return (
      <View style={styles.container}>
          <Image
              source={require('./assets/coffee.jpg')} // assets 폴더의 실제 경로로 대체해주세요.
              style={styles.coffeeImageStyle}
          />
          <TouchableOpacity onPress={() => navigation.navigate('KakaoWebView')} >
              <Image
                  source={{ uri: 'https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_medium_narrow.png' }}
                  style={styles.kakaoLoginImageStyle}
              />
          </TouchableOpacity>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // 배경색을 설정하여 이미지 사이의 여백이 흰색이 되도록 설정
  },
  coffeeImageStyle: {
    width: 300, // 적당한 크기로 설정
    height: 300, // 적당한 크기로 설정
    resizeMode: 'contain', // 이미지 비율을 유지하면서 컨테이너에 맞춤
    marginBottom: 150, // '카카오 로그인' 이미지와의 간격 설정
  },
  kakaoLoginImageStyle: {
    width: 200, // 로그인 이미지 크기 설정
    height: 45, // 로그인 이미지 높이 설정
    resizeMode: 'contain', // 이미지 비율을 유지하면서 컨테이너에 맞춤
  }
});


export default Kakao;
