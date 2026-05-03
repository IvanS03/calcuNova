import React, { useCallback } from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  value: ButtonValue;
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
  isWide?: boolean;
}

function getButtonType(value: ButtonValue): 'function' | 'operator' | 'number' {
  if (['AC', '%', '⌫', '()'].includes(value)) return 'function';
  if (['+', '-', '×', '÷', '='].includes(value)) return 'operator';
  return 'number';
}

export default function CalcButton({ value, onPress, isTablet, isWide = false }: ButtonProps) {
  const { theme } = useTheme();
  const type = getButtonType(value);
  const size = isTablet ? 88 : 72;
  const gap  = isTablet ? 14 : 10;

  const bgColor = type === 'operator'
    ? theme.btnOperator
    : type === 'function'
    ? theme.btnFunction
    : theme.btnNumber;

  const textColor = type === 'operator'
    ? theme.btnTextOperator
    : type === 'function'
    ? theme.btnTextFunction
    : theme.btnTextNumber;

  const buttonStyle: ViewStyle = {
    backgroundColor: bgColor,
    width: isWide ? size * 2 + gap : size,
    height: size,
    borderRadius: size / 2,
    justifyContent: 'center',
    alignItems: isWide ? 'flex-start' : 'center',
    paddingLeft: isWide ? size / 2 : 0,
    margin: isTablet ? 7 : 5,
    borderWidth: type === 'number' ? 1 : 0,
    borderColor: theme.btnNumberBorder,
    shadowColor: type === 'operator' ? '#7119c3' : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: type === 'operator' ? 0.45 : 0,
    shadowRadius: 8,
    elevation: type === 'operator' ? 6 : 0,
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize: isTablet ? 30 : 24,
    fontWeight: '400',
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={useCallback(() => onPress(value), [value, onPress])}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{value}</Text>
    </TouchableOpacity>
  );
}