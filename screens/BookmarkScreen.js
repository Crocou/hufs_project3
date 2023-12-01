import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import SavedCustomDrinks from '../components/SavedCustomDrinks';
import SavedFavDrinks from '../components/SavedFavDrinks';
import { getCustomDrinks } from '../service/apiService';
import SavedInfoFrame from '../components/SavedInfoFrame'; // Import the component

export function BookmarkScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customDrinks, setCustomDrinks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // State to handle modal visibility
  const [selectedDrink, setSelectedDrink] = useState(null); // State to hold the selected drink
  const [refreshKey, setRefreshKey] = useState(0);


  // 즐겨찾기 목록을 새로고침하는 함수
  const refreshFavorites = () => {
    setRefreshKey(oldKey => oldKey + 1); // 즐겨찾기 목록 새로고침을 위해 키를 업데이트
  };
  
  const handleSelectDrink = (selected) => {
    setSelectedDrink(selected);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDrink(null);
  };

  useEffect(() => {
    if (selectedIndex === 1) {
      (async () => {
        try {
          const response = await getCustomDrinks();
          setCustomDrinks(response.data);
        } catch (error) {
          console.error('Error fetching custom drinks:', error);
        }
      })();
    }
  }, [selectedIndex]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedIndex === 0 && styles.activeTab]}
          onPress={() => setSelectedIndex(0)}
        >
          <Text style={[styles.tabText, selectedIndex === 0 && styles.activeTabText]}>
            즐겨찾기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedIndex === 1 && styles.activeTab]}
          onPress={() => setSelectedIndex(1)}
        >
          <Text style={[styles.tabText, selectedIndex === 1 && styles.activeTabText]}>
            내가 생성
          </Text>
        </TouchableOpacity>
      </View>
      {selectedIndex === 0 ? (
        <SavedFavDrinks
          key={refreshKey} // 새로고침 키를 prop으로 전달
          onSelect={handleSelectDrink}
          onRefresh={refreshFavorites}
        />
      ) : (
        <SavedCustomDrinks onSelect={handleSelectDrink} customDrinks={customDrinks} /> // onSelect 핸들러 전달
      )}
      {selectedDrink && (
        <SavedInfoFrame
          visible={modalVisible}
          onClose={handleCloseModal}
          drinkInfo={selectedDrink}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 배경색을 흰색으로 설정
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7', // 탭의 배경색
    marginLeft: 100,
    marginRight: 100,
    marginTop: 20,
    borderRadius: 25, // 탭의 모서리를 둥글게
    height: 45, // 탭의 높이
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F7F7F7', // 비활성 탭의 배경색
    borderRadius: 25, // 탭의 모서리를 둥글게
    margin: 4, // 탭 사이의 간격
  },
  activeTab: {
    backgroundColor: '#9747FF', // 활성 탭의 배경색
    borderRadius: 25, // 탭의 모서리를 둥글게
    elevation: 2, // 안드로이드에 대한 그림자 효과
    shadowOffset: { width: 1, height: 1 }, // iOS에 대한 그림자 효과
    shadowColor: '#6c5ce7', // iOS에 대한 그림자 색
    shadowOpacity: 0.3, // iOS에 대한 그림자 불투명도
    shadowRadius: 3, // iOS에 대한 그림자 반경
  },
  tabText: {
    fontWeight: 'bold',
    color: '#B9BCBE', // 비활성 탭 텍스트 색상
  },
  activeTabText: {
    color: '#fff', // 활성 탭 텍스트 색상
  },
});


export default BookmarkScreen;