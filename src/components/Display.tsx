import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  selection?: { start: number; end: number } | undefined;
  onSelectionChange?: (pos: number) => void;
  onDirectEdit?: (text: string) => void;
  editError?: string;
  showIncompleteWarning?: boolean;  // ← triggered only on = press
}

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

  const exprFontSize = expression.length > typo.displayThreshold
    ? typo.expressionMedium
    : typo.expressionLarge;

  // ── Animated values ──────────────────────────────
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.92)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  // Scale uses useNativeDriver: true
  const opScale = useRef(new Animated.Value(1)).current;
  // Color uses useNativeDriver: false — kept SEPARATE from opScale
  const opColorAnim = useRef(new Animated.Value(0)).current;

  const mounted = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animRef.current?.stop();
    };
  }, []);

  // ── Operator pulse — only on showIncompleteWarning ─
  useEffect(() => {
    if (!mounted.current) return;

    if (showIncompleteWarning) {
      opScale.setValue(1);
      opColorAnim.setValue(0);

      // Scale animation — useNativeDriver: true (runs on UI thread)
      Animated.sequence([
        Animated.timing(opScale, {
          toValue: 1.4,
          duration: 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(opScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 16,
          bounciness: 10,
        }),
      ]).start();

      // Color animation — useNativeDriver: false (JS thread, separate from scale)
      Animated.sequence([
        Animated.timing(opColorAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.delay(600),
        Animated.timing(opColorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

    } else {
      // Reset immediately when user continues typing
      opScale.setValue(1);
      opColorAnim.setValue(0);
    }
  }, [showIncompleteWarning]);

  // Interpolate color for the last operator
  const opColor = opColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.expressionText, '#ff453a'],
  });

  // ── Result animation ─────────────────────────────
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

  // ── Error animation ──────────────────────────────
  useEffect(() => {
    if (!mounted.current) return;
    Animated.timing(errorOpacity, {
      toValue: editError !== '' ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [editError !== '']);

  // ── Scroll to end ────────────────────────────────
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      });
    });
  }, [expression]);

  // ── TextInput shared props ───────────────────────
  const inputProps = {
    value: expression,
    selection: selection,
    onSelectionChange: onSelectionChange
      ? ({ nativeEvent: { selection: sel } }: any) => onSelectionChange(sel.start)
      : undefined,
    onChangeText: onDirectEdit,
    showSoftInputOnFocus: false,
    caretHidden: false,
    editable: true,
    multiline: false,
    autoCorrect: false,
    autoCapitalize: 'none' as const,
    spellCheck: false,
    contextMenuHidden: false,
  };

  // ── Expression field ─────────────────────────────
  // When warning active: split last char with animated red color + scale
  // When normal: TextInput with cursor support
  const ExpressionField = showIncompleteWarning ? (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.exprScroll}
      contentContainerStyle={styles.exprScrollContent}
    >
      <Text
        style={[
          styles.expression,
          { fontSize: exprFontSize, color: theme.expressionText },
        ]}
        numberOfLines={1}
      >
        {expression.slice(0, -1)}
      </Text>
      <View
        style={{
          width: exprFontSize * 0.7,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.Text
          style={[
            styles.landscapeExpr,
            {
              fontSize: exprFontSize,
              color: opColor,
            },
          ]}
        >
          {expression.slice(-1)}
        </Animated.Text>
      </View>
    </ScrollView>
  ) : (
    <TextInput
      {...inputProps}
      style={[
        styles.expression,
        {
          fontSize: exprFontSize,
          color: theme.expressionText,
          ...(Platform.OS === 'ios'
            ? { tintColor: theme.btnOperator }
            : { cursorColor: theme.btnOperator }),
        },
      ]}
      textAlign="right"
    />
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

        <Animated.Text
          style={[
            styles.landscapeResult,
            { fontSize: typo.resultSize, color: theme.btnOperator, opacity: resultOpacity },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {result !== '' ? result : ' '}
        </Animated.Text>

        <View style={[styles.landscapeSeparator, { backgroundColor: theme.divider }]} />

        {showIncompleteWarning ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.exprScroll}
            contentContainerStyle={styles.exprScrollContentRight}
          >
            <Text
              style={[
                styles.landscapeExpr,
                { fontSize: exprFontSize, color: theme.expressionText },
              ]}
              numberOfLines={1}
            >
              {expression.slice(0, -1)}
            </Text>
            <View
              style={{
                width: exprFontSize * 0.7,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* scale → useNativeDriver: true  → Animated.View */}
              <Animated.Text
                style={[
                  styles.landscapeExpr,
                  {
                    fontSize: exprFontSize,
                    color: opColor,
                  },
                ]}>
                {/* color → useNativeDriver: false → Animated.Text */}
                {expression.slice(-1)}
              </Animated.Text>
            </View>
          </ScrollView>
        ) : (
          <TextInput
            {...inputProps}
            style={[
              styles.landscapeExpr,
              {
                fontSize: exprFontSize,
                color: result !== '' ? theme.resultText : theme.expressionText,
              },
            ]}
            textAlign="right"
          />
        )}

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
      { height: isTablet ? UI_CHROME.displayTablet : UI_CHROME.displayPortrait },
    ]}>
      {ExpressionField}
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
  expression: {
    fontWeight: '300',
    letterSpacing: 0.5,
    paddingVertical: SPACE.xs,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'right',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: rf(48),
    minHeight: rf(48),
  },
  exprScroll: {
    width: '100%',
  },
  exprScrollContent: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  exprScrollContentRight: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
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
    paddingVertical: SPACE.xs,
    textAlign: 'right',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: rf(48),
    minHeight: rf(48),
  },
});