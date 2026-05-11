import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

// ── Pages ────────────────────────────────────────────
const PAGE_A: ButtonValue[][] = [
  ['sin(', 'cos(', 'tan(', 'π'],
  ['log(', 'ln(', '√(', 'e'],
  ['x²', '^', '(', ')'],
];

const PAGE_B: ButtonValue[][] = [
  ['asin(', 'acos(', 'atan(', 'π'],
  ['sinh(', 'cosh(', 'tanh(', 'e'],
  ['x³', '1/x', 'cbrt(', 'abs('],
];

type SciType =
  | 'trig' | 'log' | 'const' | 'power'
  | 'paren' | 'inv' | 'hyp' | 'action';

function getSciType(value: ButtonValue): SciType {
  if (['sin(', 'cos(', 'tan('].includes(value)) return 'trig';
  if (['asin(', 'acos(', 'atan('].includes(value)) return 'inv';
  if (['sinh(', 'cosh(', 'tanh('].includes(value)) return 'hyp';
  if (['log(', 'ln(', '√(', 'cbrt(', 'abs('].includes(value)) return 'log';
  if (['π', 'e'].includes(value)) return 'const';
  if (['x²', 'x³', '^', '1/x', '10^(', 'e^('].includes(value)) return 'power';
  if (['(', ')'].includes(value)) return 'paren';
  return 'action';
}

// ── Color map ────────────────────────────────────────
function getTypeColors(type: SciType, theme: any) {
  switch (type) {
    case 'trig': return { bg: theme.scientificBtn, border: '#7119c322', accent: '#9b59f5', text: theme.scientificText };
    case 'inv': return { bg: theme.scientificBtn, border: '#8e44ad33', accent: '#c39bd3', text: theme.scientificText };
    case 'hyp': return { bg: theme.scientificBtn, border: '#1a527633', accent: '#3498db', text: theme.scientificText };
    case 'log': return { bg: theme.scientificBtn, border: '#2980b922', accent: '#5dade2', text: theme.scientificText };
    case 'const': return { bg: theme.scientificBtn, border: '#27ae6022', accent: '#58d68d', text: theme.scientificText };
    case 'power': return { bg: theme.scientificBtn, border: '#e67e2222', accent: '#f0a500', text: theme.scientificText };
    case 'paren': return { bg: theme.btnFunction, border: theme.divider, accent: theme.divider, text: theme.expressionText };
    case 'action': return { bg: theme.btnFunction, border: '#7119c344', accent: '#7119c3', text: theme.expressionText };
  }
}

// ── Derived sizes from dynamicSize ───────────────────
function deriveSizes(dynamicSize: number | undefined, fallbackHeight: number, fallbackFontSize: number, fallbackGap: number) {
  if (!dynamicSize) {
    return {
      btnHeight: fallbackHeight,
      fontSize: fallbackFontSize,
      gap: fallbackGap,
    };
  }
  return {
    btnHeight: Math.max(Math.floor(dynamicSize * 0.55), 28),
    fontSize: Math.max(Math.floor(dynamicSize * 0.18), 10),
    gap: Math.max(Math.floor(dynamicSize * 0.04), 2),
  };
}

// ── Main component ───────────────────────────────────
interface ScientificGridProps {
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
  dynamicSize?: number;
}

