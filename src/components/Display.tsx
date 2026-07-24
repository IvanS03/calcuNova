import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SPACE, TYPOGRAPHY, UI_CHROME } from '../constants/layout';
import { useTheme } from '../theme/ThemeContext';
import {
  formatExpressionForDisplay,
  formattedPosToRaw,
  rawPosToFormatted,
} from '../utils/expressionFormatter';
import { rf } from '../utils/responsive';

interface DisplayProps {
  expression:             string;
  result:                 string;
  isTablet:               boolean;
  isLandscape?:           boolean;
  isTabletLandscape?:     boolean;
  selection?:             { start: number; end: number };
  onSelectionChange?:     (pos: number) => void;
  onDirectEdit?:          (text: string) => void;
  editError?:             string;
  showIncompleteWarning?: boolean;
}

// Visible lines before scroll kicks in
const VISIBLE_LINES = 4;
// Average character width factor for fontWeight 300, letterSpacing 0.3
const CHAR_WIDTH_FACTOR = 0.58;

export default function Display({
  expression,
  result,
  isTablet,
  isLandscape       = false,
  isTabletLandscape = false,
  selection,
  onSelectionChange,
  onDirectEdit,
  editError             = '',
  showIncompleteWarning = false,
}: DisplayProps) {
  const { theme }        = useTheme();
  const { width: screenW } = useWindowDimensions();
  const isAnyLandscape   = isLandscape || isTabletLandscape;

  const typo = isTabletLandscape
    ? TYPOGRAPHY.tabletLandscape
    : isLandscape
    ? TYPOGRAPHY.landscape
    : isTablet
    ? TYPOGRAPHY.tablet
    : TYPOGRAPHY.phone;

  // ── 3-stage font size ───────────────────────────
  const exprFontSize =
    expression.length >= (typo as any).thresholdSmall
      ? (typo as any).expressionSmall
      : expression.length >= (typo as any).thresholdMedium
      ? typo.expressionMedium
      : typo.expressionLarge;

  const lineHeight     = exprFontSize * 1.35;
  const exprAreaHeight = lineHeight * VISIBLE_LINES + SPACE.sm * 2;

  // ── Compute chars per line ───────────────────────
  // Available width = screen minus horizontal padding on both sides
  const horizontalPadding = SPACE.md * 2;
  const availableWidth    = screenW - horizontalPadding;
  const charsPerLine      = Math.floor(
    availableWidth / (exprFontSize * CHAR_WIDTH_FACTOR)
  );

  // ── Format expression with term-aware line breaks ─
  const displayExpression = formatExpressionForDisplay(expression, charsPerLine);

  // Convert raw selection → formatted selection
  const displaySelection = selection
    ? {
        start: rawPosToFormatted(selection.start, displayExpression),
        end:   rawPosToFormatted(selection.end,   displayExpression),
      }
    : undefined;

  // ── Animated values ──────────────────────────────
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale   = useRef(new Animated.Value(0.92)).current;
  const errorOpacity  = useRef(new Animated.Value(0)).current;
  const mounted       = useRef(false);
  const animRef       = useRef<Animated.CompositeAnimation | null>(null);
  const exprScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animRef.current?.stop();
    };
  }, []);

  // Scroll to bottom so latest input is always visible
  useEffect(() => {
    requestAnimationFrame(() => {
      exprScrollRef.current?.scrollToEnd({ animated: false });
    });
  }, [displayExpression]);

  const animateResult = useCallback((showing: boolean) => {
    if (!mounted.current) return;
    animRef.current?.stop();
    animRef.current = Animated.parallel([
      Animated.timing(resultOpacity, {
        toValue:         showing ? 1 : 0,
        duration:        200,
        easing:          Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(resultScale, {
        toValue:         showing ? 1 : 0.92,
        useNativeDriver: true,
        speed:           20,
        bounciness:       4,
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
      toValue:         editError !== '' ? 1 : 0,
      duration:        150,
      useNativeDriver: true,
    }).start();
  }, [editError !== '']);

  // ── TextInput props ──────────────────────────────
  const inputProps = {
    // Display the formatted expression (with \n at term breaks)
    value:                displayExpression,
    selection:            displaySelection,

    onSelectionChange: onSelectionChange
      ? ({ nativeEvent: { selection: sel } }: any) => {
          // Convert formatted pos → raw pos before reporting up
          const rawPos = formattedPosToRaw(sel.start, displayExpression);
          onSelectionChange(rawPos);
        }
      : undefined,

    onChangeText: onDirectEdit
      ? (text: string) => {
          // Strip inserted \n before sending to calculator logic
          onDirectEdit(text.replace(/\n/g, ''));
        }
      : undefined,

    showSoftInputOnFocus: false,
    keyboardType:         'visible-password' as const,
    contextMenuHidden:    true,
    caretHidden:          false,
    editable:             true,
    multiline:            true,
    scrollEnabled:        false,  // outer ScrollView handles scrolling
    autoCorrect:          false,
    autoCapitalize:       'none' as const,
    autoComplete:         'off' as const,
    spellCheck:           false,
    importantForAutofill: 'no' as const,
  };

  // ── Expression area (shared portrait + landscape) ─
  const ExpressionArea = (isLandscape_: boolean) => (
    <View style={[
      styles.exprOuter,
      showIncompleteWarning && styles.exprOuterError,
      { height: exprAreaHeight },
    ]}>
      <ScrollView
        ref={exprScrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Portrait: content anchored to bottom (text grows upward)
        // Landscape: content anchored to top (text grows downward)
        contentContainerStyle={
          isLandscape_ ? styles.exprContentTop : styles.exprContentBottom
        }
      >
        <TextInput
          {...inputProps}
          style={[
            styles.expression,
            {
              fontSize:   exprFontSize,
              lineHeight: lineHeight,
              color: (isLandscape_ && result !== '')
                ? theme.resultText
                : theme.expressionText,
              ...(Platform.OS === 'ios'
                ? { tintColor: theme.btnOperator }
                : { cursorColor: theme.btnOperator }),
            },
          ]}
          textAlignVertical={isLandscape_ ? 'top' : 'bottom'}
          textAlign="right"
        />
      </ScrollView>
    </View>
  );

  // ── Sub-display ───────────────────────────────────
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
          fontSize:  typo.resultSize,
          color:     theme.resultText,
          opacity:   resultOpacity,
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
            {
              fontSize: typo.resultSize,
              color:    theme.btnOperator,
              opacity:  resultOpacity,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {result !== '' ? result : ' '}
        </Animated.Text>

        <View style={[styles.landscapeSeparator, { backgroundColor: theme.divider }]} />

        {/* Same expression area as portrait, top-anchored */}
        {ExpressionArea(true)}

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
        height: isTablet
          ? UI_CHROME.displayTablet
          : UI_CHROME.displayPortrait,
      },
    ]}>
      {ExpressionArea(false)}
      {SubDisplay}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Portrait ─────────────────────────────────────
  portraitContainer: {
    paddingHorizontal: SPACE.md,
    paddingVertical:   SPACE.sm,
    justifyContent:    'flex-end',
    width:             '100%',
  },

  // ── Expression area ──────────────────────────────
  exprOuter: {
    width:    '100%',
    overflow: 'hidden',
  },
  exprOuterError: {
    borderLeftWidth:  2,
    borderLeftColor: '#ff453a55',
    borderRadius:     2,
  },

  // Portrait: content sticks to bottom (new lines push up)
  exprContentBottom: {
    flexGrow:       1,
    justifyContent: 'flex-end',
  },
  // Landscape: content sticks to top (new lines push down)
  exprContentTop: {
    flexGrow:       1,
    justifyContent: 'flex-start',
  },

  expression: {
    fontWeight:      '300',
    letterSpacing:    0.3,
    backgroundColor: 'transparent',
    borderWidth:      0,
    paddingVertical:  SPACE.xs,
  },

  // ── Sub-display ───────────────────────────────────
  result: {
    fontWeight: '300',
    marginTop:  SPACE.xs,
    textAlign:  'right',
  },
  subText: {
    fontSize:   rf(13),
    fontWeight: '500',
    textAlign:  'right',
    marginTop:  SPACE.xs,
  },

  // ── Landscape ────────────────────────────────────
  landscapeContainer: {
    flex:              1,
    paddingHorizontal: SPACE.md,
    paddingTop:        SPACE.sm,
    paddingBottom:     SPACE.sm,
  },
  landscapeResult: {
    fontWeight:    '200',
    letterSpacing: -1,
    textAlign:     'right',
    marginBottom:  SPACE.xs,
    minHeight:     rf(54),
    width:         '100%',
  },
  landscapeSeparator: {
    height:         StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
  },
});