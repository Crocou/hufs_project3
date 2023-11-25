import React, { useState, useEffect } from "react";
import { Text, Flex, Box, useToast } from "native-base";
import { AntDesign } from '@expo/vector-icons';
import { FlatList, TouchableWithoutFeedback } from 'react-native';
import { getDrinkData, getFav, addFav, removeFav, addIntake } from "../service/apiService";
import SavedInfoFrame from "./SavedInfoFrame";

// 영양소 이름과 한국어 매핑 정보
const nutritionMapping = {
  sugar: "당류",
  caffeine: "카페인",
};


// 개별 저장 정보 항목 컴포넌트
const SavedFavItem = ({ data, onSelect, onRefresh }) => {
  const toast = useToast();
  const [isStarred, setIsStarred] = useState(false); // 즐겨찾기 여부 상태
  const formatValue = value => value % 1 === 0 ? Math.floor(value) : value;
  useEffect(() => {
    // 즐겨찾기 상태를 확인하는 함수
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await getFav();
        setIsStarred(favorites.some(fav => fav.drink === data.id)); // drink ID로 비교
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };
    checkFavoriteStatus();
  }, [data.id]);
  // 즐겨찾기 버튼을 처리하는 함수
  const handleStarPress = async () => {
    try {
      if (isStarred) {
        await removeFav(data.id);
        toast.show({ title: "즐겨찾기 해제 완료", duration: 1000, placement: "bottom" });
      } else {
        await addFav(data.id);
        toast.show({ title: "즐겨찾기 등록 완료", duration: 1000, placement: "bottom" });
      }
      setIsStarred(!isStarred); // 상태 반전
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }

  };
  // 섭취 정보를 추가하는 함수
  const handleAddIntake = async () => {
    try {
      // 현재 날짜와 시간을 가져옵니다.
      const currentDate = new Date();
      const formattedDateTime = `${currentDate.toISOString().split('T')[0]}`;
      const intakeData = {
        date: formattedDateTime,
        drink: data.id,
        time: currentDate.getHours() * 100 + currentDate.getMinutes() // HHMM 형식으로 변환 (이 부분은 필요에 따라 수정하실 수 있습니다.)
      };
      await addIntake(intakeData);
      toast.show({ title: "섭취 목록 추가 완료", duration: 1000, placement: "bottom"});
      console.log("Intake data added successfully.");
      onRefresh();
    } catch (error) {
      console.error("Error adding intake data:", error);
    }
  };
  // UI 구성 및 이벤트 핸들링
  return (
    <TouchableWithoutFeedback onPress={() => onSelect(data)}>
      <Box {...styles.box}>
        <Flex direction="row" width="100%">
          {/* 별 아이콘 */}
          <Flex mr="3" width="10%" justifyContent="flex-start" alignItems="center">
            <AntDesign
              name={isStarred ? "star" : "staro"}
              size={28}
              color={isStarred ? "#FFD233" : "lightgray"}
              onPress={handleStarPress}
            />
          </Flex>
          {/* 텍스트 영역 */}
          <Flex width="70%" flexDirection="column">
            <Flex {...styles.flexStart}>
              <Text fontWeight="bold">{data.manufacturer}</Text> {/* 제조사명 */}
            </Flex>
            <Flex {...styles.flexStart} mt={1}>
              <Text fontWeight="bold">{data.drinkName}</Text> {/* 음료명 */}
            </Flex>
            <Flex {...styles.flexRow} mt={3}>
              <Flex direction="row">
                <Text color="#848484">{nutritionMapping["sugar"]}: </Text> {/* 당류: */}
                <Text color="#848484">{formatValue(data["sugar"])}g</Text> {/* Updated this line */}
              </Flex>
              <Flex direction="row" ml={4}>
                <Text color="#848484">{nutritionMapping["caffeine"]}: </Text> {/* 카페인: */}
                <Text color="#848484">{formatValue(data["caffeine"])}mg</Text> {/* Updated this line */}
              </Flex>
            </Flex>
          </Flex>
          {/* 플러스 아이콘 */}
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

// 저장된 음료 정보 전체 목록을 관리하는 컴포넌트
const SavedFav = ({ onRefresh, onSelect }) => {
  const toast = useToast();
  const [savedData, setSavedData] = useState([]); // 저장된 음료 데이터 상태

  //즐겨찾기 음료 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const favorites = await getFav(); // 즐겨찾기 목록 가져오기
        const favoriteIds = new Set(favorites.map(fav => fav.drink)); // 즐겨찾기 음료 ID 목록 생성

        const allDrinks = await getDrinkData(); // 모든 음료 데이터 가져오기

        // 즐겨찾기에 포함된 음료만 필터링
        const filteredDrinks = allDrinks.filter(drink => favoriteIds.has(drink.d_id));

        // 필터링된 데이터 매핑
        const mappedData = filteredDrinks.map(item => ({
          drinkName: item.d_name,
          manufacturer: item.manuf,
          sugar: item.sugar,
          caffeine: item.caffeine,
          id: item.d_id,
          size: item.size,
          kcal: item.kcal,
          protein: item.protein,
          natrium: item.natrium,
          fat: item.fat,
          grade: item.grade,
          source: item.source
        }));

        setSavedData(mappedData);
      } catch (error) {
        console.error("Error fetching drinks:", error);
      }
    };

    fetchData();
  }, []);

  // savedData 상태 변화 추적
  useEffect(() => {
    console.log("savedData has been updated:", savedData);
  }, [savedData]);

  // UI 구성 및 리스트 렌더링
  return (
    <Flex
      direction="column"
      p={4}
      width="100%"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <FlatList
        data={savedData}
        renderItem={({ item }) => (
          <SavedFavItem
              data={item}
              onSelect={onSelect}
              onRefresh={onRefresh}
          />
      )}
        keyExtractor={(item, index) => item.id.toString()}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        onStartShouldSetResponderCapture={() => true}
      />
    </Flex>
  );
};

const styles = {
  box: {
    mt: 3,
    p: 3,
    borderRadius: "20%",
    borderWidth: "0.5px",
    borderColor: "lightgray",
    width: "100%",
    alignItems: "center"
  },
  flexStart: {
    direction: "row",
    width: "100%",
    alignItems: "flex-start"
  },
  flexRow: {
    direction: "row",
    width: "100%"
  }
};
export default SavedFav;


