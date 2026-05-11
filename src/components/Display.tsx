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
import { SPACE, TYPOGRAPHY } from '../constants/layout';
import { useTheme } from '../theme/ThemeContext';

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

  // Animated values
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.92)).current;
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    const showing = result !== '';
    Animated.parallel([
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
    ]).start();
  }, [result !== '']);

  // ════════════════════════════════════════════════
  // LANDSCAPE — todo al top, uno debajo del otro
  // ════════════════════════════════════════════════
  if (isAnyLandscape) {
    return (
      <View style={styles.landscapeContainer}>

        {/* Result — grande arriba */}
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

        {/* Separator */}
        <View style={[
          styles.landscapeSeparator,
          { backgroundColor: theme.divider },
        ]} />

        {/* Expression — debajo del resultado */}
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
                color: result !== ''
                  ? theme.resultText
                  : theme.expressionText,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
          >
            {expression}
          </Text>
        </ScrollView>

        {/* ⌫ — justo debajo de la expresión */}
        {onBackspace && (
          <TouchableOpacity
            onPress={onBackspace}
            activeOpacity={0.6}
            style={styles.landscapeBackspace}
          >
            <Text style={[
              styles.landscapeBackspaceIcon,
              { color: theme.resultText },
            ]}>
              ⌫
            </Text>
          </TouchableOpacity>
        )}

      </View>
    );
  }

  // ════════════════════════════════════════════════
  // PORTRAIT LAYOUT — unchanged
  // ════════════════════════════════════════════════
  return (
    <View style={[
      styles.portraitContainer,
      isTablet && styles.portraitContainerTablet,
    ]}>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'flex-end',
    // Fixed height — buttons will fill the rest
    height: 160,   // matches UI_CHROME.displayPortrait
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
    marginTop: 6,
  },
  portraitContainerTablet: {
    height: 200,           // matches UI_CHROME.displayTablet
  },

  // ── Landscape ────────────────────────────────────
  landscapeContainer: {
    // Top-aligned — no flex, no justifyContent
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.sm,
  },

  // Result — big, top
  landscapeResultWrapper: {
    alignItems: 'flex-end',
    paddingTop: SPACE.xs,
    minHeight: 60,
    justifyContent: 'center',
  },
  landscapeResult: {
    fontWeight: '200',
    letterSpacing: -1,
    textAlign: 'right',
    marginBottom: SPACE.xs,
    minHeight: 54,      // reserved space even when empty
  },

  // Separator
  landscapeSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
  },

  // Expression — below result, smaller
  landscapeExprContainer: {
    flexShrink: 1,
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

  // ⌫ — bottom right
  landscapeBackspace: {
    alignSelf: 'flex-end',
    marginTop: SPACE.sm,   // tight below expression
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
  },
  landscapeBackspaceIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
});