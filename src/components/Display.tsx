import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View
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
  selection?: { start: number; end: number };
  onSelectionChange?: (pos: number) => void;
  onDirectEdit?: (text: string) => void;
  editError?: string;
  showIncompleteWarning?: boolean;
}

// Number of visible lines in the expression area
const VISIBLE_LINES = 4;

export default function Display({
  expression,
  result,
  isTablet,
  isLandscape = false,
  isTabletLandscape = false,
  selection,
  onSelectionChange,
  onDirectEdit,
  editError = '',
  showIncompleteWarning = false,
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

  // ── 3-stage font size ───────────────────────────
  const exprFontSize =
    expression.length >= typo.thresholdSmall
      ? typo.expressionSmall
      : expression.length >= typo.thresholdMedium
        ? typo.expressionMedium
        : typo.expressionLarge;

  // Height of one line = fontSize × lineHeight factor
  const lineHeight = exprFontSize * 1.35;
  // Fixed height: always show VISIBLE_LINES lines
  const exprAreaHeight = lineHeight * VISIBLE_LINES + SPACE.sm * 2;

  // ── Animated values ──────────────────────────────
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.92)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const exprScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animRef.current?.stop();
    };
  }, []);

  // Auto-scroll to bottom so latest text is always visible
  useEffect(() => {
    requestAnimationFrame(() => {
      exprScrollRef.current?.scrollToEnd({ animated: true });
    });
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
    animateResult(result !== '' && editError === '');
  }, [result !== '', editError]);

  useEffect(() => {
    if (!mounted.current) return;
    Animated.timing(errorOpacity, {
      toValue: editError !== '' ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [editError !== '']);

  // ── Shared TextInput props ───────────────────────
  const inputProps = {
    value: expression,
    selection: selection,
    onSelectionChange: onSelectionChange
      ? ({ nativeEvent: { selection: sel } }: any) =>
        onSelectionChange(sel.start)
      : undefined,
    onChangeText: onDirectEdit,
    showSoftInputOnFocus: false,
    keyboardType: 'visible-password' as const,
    contextMenuHidden: true,
    caretHidden: false,
    editable: true,
    multiline: true,       // ← multiline enabled
    autoCorrect: false,
    autoCapitalize: 'none' as const,
    autoComplete: 'off' as const,
    spellCheck: false,
    importantForAutofill: 'no' as const,
    scrollEnabled: false,      // ScrollView handles scrolling
  };

  // ── Expression area — shared between portrait/landscape ──
  const ExpressionArea = (
    <View style={[
      styles.exprOuter,
      showIncompleteWarning && styles.exprOuterError,
      { height: exprAreaHeight },
    ]}>
      <ScrollView
        ref={exprScrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.exprScrollContent}
      >
        <TextInput
          {...inputProps}
          style={[
            styles.expression,
            {
              fontSize: exprFontSize,
              lineHeight: lineHeight,
              color: theme.expressionText,
              ...(Platform.OS === 'ios'
                ? { tintColor: theme.btnOperator }
                : { cursorColor: theme.btnOperator }),
            },
          ]}
          textAlignVertical="bottom"
          textAlign="right"
        />
      </ScrollView>
    </View>
  );

  // ── Sub-display (result / error) ─────────────────
  const SubDisplay = editError !== '' ? (
    <Animated.Text
      style={[styles.subText, { color: '#ff6b6b', opacity: errorOpacity }]}
    >
      ⚠ {editError}
    </Animated.Text>
  ) : (
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
  );

  // ════════════════════════════════════════════════
  // LANDSCAPE
  // ════════════════════════════════════════════════
  if (isAnyLandscape) {
    return (
      <View style={styles.landscapeContainer}>

        {/* Result — large, top */}
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

        {/* Expression — multiline, scrollable */}
        <View style={[
          styles.exprOuter,
          showIncompleteWarning && styles.exprOuterError,
          { flex: 1 },   // fill remaining space in landscape
        ]}>
          <ScrollView
            ref={exprScrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.exprScrollContent}
          >
            <TextInput
              {...inputProps}
              style={[
                styles.landscapeExpr,
                {
                  fontSize: exprFontSize,
                  lineHeight: lineHeight,
                  color: result !== ''
                    ? theme.resultText
                    : theme.expressionText,
                },
              ]}
              textAlignVertical="bottom"
              textAlign="right"
            />
          </ScrollView>
        </View>

        {editError !== '' && (
          <Animated.Text
            style={[styles.subText, { color: '#ff6b6b', opacity: errorOpacity }]}
          >
            {editError}
          </Animated.Text>
        )}

      </View>
    );
  }

  // ════════════════════════════════════════════════
  // PORTRAIT
  // ════════════════════════════════════════════════
  return (
    <View style={[
      styles.portraitContainer,
      {
        // Height: expression area + result line + padding
        height: isTablet
          ? UI_CHROME.displayTablet
          : UI_CHROME.displayPortrait,
      },
    ]}>
      {ExpressionArea}
      {SubDisplay}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Portrait ─────────────────────────────────────
  portraitContainer: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    justifyContent: 'flex-end',
    width: '100%',
  },

  // ── Expression area ──────────────────────────────
  exprOuter: {
    width: '100%',
    overflow: 'hidden',
  },
  exprOuterError: {
    borderLeftWidth: 2,
    borderLeftColor: '#ff453a55',
    borderRadius: 2,
  },
  exprScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  expression: {
    fontWeight: '300',
    letterSpacing: 0.3,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlignVertical: 'bottom',
    paddingVertical: SPACE.xs,
  },

  // ── Sub-display ───────────────────────────────────
  result: {
    fontWeight: '300',
    marginTop: SPACE.xs,
    textAlign: 'right',
  },
  subText: {
    fontSize: rf(13),
    fontWeight: '500',
    textAlign: 'right',
    marginTop: SPACE.xs,
  },

  // ── Landscape ────────────────────────────────────
  landscapeContainer: {
    flex: 1,
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
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'right',
  },
});