export default function ScientificGrid({
  onPress,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
  dynamicSize,
}: ScientificGridProps) {
  const { theme } = useTheme();
  const [pageB, setPageB] = useState(false);

  // Fallback sizes when dynamicSize is not provided
  const fallbackHeight = isTabletLandscape ? 44 : isLandscape ? 34 : isTablet ? 50 : 42;
  const fallbackFontSize = isTabletLandscape ? 13 : isLandscape ? 11 : isTablet ? 14 : 12;
  const fallbackGap = isLandscape || isTabletLandscape ? 2 : 3;

  const { btnHeight, fontSize, gap } = deriveSizes(
    dynamicSize,
    fallbackHeight,
    fallbackFontSize,
    fallbackGap,
  );

  const rows = pageB ? PAGE_B : PAGE_A;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.scientificBg,
        borderRadius: 16,
        marginBottom: isLandscape ? 4 : 6,
        paddingVertical: isLandscape ? 4 : 8,
        paddingHorizontal: isLandscape ? 2 : 6,
      },
    ]}>
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={[styles.row, { marginBottom: gap }]}
        >
          {/* Page buttons */}
          {row.map(value => (
            <SciButton
              key={value}
              value={value}
              type={getSciType(value)}
              onPress={onPress}
              btnHeight={btnHeight}
              fontSize={fontSize}
              gap={gap}
              theme={theme}
            />
          ))}

          {/* Fixed column: swap / ⌫ / AC per row */}
          {rowIdx === 0 && (
            <SwapButton
              pageB={pageB}
              onToggle={() => setPageB(v => !v)}
              btnHeight={btnHeight}
              fontSize={fontSize}
              gap={gap}
              theme={theme}
            />
          )}
          {rowIdx === 1 && (
            <SciButton
              value="⌫"
              type="action"
              onPress={onPress}
              btnHeight={btnHeight}
              fontSize={fontSize + 2}
              gap={gap}
              theme={theme}
            />
          )}
          {rowIdx === 2 && (
            <SciButton
              value="AC"
              type="action"
              onPress={onPress}
              btnHeight={btnHeight}
              fontSize={fontSize}
              gap={gap}
              theme={theme}
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ── SwapButton ───────────────────────────────────────
interface SwapButtonProps {
  pageB: boolean;
  onToggle: () => void;
  btnHeight: number;
  fontSize: number;
  gap: number;
  theme: any;
}

function SwapButton({
  pageB,
  onToggle,
  btnHeight,
  fontSize,
  gap,
  theme,
}: SwapButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.btnOuter, { margin: gap }]}
    >
      <Animated.View style={[
        styles.btn,
        {
          height: btnHeight,
          backgroundColor: pageB ? theme.btnOperator : theme.btnFunction,
          borderColor: theme.btnOperator,
          borderWidth: 1.5,
          borderRadius: 10,
          transform: [{ scale }],
          overflow: 'hidden',
        },
      ]}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: theme.btnOperator }]} />

        {/* Label */}
        <Text style={[
          styles.swapLabel,
          {
            color: pageB ? '#fff' : theme.btnOperator,
            fontSize: Math.max(fontSize - 1, 9),
          },
        ]}>
          {pageB ? 'INV' : 'f⁻¹'}
        </Text>

        {/* Page indicator dots */}
        <View style={styles.dotsRow}>
          <View style={[
            styles.dot,
            { backgroundColor: !pageB ? theme.btnOperator : '#ffffff44' },
          ]} />
          <View style={[
            styles.dot,
            { backgroundColor: pageB ? '#fff' : '#ffffff22' },
          ]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── SciButton ────────────────────────────────────────
interface SciButtonProps {
  value: ButtonValue;
  type: SciType;
  onPress: (v: ButtonValue) => void;
  btnHeight: number;
  fontSize: number;
  gap: number;
  theme: any;
}

function SciButton({
  value,
  type,
  onPress,
  btnHeight,
  fontSize,
  gap,
  theme,
}: SciButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = getTypeColors(type, theme);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4,
    }).start();
  }, []);

  return (
    <Pressable
      onPress={() => onPress(value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.btnOuter, { margin: gap }]}
    >
      <Animated.View style={[
        styles.btn,
        {
          height: btnHeight,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 10,
          transform: [{ scale }],
          overflow: 'hidden',
        },
      ]}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

        {/* Label */}
        <View style={styles.labelRow}>
          <Text
            style={[styles.label, { color: colors.text, fontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {value}
          </Text>
        </View>

      </Animated.View>
    </Pressable>
  );
}

// ── Styles ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Each button takes equal flex space
  btnOuter: {
    flex: 1,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  // Swap
  swapLabel: {
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingBottom: 6,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});