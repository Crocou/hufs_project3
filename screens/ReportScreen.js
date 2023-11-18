import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeBaseProvider, Text, useToast } from 'native-base';
import CircularProgress from '../components/CircularProgress';
import BasicProgress from '../components/BasicProgress';
import WeeklyProgress from '../components/WeeklyProgress';
import { getDrinkDataById, getTodayIntake, deleteIntake } from '../service/apiService';
import IntakeModal from '../components/IntakeModal'; // 여기에 모달 컴포넌트 임포트


function formatNutrientValue(value) {
  // 앞 자리 0을 제거하고 숫자로 변환합니다.
  const num = parseFloat(value);
  // 숫자가 정수인지 확인합니다.
  if (Number.isInteger(num)) {
    // 소수 부분 없이 문자열로 반환합니다.
    return num.toString();
  } else {
    // 소수 부분을 가진 숫자를 반환하지만 뒷부분 0은 제거합니다.
    return num.toFixed(1).replace(/\.0$/, '');
  }
}

export function ReportScreen({ }) {
  const toast = useToast();
  const isFocused = useIsFocused();
  const [intakes, setIntakes] = useState([]); // 오늘 섭취한 음료 데이터를 저장할 상태
  const [nutritionData, setNutritionData] = useState({
    sugar: 0,
    caffeine: 0,
    kcal: 0,
    protein: 0,
    natrium: 0,
    fat: 0,
  });

  const fetchNutritionData = async () => {
    try {
      // 현재 날짜에 해당하는 섭취 내역 가져오기
      const intakes = await getTodayIntake(); // getIntake() 대신 getTodayIntake() 사용
      setIntakes(intakes); // 오류 수정: 올바른 변수 이름을 사용

      // 각 섭취한 음료의 ID를 기반으로 영양 정보를 가져옵니다.
      const drinksPromises = intakes.map(intake => getDrinkDataById(intake.drink));
      const drinksData = await Promise.all(drinksPromises);

      // 섭취에 기반한 총 영양소 계산
      const totals = drinksData.reduce((acc, data) => {
        return {
          sugar: acc.sugar + parseFloat(data.sugar || '0'), // 문자열을 숫자로 변환, null 값은 '0'으로 처리
          caffeine: acc.caffeine + parseFloat(data.caffeine || '0'),
          kcal: acc.kcal + parseFloat(data.kcal || '0'),
          protein: acc.protein + parseFloat(data.protein || '0'),
          natrium: acc.natrium + parseFloat(data.natrium || '0'),
          fat: acc.fat + parseFloat(data.fat || '0'),
        };
      }, { sugar: 0, caffeine: 0, kcal: 0, protein: 0, natrium: 0, fat: 0 }); // 초기값 설정

      setNutritionData(totals);
    } catch (error) {
      console.error("영양 데이터를 불러오는데 실패했습니다", error);
    }
  };

  const refreshData = async () => {
    try {
      // 현재 날짜에 해당하는 섭취 내역 가져오기
      const intakes = await getTodayIntake();
      setIntakes(intakes);

      // 여기에 영양 데이터 새로고침 로직 추가
      // 예: 영양소 합계 계산 및 상태 업데이트
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  };

  const deleteIntakeItem = async (intake) => {
    try {
      // Date 객체 생성
      const dateObj = new Date(intake.date);

      // 날짜를 'YYYY-MM-DD' 형식으로 포맷팅
      const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      const intakeData = {
        ...intake,
        date: formattedDate
      };
      console.log("Deleting intake item:", intakeData);

      await deleteIntake(intakeData);

        toast.show({ title: "섭취 목록 변경 완료", duration: 100, placement: "top" });

      // 로컬 상태 업데이트
      setIntakes(currentIntakes =>
        currentIntakes.filter(i => !(i.date === intake.date && i.drink === intake.drink && i.time === intake.time))
      );
    } catch (error) {
      console.error("음료 삭제 실패", error);
    }
  };

  useEffect(() => {
    refreshData();
    fetchNutritionData();
  }, [isFocused]);

  const windowWidth = Dimensions.get('window').width;

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF',
      alignItems: 'center',
      padding: 10,
    },
    todayText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: windowWidth - 55,
    },
    textContainer: {
      justifyContent: 'flex-end'
    },
    circularProgressBox: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: 10,
      padding: 10,
      backgroundColor: '#FFF',
      width: windowWidth - 50,
      marginBottom: 20,
    },
    basicProgressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: windowWidth - 50,
      marginBottom: 20,
    },
    weekly: {
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      borderRadius: 10,
      backgroundColor: '#FFF',
      marginBottom: 20,
      width: windowWidth - 50,
      paddingRight: 10
    }
  });

  return (
    <NativeBaseProvider>
      <View style={dynamicStyles.container}>
        
        <View style={dynamicStyles.todayText}>
          <View style={dynamicStyles.textContainer}>
            <Text bold mb="0.5">Today</Text>
          </View>
          <View style={dynamicStyles.textContainer}>
            <Text fontSize="xs" color="lightgray" onPress={toggleModal}>더보기</Text>
            <IntakeModal isVisible={isModalVisible} onClose={toggleModal} intakes={intakes} onDeleteIntake={deleteIntakeItem} />
          </View>
        </View>

        <View style={dynamicStyles.circularProgressBox}>
          <CircularProgress nutrient="당류" currentAmount={formatNutrientValue(nutritionData.sugar)} goalAmount={50} unit="g" />
          <CircularProgress nutrient="카페인" currentAmount={formatNutrientValue(nutritionData.caffeine)} goalAmount={300} unit="mg" />
        </View>

        <View style={dynamicStyles.basicProgressContainer}>
          <BasicProgress nutrient="단백질" currentAmount={formatNutrientValue(nutritionData.protein)} goalAmount={40} unit="g" />
          <BasicProgress nutrient="지방" currentAmount={formatNutrientValue(nutritionData.fat)} goalAmount={30} unit="g" />
          <BasicProgress nutrient="나트륨" currentAmount={formatNutrientValue(nutritionData.natrium)} goalAmount={2000} unit="mg" />
          <BasicProgress nutrient="열량" currentAmount={formatNutrientValue(nutritionData.kcal)} goalAmount={2000} unit="kcal" />
        </View>

        <View style={dynamicStyles.todayText}>
          <View style={dynamicStyles.textContainer}>
            <Text bold mb="0.5">Weekly</Text>
          </View>
        </View>

        <View style={dynamicStyles.weekly}>
          <WeeklyProgress />
        </View>
      </View>
    </NativeBaseProvider>
  );
}