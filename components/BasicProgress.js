import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Center, Progress } from 'native-base';

const BasicProgress = ({ nutrient, currentAmount, goalAmount, unit }) => {
    const progressValue = (currentAmount / goalAmount) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.nutrientText}>{nutrient}</Text>

                <Progress
                    bg="#EFF2F5"
                    mt="3"
                    value={progressValue}
                    borderRadius={10} // 테두리 반경 설정
                    _filledTrack={{ bg: "#9747FF" }}
                    mx="4"
                />

                <Text style={styles.amountText}>{`${currentAmount} / ${goalAmount} ${unit}`}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    box: {
        borderWidth: 1, 
        borderColor: '#E8E8E8', 
        borderRadius: 10, 
        padding: 10, 
        marginBottom: 10, 
        width: '80%', 
    },
    nutrientText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    amountText: {
        fontSize: 10,
        color: 'gray',
        marginTop: 10,
    },
});

export default BasicProgress;
