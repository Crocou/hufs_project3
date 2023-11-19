import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useNavigation } from '@react-navigation/native';

const slides = [
  {
    key: 'one',
    image: require('./assets/coffee.jpg'),
  },
  {
    key: 'two',
    image: require('./assets/coffee2.jpg'),
  },
  {
    key: 'three',
    image: require('./assets/juice3.png'),
  },
];

const Kakao = () => {
  const navigation = useNavigation();

  const _renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
      </View>
    );
  };

  const _renderPagination = (activeIndex) => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationDots}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, activeIndex === index ? styles.activeDot : styles.inactiveDot]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('KakaoWebView')}
        >
          <Image
            source={{ uri: 'https://developers.kakao.com/tool/resource/static/img/button/login/full/ko/kakao_login_medium_narrow.png' }}
            style={styles.kakaoLoginImageStyle}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <AppIntroSlider
        renderItem={_renderItem}
        data={slides}
        renderPagination={_renderPagination}
        dotStyle={styles.inactiveDot}
        activeDotStyle={styles.activeDot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 96, // Decrease this value to move the image up
  },
  image: {
    width: 320,
    height: 548,
    resizeMode: 'cover',
  },
  button: {
    marginBottom: 120, // Adjust the space as needed
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 70, // Adjust as needed for spacing
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  inactiveDot: {
    backgroundColor: '#888',
  },
  activeDot: {
    backgroundColor: 'purple',
  },
  rightTextWrapper: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  kakaoLoginImageStyle: {
    width: 200,
    height: 45,
    resizeMode: 'contain'
  }
});

export default Kakao;