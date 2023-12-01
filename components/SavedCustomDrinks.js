import React, { useState, useEffect } from "react";
import { FlatList, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Box, Flex, Text, useToast } from "native-base";
import { AntDesign } from '@expo/vector-icons';
import { getCustomDrinks, addIntake } from "../service/apiService";
import { styles as savedInfoStyles } from './SavedInfo';// SavedInfo.js 파일에서 styles를 가져옵니다.

const CustomDrinkItem = ({ data, onSelect, onRefresh }) => {
  const toast = useToast();
  const [isStarred, setIsStarred] = useState(true); // '내가 생성'한 음료이므로 기본적으로 즐겨찾기로 간주

  // 영양소 값의 포맷을 변경하는 함수
  const formatValue = value => value % 1 === 0 ? Math.floor(value) : value.toFixed(2);

  // 즐겨찾기 제거를 처리하는 함수
  const handleRemoveCustomDrink = async () => {
    // 이 함수는 커스텀 음료를 제거하는 로직을 구현해야 합니다.
    // 예를 들어, removeCustomDrink API를 호출할 수 있습니다.
    // await removeCustomDrink(data.d_id);
    setIsStarred(!isStarred);
    onRefresh();
  };
  // 섭취 추가 함수
  const handleAddIntake = async () => {
    try {
      // 현재 날짜와 시간을 설정
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const intakeData = {
        date: formattedDate,
        drink: data.d_id,
        time: currentDate.getHours() * 100 + currentDate.getMinutes(),
      };

      // API 호출
      await addIntake(intakeData);
      toast.show({ title: "섭취 목록에 추가됨", duration: 2000 });
    } catch (error) {
      console.error("Error adding intake data:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => onSelect(data)}>
      <Box {...savedInfoStyles.box}>
        <Flex direction="row" width="100%">
          {/* 별 아이콘 */}
          <Flex mr="3" width="10%" justifyContent="flex-start" alignItems="center">
            <AntDesign
              name={isStarred ? "star" : "staro"}
              size={28}
              color={isStarred ? "#FFD233" : "lightgray"}
              onPress={handleRemoveCustomDrink}
            />
          </Flex>
          {/* 텍스트 영역 */}
          <Flex width="70%" flexDirection="column">
            <Flex {...savedInfoStyles.flexStart}>
              <Text fontWeight="bold">{data.manuf}</Text> {/* 제조사명 */}
            </Flex>
            <Flex {...savedInfoStyles.flexStart} mt={1}>
              <Text fontWeight="bold">{data.d_name}</Text> {/* 음료명 */}
            </Flex>
            <Flex {...savedInfoStyles.flexRow} mt={3}>
              <Flex direction="row">
                <Text color="#848484">당류: </Text> {/* 당류 */}
                <Text color="#848484">{formatValue(data.sugar)}g</Text>
              </Flex>
              <Flex direction="row" ml={4}>
                <Text color="#848484">카페인: </Text> {/* 카페인 */}
                <Text color="#848484">{formatValue(data.caffeine)}mg</Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex width="10%" justifyContent="flex-start" alignItems="center">
            <AntDesign
              name="plus"
              size={25}
              color="lightgray"
              onPress={handleAddIntake}
            />
          </Flex>
        </Flex>
      </Box>
    </TouchableWithoutFeedback>
  );
};

const SavedCustomDrinks = ({ onSelect }) => {
    const [customDrinks, setCustomDrinks] = useState([]);
  
    useEffect(() => {
        const fetchCustomDrinksData = async () => {
            try {
              const response = await getCustomDrinks();
              // 중복 제거 로직 개선
              const uniqueDrinksMap = new Map();
              response.forEach(drink => {
                uniqueDrinksMap.set(drink.d_id, {
                  ...drink,
                  manufacturer: drink.manuf, // 제조사명 매핑
                  drinkName: drink.d_name, // 음료명 매핑
                  // 기타 필요한 정보 추가
                });
              });
              const uniqueDrinks = Array.from(uniqueDrinksMap.values());
              console.log('Unique Drinks:', uniqueDrinks);
              setCustomDrinks(uniqueDrinks);
            } catch (error) {
              console.error("Error fetching custom drinks:", error);
            }
        };
          
          
  
      fetchCustomDrinksData();
    }, []);
  
    return (
      <FlatList
        data={customDrinks}
        renderItem={({ item }) => <CustomDrinkItem data={item} onSelect={onSelect} />}
        keyExtractor={(item) => item.d_id.toString()}
        contentContainerStyle={{
          alignItems: 'center', // 중앙 정렬
          paddingBottom: 20, // 아래쪽 패딩
          paddingHorizontal: 20, // 좌우 패딩 추가
          marginTop: 20, // 상단 마진 추가하여 탭과의 간격 조정
        }}
      />
    );
  };
  
  export default SavedCustomDrinks;
  
  const localStyles = StyleSheet.create({
    flatListContainer: {
      alignItems: 'center', // 중앙 정렬
      paddingBottom: 20, // 아래쪽 패딩
      marginTop: 20, // 상단 마진 추가하여 탭과의 간격 조정
    }
  });
