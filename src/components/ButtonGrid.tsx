import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import CalcButton from './Button';

// New layout:
// Row 1: AC  ⌫  %  ÷     ← ⌫ next to AC, % where () was
// Row 5: ()  0  .  =     ← () where +/- was, long press = +/-
const ROWS: ButtonValue[][] = [
  ['AC', '⌫', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['()', '0', '.', '='],
];

interface ButtonGridProps {
  onPress: (value: ButtonValue) => void;
  onLongPress?: (value: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
  dynamicSize?: number;
}

export default function ButtonGrid({
  onPress,
  onLongPress,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
  dynamicSize,
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
              onLongPress={onLongPress}
              isTablet={isTablet}
              isLandscape={isLandscape}
              isTabletLandscape={isTabletLandscape}
              isWide={false}
              dynamicSize={dynamicSize}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {},
  row: { flexDirection: 'row', justifyContent: 'center', marginVertical: 1 },
});