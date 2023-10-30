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
          <TouchableOpacity onPress={() => navigation.navigate('KakaoWebView')}>
            <Image
              source={{ uri: 'https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_medium_narrow.png' }}
              style={styles.imageStyle}
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
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});


export default Kakao;
