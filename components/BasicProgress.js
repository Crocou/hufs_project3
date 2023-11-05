import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Progress } from 'native-base';

const { width } = Dimensions.get('window');
const boxWidth = width * 0.2; // 박스를 화면 너비의 20%로 설정
const fontSizeMultiplier = boxWidth / 100; // 기준이 될 박스 너비에 대한 폰트 크기의 비율

const BasicProgress = ({ nutrient, currentAmount, goalAmount, unit }) => {
    const progressValue = (currentAmount / goalAmount) * 100;

    return (
        <View style={styles.container}>
            <View style={[styles.box, { width: boxWidth, height: boxWidth }]}>
                <Text style={[styles.nutrientText, { fontSize: 11 * fontSizeMultiplier }]}>
                    {`${nutrient} (${unit})`}
                </Text>
                <View style={[styles.progressBarContainer]}>
                    <Progress
                        value={progressValue}
                        _filledTrack={{
                            bg: "#9747FF"
                          }}
                        borderRadius={10 * fontSizeMultiplier}
                        style={styles.progressBar}
                    />
                </View>
                <Text style={[styles.amountText, { fontSize: 12 * fontSizeMultiplier }]}>
                    {`${currentAmount} / ${goalAmount}`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    box: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 10,
        padding: 5,
        alignItems: 'center', 
        justifyContent: 'space-around', 
    },
    progressBarContainer: {
        flexDirection: 'row',
        width: '80%', 
    },
    progressBar: {
        flex: 1,
        borderRadius: 10,
    },
    nutrientText: {
        fontWeight: 'bold',
    },
    amountText: {
        color: 'gray',

    },
});

export default BasicProgress;
