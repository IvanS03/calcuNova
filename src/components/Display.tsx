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

  // Auto-scroll to end when expression grows
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animRef.current?.stop();
    };
  }, []);

  // Scroll to end when expression grows,
  // scroll to start when it resets to '0'
  useEffect(() => {
    if (expression === '0') {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    } else {
      scrollRef.current?.scrollToEnd({ animated: false });
    }
  }, [expression]);

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

        {/* ── Key fix: ScrollView needs own width, not from parent alignItems ── */}
        <View style={styles.exprWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exprScrollContent}
            // Prevent ScrollView from collapsing
            style={styles.exprScroll}
          >
            <Text
              style={[
                styles.landscapeExpr,
                {
                  fontSize: exprFontSize,
                  color: result !== '' ? theme.resultText : theme.expressionText,
                },
              ]}
            >
              {expression}
            </Text>
          </ScrollView>
        </View>

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

  // ── PORTRAIT ───────────────────────────────────
  return (
    <View style={[
      styles.portraitContainer,
      { height: isTablet ? UI_CHROME.displayTablet : UI_CHROME.displayPortrait },
    ]}>

      {/* ── Key fix: wrapper gives ScrollView a definite width ── */}
      <View style={styles.exprWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exprScrollContent}
          style={styles.exprScroll}
        >
          <Text
            style={[
              styles.expression,
              {
                fontSize: exprFontSize,
                color: theme.expressionText,
              },
            ]}
          >
            {expression}
          </Text>
        </ScrollView>
      </View>

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
    // No alignItems: 'flex-end' here — it breaks ScrollView width
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    justifyContent: 'flex-end',
    width: '100%',
  },

  // ── Shared scroll fix ────────────────────────────
  // Wrapper gives ScrollView a concrete width to fill
  exprWrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
  // ScrollView fills the wrapper and doesn't collapse
  exprScroll: {
    width: '100%',
  },
  // Content right-aligned — text grows leftward as expression gets longer
  exprScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: SPACE.xl,   // ensures short expressions don't snap to far left
  },

  expression: {
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  result: {
    fontWeight: '300',
    marginTop: SPACE.xs,
    textAlign: 'right',
    width: '100%',
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
    width: '100%',
  },
  landscapeSeparator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
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