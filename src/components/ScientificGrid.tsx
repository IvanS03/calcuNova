import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

const SCI_ROWS: ButtonValue[][] = [
  ['sin(', 'cos(', 'tan(', 'π',  'e'  ],
  ['log(', 'ln(',  '√(',   'x²', '^'  ],
  ['(',    ')',    '%',    '⌫',  'AC' ],
];

interface ScientificGridProps {
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
}

export default function ScientificGrid({ onPress, isTablet }: ScientificGridProps) {
  const { theme } = useTheme();
  const btnHeight = isTablet ? 48 : 40;
  const fontSize  = isTablet ? 17 : 14;

  return (
    <View style={[styles.container, { backgroundColor: theme.scientificBg }]}>
      {SCI_ROWS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map(value => (
            <TouchableOpacity
              key={value}
              onPress={() => onPress(value)}
              activeOpacity={0.7}
              style={[
                styles.btn,
                {
                  backgroundColor: theme.scientificBtn,
                  height: btnHeight,
                  borderRadius: 8,
                  margin: isTablet ? 5 : 3,
                  borderWidth: 1,
                  borderColor: theme.divider,
                  // Highlight AC and ⌫ differently
                  ...(value === 'AC' || value === '⌫'
                    ? { backgroundColor: theme.btnFunction }
                    : {}),
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: (value === 'AC' || value === '⌫')
                      ? theme.expressionText
                      : theme.scientificText,
                    fontSize,
                  },
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical:      10,
    paddingHorizontal:    8,
    borderTopLeftRadius:  16,
    borderTopRightRadius: 16,
  },
  row: {
    flexDirection:  'row',
    justifyContent: 'center',
    marginBottom:   4,
  },
  btn: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    marginHorizontal: 3,
  },
  label: {
    fontWeight: '500',
  },
});