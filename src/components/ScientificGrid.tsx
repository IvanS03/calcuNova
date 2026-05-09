import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BUTTON_SIZE } from '../constants/layout';
import { ButtonValue } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

const SCI_ROWS: ButtonValue[][] = [
  ['sin(', 'cos(', 'tan(', 'π', 'e'],
  ['log(', 'ln(', '√(', 'x²', '^'],
  ['(', ')', '%', '⌫', 'AC'],
];

// Visual type for each button
type SciType = 'trig' | 'log' | 'const' | 'power' | 'paren' | 'action';

function getSciType(value: ButtonValue): SciType {
  if (['sin(', 'cos(', 'tan('].includes(value)) return 'trig';
  if (['log(', 'ln(', '√('].includes(value)) return 'log';
  if (['π', 'e'].includes(value)) return 'const';
  if (['x²', '^'].includes(value)) return 'power';
  if (['(', ')', '%'].includes(value)) return 'paren';
  return 'action'; // ⌫ AC
}

interface ScientificGridProps {
  onPress: (v: ButtonValue) => void;
  isTablet: boolean;
  isLandscape?: boolean;
}

export default function ScientificGrid({
  onPress,
  isTablet,
  isLandscape = false,
}: ScientificGridProps) {
  const { theme } = useTheme();

  const bp = isLandscape
    ? BUTTON_SIZE.landscape
    : isTablet
      ? BUTTON_SIZE.tablet
      : BUTTON_SIZE.phone;

  const btnHeight = isLandscape ? 38 : isTablet ? 46 : 38;
  const fontSize = isLandscape ? 11 : isTablet ? 15 : 13;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.scientificBg,
        marginBottom: isLandscape ? 4 : 6,
        borderRadius: 16,
        paddingVertical: isLandscape ? 4 : 8,
        paddingHorizontal: isLandscape ? 2 : 6,
      },
    ]}>
      {SCI_ROWS.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={[
            styles.row,
            { marginBottom: isLandscape ? 2 : 4 },
          ]}
        >
          {row.map(value => (
            <SciButton
              key={value}
              value={value}
              type={getSciType(value)}
              onPress={onPress}
              height={btnHeight}
              fontSize={fontSize}
              gap={isLandscape ? 2 : 3}
              theme={theme}
              isLandscape={isLandscape}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Individual scientific button ─────────────────────
function SciButton({
  value,
  type,
  onPress,
  height,
  fontSize,
  gap,
  theme,
  isLandscape,
}: {
  value: ButtonValue;
  type: SciType;
  onPress: (v: ButtonValue) => void;
  height: number;
  fontSize: number;
  gap: number;
  theme: any;
  isLandscape: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, []);

  // Colors by type
  const colors = getTypeColors(type, theme);

  // Superscript label for x² and ^
  const isSuper = value === 'x²' || value === '^';

  return (
    <Pressable
      onPress={() => onPress(value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.btnOuter, { margin: gap }]}
    >
      <Animated.View
        style={[
          styles.btn,
          {
            height,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Accent bar at top */}
        <View style={[
          styles.accentBar,
          { backgroundColor: colors.accent },
        ]} />

        {/* Label */}
        <View style={styles.labelRow}>
          {isSuper ? (
            // x² — split label with superscript
            <Text style={[styles.label, { color: colors.text, fontSize }]}>
              {value === 'x²' ? (
                <>
                  <Text>x</Text>
                  <Text style={{ fontSize: fontSize - 3 }}>²</Text>
                </>
              ) : (
                <>
                  <Text>x</Text>
                  <Text style={{ fontSize: fontSize - 3 }}>^n</Text>
                </>
              )}
            </Text>
          ) : (
            <Text
              style={[styles.label, { color: colors.text, fontSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {value}
            </Text>
          )}
        </View>

      </Animated.View>
    </Pressable>
  );
}

// ── Accent colors per type ───────────────────────────
function getTypeColors(type: SciType, theme: any) {
  switch (type) {
    case 'trig': return {
      bg: theme.scientificBtn,
      border: '#7119c322',
      accent: '#9b59f5',
      text: theme.scientificText,
    };
    case 'log': return {
      bg: theme.scientificBtn,
      border: '#2980b922',
      accent: '#5dade2',
      text: theme.scientificText,
    };
    case 'const': return {
      bg: theme.scientificBtn,
      border: '#27ae6022',
      accent: '#58d68d',
      text: theme.scientificText,
    };
    case 'power': return {
      bg: theme.scientificBtn,
      border: '#e67e2222',
      accent: '#f0a500',
      text: theme.scientificText,
    };
    case 'paren': return {
      bg: theme.btnFunction,
      border: theme.divider,
      accent: theme.divider,
      text: theme.expressionText,
    };
    case 'action': return {
      bg: theme.btnFunction,
      border: '#7119c344',
      accent: '#7119c3',
      text: theme.expressionText,
    };
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnOuter: {
    flex: 1,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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

});