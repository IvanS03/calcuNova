import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import CalcButton from './Button';

// Standard iOS calculator layout
// Last row: 0 (wide) + . + = = 4 columns exactly
const ROWS: ButtonValue[][] = [
  ['AC', '()', '%',  '÷'],
  ['7',  '8',   '9', '×'],
  ['4',  '5',   '6', '-'],
  ['1',  '2',   '3', '+'],
  ['0',  '.', '+/-', '='],  // '0' is wide, only 3 buttons here
];

interface ButtonGridProps {
  onPress: (value: ButtonValue) => void;
  isTablet: boolean;
}

export default function ButtonGrid({ onPress, isTablet }: ButtonGridProps) {
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
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 2,
  },
});