import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BUTTON_SIZE } from '../constants/layout';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

// ── Page A: standard scientific ──────────────────────
const PAGE_A: ButtonValue[][] = [
  ['sin(', 'cos(', 'tan(', 'π'],
  ['log(', 'ln(', '√(', 'e'],
  ['x²', '^', '(', ')'],
];

// ── Page B: advanced / inverse ───────────────────────
const PAGE_B: ButtonValue[][] = [
  ['asin(', 'acos(', 'atan(', 'π'],
  ['sinh(', 'cosh(', 'tanh(', 'e'],
  ['x³', '1/x', 'cbrt(', 'abs('],
];

// Fixed buttons always visible (rightmost column position)
// Placed separately outside the page rows

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
  if (['(', ')',].includes(value)) return 'paren';
  return 'action';
}

interface ScientificGridProps {
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;  // ← nuevo
}

export default function ScientificGrid({
  onPress,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
}: ScientificGridProps) {
  const { theme } = useTheme();
  const [pageB, setPageB] = useState(false);

  const bp = isTabletLandscape
    ? BUTTON_SIZE.tabletLandscape
    : isLandscape
      ? BUTTON_SIZE.landscape
      : isTablet
        ? BUTTON_SIZE.tablet
        : BUTTON_SIZE.phone;

  const btnHeight = isTabletLandscape ? 44
    : isLandscape ? 34
      : isTablet ? 40
        : 42;

  const fontSize = isTabletLandscape ? 13
    : isLandscape ? 11
      : isTablet ? 12
        : 12;

  const gap = isLandscape || isTabletLandscape ? 2 : 3;

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
          style={[styles.row, { marginBottom: isLandscape ? 2 : 4 }]}
        >
          {/* Page buttons */}
          {row.map(value => (
            <SciButton
              key={value}
              value={value}
              type={getSciType(value)}
              onPress={onPress}
              height={btnHeight}
              fontSize={fontSize}
              gap={gap}
              theme={theme}
            />
          ))}

          {/* Fixed column: swap on row 0, ⌫ on row 1, AC on row 2 */}
          {rowIdx === 0 && (
            <SwapButton
              pageB={pageB}
              onToggle={() => setPageB(v => !v)}
              height={btnHeight}
              gap={gap}
              theme={theme}
              fontSize={fontSize}
            />
          )}
          {rowIdx === 1 && (
            <SciButton
              value="⌫"
              type="action"
              onPress={onPress}
              height={btnHeight}
              fontSize={fontSize + 2}
              gap={gap}
              theme={theme}
              fixedWidth
            />
          )}
          {rowIdx === 2 && (
            <SciButton
              value="AC"
              type="action"
              onPress={onPress}
              height={btnHeight}
              fontSize={fontSize}
              gap={gap}
              theme={theme}
              fixedWidth
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ── Swap toggle button ───────────────────────────────
function SwapButton({
  pageB, onToggle, height, gap, theme, fontSize,
}: {
  pageB: boolean;
  onToggle: () => void;
  height: number;
  gap: number;
  theme: any;
  fontSize: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={() => Animated.spring(scale, {
        toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4,
      }).start()}
      onPressOut={() => Animated.spring(scale, {
        toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4,
      }).start()}
      style={[styles.btnOuter, { margin: gap }]}
    >
      <Animated.View style={[
        styles.btn,
        {
          height,
          backgroundColor: pageB ? theme.btnOperator : theme.btnFunction,
          borderColor: theme.btnOperator,
          borderWidth: 1.5,
          borderRadius: 10,
          transform: [{ scale }],
          overflow: 'hidden',
        },
      ]}>
        {/* Accent bar */}
        <View style={[
          styles.accentBar,
          { backgroundColor: theme.btnOperator },
        ]} />

        <Text style={[
          styles.swapLabel,
          {
            color: pageB ? '#fff' : theme.btnOperator,
            fontSize: fontSize - 1,
          },
        ]}>
          {pageB ? 'INV' : 'f⁻¹'}
        </Text>

        {/* Dot indicator */}
        <View style={styles.dotsRow}>
          <View style={[
            styles.dot,
            { backgroundColor: !pageB ? theme.btnOperator : '#ffffff66' },
          ]} />
          <View style={[
            styles.dot,
            { backgroundColor: pageB ? '#fff' : '#ffffff33' },
          ]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Individual sci button ────────────────────────────
function SciButton({
  value, type, onPress, height, fontSize, gap, theme, fixedWidth = false,
}: {
  value: ButtonValue;
  type: SciType;
  onPress: (v: ButtonValue) => void;
  height: number;
  fontSize: number;
  gap: number;
  theme: any;
  fixedWidth?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const colors = getTypeColors(type, theme);

  return (
    <Pressable
      onPress={() => onPress(value)}
      onPressIn={() => Animated.spring(scale, {
        toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4,
      }).start()}
      onPressOut={() => Animated.spring(scale, {
        toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4,
      }).start()}
      style={[styles.btnOuter, { margin: gap }]}
    >
      <Animated.View style={[
        styles.btn,
        {
          height,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 10,
          transform: [{ scale }],
          overflow: 'hidden',
        },
      ]}>
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

        <View style={styles.labelRow}>
          <Text
            style={[styles.label, { color: colors.text, fontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value}
          </Text>
        </View>

      </Animated.View>
    </Pressable>
  );
}

// ── Color map ────────────────────────────────────────
function getTypeColors(type: SciType, theme: any) {
  switch (type) {
    case 'trig': return { bg: theme.scientificBtn, border: '#7119c322', accent: '#9b59f5', text: theme.scientificText };
    case 'inv': return { bg: theme.scientificBtn, border: '#8e44ad33', accent: '#c39bd3', text: theme.scientificText };
    case 'hyp': return { bg: theme.scientificBtn, border: '#1a5276aa', accent: '#3498db', text: theme.scientificText };
    case 'log': return { bg: theme.scientificBtn, border: '#2980b922', accent: '#5dade2', text: theme.scientificText };
    case 'const': return { bg: theme.scientificBtn, border: '#27ae6022', accent: '#58d68d', text: theme.scientificText };
    case 'power': return { bg: theme.scientificBtn, border: '#e67e2222', accent: '#f0a500', text: theme.scientificText };
    case 'paren': return { bg: theme.btnFunction, border: theme.divider, accent: theme.divider, text: theme.expressionText };
    case 'action': return { bg: theme.btnFunction, border: '#7119c344', accent: '#7119c3', text: theme.expressionText };
  }
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnOuter: { flex: 1 },
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
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  typeTag: {
    position: 'absolute',
    bottom: 3,
    fontSize: 7,
    fontWeight: '500',
    opacity: 0.7,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // Swap button
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