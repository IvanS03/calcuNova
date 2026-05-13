import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SPACE, TYPOGRAPHY, UI_CHROME } from '../constants/layout';
import { useTheme } from '../theme/ThemeContext';
import { rf } from '../utils/responsive';

interface DisplayProps {
  expression: string;
  result: string;
  isTablet: boolean;
  isLandscape?: boolean;
  isTabletLandscape?: boolean;
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

  const isAnyLandscape = isLandscape || isTabletLandscape;

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
  const resultScale = useRef(new Animated.Value(0.92)).current;
  const mounted = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animRef.current?.stop();
    };
  }, []);

  const animateResult = useCallback((showing: boolean) => {
    if (!mounted.current) return;
    animRef.current?.stop();
    animRef.current = Animated.parallel([
      Animated.timing(resultOpacity, {
        toValue: showing ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(resultScale, {
        toValue: showing ? 1 : 0.92,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
    ]);
    animRef.current.start(({ finished }) => {
      if (!finished || !mounted.current) return;
      animRef.current = null;
    });
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    animateResult(result !== '');
  }, [result !== '']);

  // ── LANDSCAPE ──────────────────────────────────
  if (isAnyLandscape) {
    return (
      <View style={styles.landscapeContainer}>
        <Animated.Text
          style={[
            styles.landscapeResult,
            {
              fontSize: typo.resultSize,
              color: theme.btnOperator,
              opacity: resultOpacity,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {result !== '' ? result : ' '}
        </Animated.Text>

        <View style={[styles.landscapeSeparator, { backgroundColor: theme.divider }]} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.landscapeExprScroll}
        >
          <Text
            style={[
              styles.landscapeExpr,
              {
                fontSize: exprFontSize,
                color: result !== '' ? theme.resultText : theme.expressionText,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
          >
            {expression}
          </Text>
        </ScrollView>

        {onBackspace && (
          <TouchableOpacity
            onPress={onBackspace}
            activeOpacity={0.6}
            style={styles.landscapeBackspace}
          >
            <Text style={[styles.landscapeBackspaceIcon, { color: theme.resultText }]}>
              ⌫
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── PORTRAIT — height from UI_CHROME (percentage-based) ──
  return (
    <View style={[
      styles.portraitContainer,
      {
        // Height from UI_CHROME which is now hp() based
        height: isTablet ? UI_CHROME.displayTablet : UI_CHROME.displayPortrait,
      },
    ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text
          style={[
            styles.expression,
            { fontSize: exprFontSize, color: theme.expressionText },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {expression}
        </Text>
      </ScrollView>

      <Animated.Text
        style={[
          styles.result,
          {
            fontSize: typo.resultSize,
            color: theme.resultText,
            opacity: resultOpacity,
            transform: [{ scale: resultScale }],
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
  // ── Portrait ─────────────────────────────────────
  portraitContainer: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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
    marginTop: SPACE.xs,
  },

  // ── Landscape ────────────────────────────────────
  landscapeContainer: {
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.sm,
  },
  landscapeResult: {
    fontWeight: '200',
    letterSpacing: -1,
    textAlign: 'right',
    marginBottom: SPACE.xs,
    minHeight: rf(54),
  },
  landscapeSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
  },
  landscapeExprScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  landscapeExpr: {
    fontWeight: '300',
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  landscapeBackspace: {
    alignSelf: 'flex-end',
    marginTop: SPACE.sm,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
  },
  landscapeBackspaceIcon: {
    fontSize: rf(24),
    fontWeight: '300',
  },
});