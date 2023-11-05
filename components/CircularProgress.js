import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const CircularProgress = ({ nutrient, currentAmount, goalAmount, unit }) => {
  const fill = (currentAmount / goalAmount) * 100;

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        rotation={0}
        size={96} 
        width={12} 
        fill={fill}
        tintColor="#ABE86E"
        backgroundColor="#EFF2F5"
        lineCap="round"
        style={styles.CircularProgress}
      >
        {(fill) => (
          <Text style={styles.percentText}>{`${Math.round(fill)}%`}</Text>
        )}
      </AnimatedCircularProgress>

      <View style={styles.textContainer} marginTop={8}> 
        <Text style={styles.nutrientText}>{nutrient}</Text>

        <Text style={styles.amountText} marginTop={4}>{`${currentAmount} / ${goalAmount} ${unit}`}</Text> 
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  CircularProgress: {
    marginBottom: 8, 
  },
  textContainer: {
    alignItems: 'center',
  },
  nutrientText: {
    fontSize: 14.4, 
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 12.8, 
    color: 'lightgray'
  },
  percentText: {
    fontSize: 9.6, 
    color: 'gray'
  },
});

export default CircularProgress;
