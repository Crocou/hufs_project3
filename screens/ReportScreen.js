import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import CircularProgress from '../components/CircularProgress';
import BasicProgress from '../components/BasicProgress';
import { getDrinkDataById, getTodayIntake } from '../service/apiService';

export function ReportScreen({}) {
  const [nutritionData, setNutritionData] = useState({
    sugar: 0,
    caffeine: 0,
    kcal: 0,
    protein: 0,
    natrium: 0,
    fat: 0,
  });

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        // 현재 날짜에 해당하는 섭취 내역 가져오기
        const intakes = await getTodayIntake(); // getIntake() 대신 getTodayIntake() 사용
        // 각 섭취한 음료의 ID를 기반으로 영양 정보를 가져옵니다.
        const drinksPromises = intakes.map(intake => getDrinkDataById(intake.drink));
        const drinksData = await Promise.all(drinksPromises);
  
        // 섭취에 기반한 총 영양소 계산
        const totals = drinksData.reduce((acc, data) => {
          return {
            sugar: acc.sugar + data.sugar,
            caffeine: acc.caffeine + data.caffeine,
            kcal: acc.kcal + data.kcal,
            protein: acc.protein + data.protein,
            natrium: acc.natrium + data.natrium,
            fat: acc.fat + data.fat,
          };
        }, { ...nutritionData });
  
        setNutritionData(totals);
      } catch (error) {
        console.error("영양 데이터를 불러오는데 실패했습니다", error);
      }
    };
  
    fetchNutritionData();
  }, []);

  const windowWidth = Dimensions.get('window').width;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF', // Set background color to white
      alignItems: 'center',
      padding: 10,
    },
    circularProgressBox: {
      flexDirection: 'row',
      justifyContent: 'space-around', // This will give space between your CircularProgress components
      alignItems: 'center',
      borderWidth: 1, // Border for the box
      borderColor: '#E8E8E8', // Light grey border color
      borderRadius: 10, // Rounded corners for the border
      padding: 10, // Padding inside the box
      backgroundColor: '#FFF', // Set background color to white
      width: windowWidth - 50, // Width of the box with padding taken into account
      marginBottom: 20, // Margin at the bottom of the box
    },
    basicProgressContainer: {
      flexDirection: 'row', // Arrange BasicProgress components horizontally
      justifyContent: 'space-between', // Space between BasicProgress components
      alignItems: 'center',
      width: windowWidth - 50, // Adjust width to match the circularProgressBox
    },
  });

  return (
    <NativeBaseProvider>
      <View style={dynamicStyles.container}>
        {/* Box for CircularProgress components */}
        <View style={dynamicStyles.circularProgressBox}>
          <CircularProgress nutrient="당류" currentAmount={nutritionData.sugar} goalAmount={50} unit="g" />
          <CircularProgress nutrient="카페인" currentAmount={nutritionData.caffeine} goalAmount={60} unit="mg" />
        </View>

        {/* Container for BasicProgress components */}
        <View style={dynamicStyles.basicProgressContainer}>
          <BasicProgress nutrient="단백질" currentAmount={nutritionData.protein} goalAmount={40} unit="g" />
          <BasicProgress nutrient="지방" currentAmount={nutritionData.fat} goalAmount={30} unit="g" />
          <BasicProgress nutrient="나트륨" currentAmount={nutritionData.natrium} goalAmount={2000} unit="mg" />
          <BasicProgress nutrient="열량" currentAmount={nutritionData.kcal} goalAmount={2000} unit="kcal" />
        </View>

      </View>
    </NativeBaseProvider>
  );
}