import React, { useState, useEffect } from "react";
import { Text, Flex, Box } from "native-base";
import { AntDesign } from '@expo/vector-icons';
import { FlatList, TouchableWithoutFeedback } from 'react-native';
import { getDrinkData, getFav, addFav, removeFav } from "../service/apiService"; // Removed getToken

const nutritionMapping = {
  sugar: "당류",
  caffeine: "카페인",
};

export const SavedInfoItem = ({ data, onSelect }) => {
  const [isStarred, setIsStarred] = useState(false);
  const formatValue = value => value % 1 === 0 ? Math.floor(value) : value;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await getFav(); // userId를 전달하지 않음
        setIsStarred(favorites.some(fav => fav.drinkId === data.id));
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
              onPress={() => {/* Place your onPress logic here */ }}
            />
          </Flex>

        </Flex>
      </Box>
    </TouchableWithoutFeedback>
  );
};

const SavedInfo = ({ searchTerm, onSelect }) => {
  const [savedData, setSavedData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDrinkData(page);
        console.log("Response from getDrinkData:", response);
        if (Array.isArray(response)) {
          const mappedData = response.map(item => ({
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
          setSavedData(prevData => [...prevData, ...mappedData]);
        } else {
          console.error("Expected an array but received:", response.data);
        }
      } catch (error) {
        console.error("Error fetching drinks:", error);
      }
    };

    fetchData();
  }, [page]);


  const handleEndReached = () => {
    const totalPages = Math.ceil(totalItems / 10);
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
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
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
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
