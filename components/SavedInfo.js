import React, { useState, useEffect } from "react";
import { Text, Flex, Box } from "native-base";
import { AntDesign } from '@expo/vector-icons';
import { FlatList, TouchableWithoutFeedback } from 'react-native';
import { getDrinkData, getFav, addFav, removeFav } from "../service/apiService";

const nutritionMapping = {
  sugar: "당류",
  caffeine: "카페인",
};

const mapDrinkData = (item) => ({
  id: item.d_id,
  drinkName: item.d_name,
  manufacturer: item.manuf,
  sugar: item.sugar,
  caffeine: item.caffeine,
  // 추가적으로 필요한 데이터 필드를 매핑
});

export const SavedInfoItem = ({ data, onSelect }) => {
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await getFav();
        setIsStarred(favorites.some(fav => fav.drink === data.id));
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [data.id]);

  const handleStarPress = async () => {
    const action = isStarred ? removeFav : addFav;
    try {
      await action(data.id);
      setIsStarred(prev => !prev);
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => onSelect(data)}>
      <Box {...styles.box}>
        <Flex direction="row" width="100%">
          <Flex mr="3" width="10%" justifyContent="flex-start" alignItems="center">
            <AntDesign
              name={isStarred ? "star" : "staro"}
              size={28}
              color={isStarred ? "#FFD233" : "lightgray"}
              onPress={handleStarPress}
            />
          </Flex>
          <Flex width="70%" flexDirection="column">
            <Flex {...styles.flexStart}>
              <Text fontWeight="bold">{data.manufacturer}</Text>
            </Flex>
            <Flex {...styles.flexStart} mt={1}>
              <Text fontWeight="bold">{data.drinkName}</Text>
            </Flex>
            <Flex {...styles.flexRow} mt={3}>
              <Flex direction="row">
                <Text color="#848484">{nutritionMapping["sugar"]}: </Text>
                <Text color="#848484">{data.sugar}g</Text>
              </Flex>
              <Flex direction="row" ml={4}>
                <Text color="#848484">{nutritionMapping["caffeine"]}: </Text>
                <Text color="#848484">{data.caffeine}mg</Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex width="10%" justifyContent="flex-start" alignItems="center">
            <AntDesign
              name="plus"
              size={25}
              color="lightgray"
              onPress={() => {/* 여기에 onPress 로직 추가 */}}
            />
          </Flex>
        </Flex>
      </Box>
    </TouchableWithoutFeedback>
  );
};

const SavedInfo = ({ searchTerm, onSelect }) => {
  const [savedData, setSavedData] = useState([]);
  const [page, setPage] = useState(1); // 페이지 번호 상태 추가
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDrinkData(page); // 페이지 번호를 인자로 전달
        if (response && response.data && Array.isArray(response.data)) {
          const newData = response.data.map(mapDrinkData);
          setSavedData(prevData => [...prevData, ...newData]); // 기존 데이터에 새 데이터 추가
          setTotalItems(response.total);
        } else {
          console.error("Expected an array but received:", response);
        }
      } catch (error) {
        console.error("Error fetching drinks:", error);
      }
    };

    fetchData();
  }, [page]); // 페이지 번호가 변경될 때마다 데이터를 다시 로드

  const handleEndReached = () => {
    const totalPages = Math.ceil(totalItems / 10); // 페이지 크기가 10이라고 가정
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1); // 페이지 번호 증가
    }
  };

  const filteredData = searchTerm
    ? savedData.filter(item =>
        item.drinkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : savedData;

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
        data={filteredData}
        renderItem={({ item }) => <SavedInfoItem data={item} onSelect={onSelect} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        onEndReached={handleEndReached} // 스크롤이 끝에 도달했을 때의 이벤트 핸들러
        onEndReachedThreshold={0.1} // 스크롤이 얼마나 끝에 가까워져야 이벤트가 발생하는지 설정 (0.1은 10%)
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

export default SavedInfo;
