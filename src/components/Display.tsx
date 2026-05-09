import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TYPOGRAPHY } from '../constants/layout';
import { useTheme } from '../theme/ThemeContext';

interface DisplayProps {
  expression: string;
  result: string;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
  // Only shown when explicitly passed (landscape two-column layout)
  onBackspace?: () => void;
}

export default function Display({
  expression,
  result,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
  onBackspace,
}: DisplayProps) {
  const { theme } = useTheme();

  const typo = isTabletLandscape
    ? TYPOGRAPHY.tabletLandscape
    : isLandscape
      ? TYPOGRAPHY.landscape
      : isTablet
        ? TYPOGRAPHY.tablet
        : TYPOGRAPHY.phone;

  const exprFontSize = expression.length > typo.displayThreshold
    ? typo.expressionMedium
    : typo.expressionLarge;

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    Animated.timing(resultOpacity, {
      toValue: result !== '' ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [result !== '']);

  return (
    <View style={[
      styles.container,
      (isLandscape || isTabletLandscape) && styles.containerLandscape,
    ]}>

      {/* ⌫ button — only in two-column landscape */}
      {onBackspace && (
        <TouchableOpacity
          onPress={onBackspace}
          activeOpacity={0.6}
          style={styles.backspaceBtn}
        >
          <Text style={[styles.backspaceIcon, { color: theme.resultText }]}>
            ⌫
          </Text>
        </TouchableOpacity>
      )}

      {/* Expression */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text
          style={[
            styles.expression,
            {
              fontSize: exprFontSize,
              color: theme.expressionText,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {expression}
        </Text>
      </ScrollView>

      {/* Live result */}
      <Animated.Text
        style={[
          styles.result,
          {
            fontSize: typo.resultSize,
            color: theme.resultText,
            opacity: resultOpacity,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        = {result}
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'flex-end',
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  containerLandscape: {
    minHeight: 80,
    paddingVertical: 10,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  expression: {
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  result: {
    fontWeight: '300',
    marginTop: 6,
  },
  // ⌫ in display
  backspaceBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 4,
  },
  backspaceIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
});