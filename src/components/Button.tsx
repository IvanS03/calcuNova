import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { BUTTON_SIZE } from '../constants/layout';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  value: ButtonValue;
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
  isWide?: boolean;
  dynamicSize?: number; // ← overrides everything when set
}

function getButtonType(value: ButtonValue): 'function' | 'operator' | 'number' {
  if (['AC', '+/-', '()', '%', '⌫'].includes(value)) return 'function';
  if (['+', '-', '×', '÷', '='].includes(value)) return 'operator';
  return 'number';
}

export default function CalcButton({
  value,
  onPress,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
  isWide = false,
  dynamicSize,
}: ButtonProps) {
  const { theme } = useTheme();
  const type = getButtonType(value);

  const bp = isTabletLandscape
    ? BUTTON_SIZE.tabletLandscape
    : isLandscape
      ? BUTTON_SIZE.landscape
      : isTablet
        ? BUTTON_SIZE.tablet
        : BUTTON_SIZE.phone;

  // Dynamic size overrides token size — gap and font scale proportionally
  const size = dynamicSize ?? bp.size;
  const gap = dynamicSize ? Math.max(Math.floor(dynamicSize * 0.06), 2) : bp.gap;
  const fontSize = dynamicSize ? Math.max(Math.floor(dynamicSize * 0.32), 12) : bp.fontSize;

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.91, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

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
    width: isWide ? size * 2 + gap * 2 : size,
    height: size,
    borderRadius: size / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: gap,
    borderWidth: type === 'number' ? StyleSheet.hairlineWidth : 0,
    borderColor: theme.btnNumberBorder,
    shadowColor: type === 'operator' ? '#7119c3' : 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: type === 'operator' ? 0.35 : 0,
    shadowRadius: 6,
    elevation: type === 'operator' ? 4 : 0,
  };

  const textStyle: TextStyle = {
    color: textColor,
    fontSize,
    fontWeight: '400',
    includeFontPadding: false,
    textAlignVertical: 'center',
  };

  return (
    <Pressable
      onPress={() => onPress(value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[buttonStyle, { transform: [{ scale }] }]}>
        <Text style={textStyle} numberOfLines={1}>
          {value}
        </Text>
      </Animated.View>
    </Pressable>
  );
}