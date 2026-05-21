import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { BUTTON_SIZE, SPACE } from '../constants/layout';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';
import { rf } from '../utils/responsive';

interface ButtonProps {
  value: ButtonValue;
  onPress: (v: ButtonValue) => void;
  onLongPress?: (v: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
  isWide?: boolean;
  dynamicSize?: number;
}

function getButtonType(value: ButtonValue): 'function' | 'operator' | 'number' {
  if (['AC', '⌫', '()', '%'].includes(value)) return 'function';
  if (['+', '-', '×', '÷', '='].includes(value)) return 'operator';
  return 'number';
}

// Buttons whose TEXT (not background) should be red
const RED_TEXT_BUTTONS: ButtonValue[] = ['AC', '⌫'];

// Buttons that support long press with a hint
const LONG_PRESS_HINTS: Partial<Record<ButtonValue, string>> = {
  '()': '+/-',
};

export default function CalcButton({
  value,
  onPress,
  onLongPress,
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

  const size = dynamicSize ?? bp.size;
  const gap = dynamicSize ? Math.max(Math.floor(dynamicSize * 0.06), 2) : bp.gap;
  const fontSize = dynamicSize ? Math.max(Math.floor(dynamicSize * 0.32), 12) : bp.fontSize;

  // Press scale animation
  const scale = useRef(new Animated.Value(1)).current;

  // Hint animation (for long-press tooltip)
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(8)).current;
  const [hintVisible, setHintVisible] = useState(false);

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

  const handleLongPress = useCallback(() => {
    if (!onLongPress) return;
    onLongPress(value);

    // Show hint
    setHintVisible(true);
    Animated.parallel([
      Animated.timing(hintOpacity, {
        toValue: 1, duration: 150, useNativeDriver: true,
      }),
      Animated.timing(hintTranslateY, {
        toValue: 0, duration: 150, useNativeDriver: true,
      }),
    ]).start(() => {
      // Auto-hide after 1.2s
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(hintOpacity, {
            toValue: 0, duration: 200, useNativeDriver: true,
          }),
          Animated.timing(hintTranslateY, {
            toValue: 8, duration: 200, useNativeDriver: true,
          }),
        ]).start(() => setHintVisible(false));
      }, 1200);
    });
  }, [value, onLongPress]);

  const bgColor = type === 'operator'
    ? theme.btnOperator
    : type === 'function'
      ? theme.btnFunction
      : theme.btnNumber;

  // Red text override for AC and ⌫
  const isRedText = RED_TEXT_BUTTONS.includes(value);
  const textColor = isRedText
    ? '#ff453a'
    : type === 'operator'
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
    fontWeight: isRedText ? '500' : '400',
    includeFontPadding: false,
    textAlignVertical: 'center',
  };

  const hint = LONG_PRESS_HINTS[value];

  return (
    <Pressable
      onPress={() => onPress(value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={hint ? handleLongPress : undefined}
      delayLongPress={400}
    >
      <Animated.View style={[buttonStyle, { transform: [{ scale }] }]}>
        <Text style={textStyle} numberOfLines={1}>
          {value}
        </Text>
      </Animated.View>

      {/* Long press hint tooltip */}
      {hint && hintVisible && (
        <Animated.View
          style={[
            styles.hint,
            { backgroundColor: theme.btnOperator },
            {
              opacity: hintOpacity,
              transform: [{ translateY: hintTranslateY }],
              // Center above button
              left: size / 2 - 36,
              bottom: size + gap + 4,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.hintText}>{hint}</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 72,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  hintText: {
    color: '#fff',
    fontSize: rf(12),
    fontWeight: '600',
  },
});