import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { getWeekIntake } from '../service/apiService';
import { Dimensions } from 'react-native'; // Dimensions를 임포트합니다.

const WeeklyProgress = () => {
    const [barData, setBarData] = useState([]);
    const screenWidth = Dimensions.get('window').width;

    const fetchWeekIntakeData = async () => {
        try {
            const weekIntakeData = await getWeekIntake();
            const formattedData = weekIntakeData.map(item => {
                return {
                    value: item.total_sugar, // 당 섭취량
                    label: item.day          // 요일 레이블
                };
            });
            setBarData(formattedData);
        } catch (error) {
            console.error('주간 섭취 데이터 로딩 실패:', error);
        }
    };

    useEffect(() => {
        fetchWeekIntakeData();
    }, []);

    return (
        <View style={{justifyContent: 'center', alignItems: 'center', padding: 10, paddingTop: 20}}>
        <BarChart
            yAxisThickness={0}
            xAxisThickness={0}
            data={barData}
            frontColor={'#B09FFF'}
            xAxisLabelTextStyle={{color: 'lightgray', textAlign: 'center', fontSize: 10}}
            yAxisTextStyle={{ color: 'lightgray', fontSize: 10}}
            barWidth={18}
            roundedTop
            roundedBottom
            hideRules
        /></View>
    );
};

export default WeeklyProgress;
