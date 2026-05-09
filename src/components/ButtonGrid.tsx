import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import CalcButton from './Button';

const ROWS: ButtonValue[][] = [
  ['AC', '+/-', '()', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

interface ButtonGridProps {
  onPress: (value: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
}

export default function ButtonGrid({
  onPress,
  isTablet,
  isLandscape = false,
}: ButtonGridProps) {
  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value) => (
            <CalcButton
              key={value}
              value={value}
              onPress={onPress}
              isTablet={isTablet}
              isLandscape={isLandscape}
              isWide={value === '0'}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    // No alignSelf or alignItems here — parent handles centering
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 1,
  },
});