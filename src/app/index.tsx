import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ButtonGrid from '../components/ButtonGrid';
import Display from '../components/Display';
import ModeBar, { AppMode } from '../components/ModeBar';
import ScientificGrid from '../components/ScientificGrid';
import ThemeButton from '../components/ThemeButton';
import UnitConverter from '../components/UnitConverter';
import { CONTENT_PADDING, SPACE, UI_CHROME } from '../constants/layout';
import { useAnimatedMode } from '../hooks/useAnimatedMode';
import { useCalculator } from '../hooks/useCalculator';
import { useDynamicButtonSize } from '../hooks/useDynamicButtonSize';
import { useTheme } from '../theme/ThemeContext';
import { rf } from '../utils/responsive';

export default function Index() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { expression, result, handlePress } = useCalculator();
  const [appMode, setAppMode] = useState<AppMode>('basic');

  const isTablet = width >= 768;
  const isLandscape = width > height;
  const twoColumn = isLandscape && width >= 600;
  const isTabletLandscape = twoColumn && isTablet;
  const sciMode = appMode === 'scientific';

  const { dynamicSize } = useDynamicButtonSize({
    screenWidth: width,
    screenHeight: height,
    insetTop: insets.top,
    insetBottom: insets.bottom,
    insetLeft: insets.left,
    insetRight: insets.right,
    isTablet,
    isLandscape: twoColumn && !isTablet,
    isTabletLandscape,
    sciMode,
  });

  const { opacity, translateY } = useAnimatedMode(appMode);
  const animStyle = { opacity, transform: [{ translateY }] };

  // ── Buttons ──────────────────────────────────────
  const CalcButtons = (
    <View style={styles.buttonsCenter}>
      {sciMode && (
        <ScientificGrid
          onPress={handlePress}
          isTablet={isTablet}
          isLandscape={twoColumn && !isTablet}
          isTabletLandscape={isTabletLandscape}
          dynamicSize={dynamicSize}
        />
      )}
      <ButtonGrid
        onPress={handlePress}
        isTablet={isTablet}
        isLandscape={twoColumn && !isTablet}
        isTabletLandscape={isTabletLandscape}
        dynamicSize={dynamicSize}
      />
    </View>
  );

  // ════════════════════════════════════════════════
  // TWO-COLUMN — converter full width
  // ════════════════════════════════════════════════
  if (twoColumn && appMode === 'converter') {
    return (
      <View style={[
        styles.rootCol,
        { backgroundColor: theme.background },
        {
          paddingTop: insets.top + SPACE.xs,
          paddingBottom: insets.bottom + SPACE.xs,
          paddingLeft: insets.left + SPACE.md,
          paddingRight: insets.right + SPACE.md,
        },
      ]}>
        <View style={styles.topBar}>
          <ModeBar current={appMode} onChange={setAppMode} direction="horizontal" compact />
          <ThemeButton />
        </View>
        <Animated.View style={[styles.flex, animStyle]}>
          <UnitConverter isTablet={isTablet} />
        </Animated.View>
      </View>
    );
  }

  // ════════════════════════════════════════════════
  // TWO-COLUMN — calculator
  // ════════════════════════════════════════════════
  if (twoColumn) {
    return (
      <View style={[
        styles.rootRow,
        { backgroundColor: theme.background },
        {
          paddingTop: insets.top + SPACE.xs,
          paddingBottom: insets.bottom + SPACE.xs,
          paddingLeft: insets.left + SPACE.md,
          paddingRight: insets.right + SPACE.md,
        },
      ]}>

        {/* ── LEFT: buttons ─────────────────────── */}
        <View style={styles.leftCol}>
          {CalcButtons}
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: theme.divider }]} />

        {/* ── RIGHT: topbar + display ───────────── */}
        <View style={styles.rightCol}>
          <View style={styles.rightTopBar}>
            <ModeBar
              current={appMode}
              onChange={setAppMode}
              direction="horizontal"
              compact
            />
            <ThemeButton />
          </View>

          <Animated.View style={[styles.flex, animStyle]}>
            <Display
              expression={expression}
              result={result}
              isTablet={false}
              isLandscape={!isTablet}
              isTabletLandscape={isTabletLandscape}
              onBackspace={() => handlePress('⌫')}
            />
          </Animated.View>
        </View>

      </View>
    );
  }

  // ════════════════════════════════════════════════
  // SINGLE COLUMN — portrait
  // ════════════════════════════════════════════════
  return (
    <View style={[
      styles.rootCol,
      { backgroundColor: theme.background },
      {
        paddingTop: insets.top + SPACE.sm,
        paddingBottom: insets.bottom + SPACE.sm,
        paddingLeft: insets.left + (isTablet ? CONTENT_PADDING.tablet : CONTENT_PADDING.phone),
        paddingRight: insets.right + (isTablet ? CONTENT_PADDING.tablet : CONTENT_PADDING.phone),
      },
    ]}>

      {/* Top bar — fixed height via UI_CHROME.topBar */}
      <View style={[styles.topBar, { height: UI_CHROME.topBar }]}>
        <ModeBar
          current={appMode}
          onChange={setAppMode}
          direction="horizontal"
          compact={!isTablet}
        />
        <ThemeButton />
      </View>

      {appMode === 'converter' ? (
        <Animated.View style={[styles.flex, animStyle]}>
          <UnitConverter isTablet={isTablet} />
        </Animated.View>

      ) : (
        <Animated.View style={[styles.flex, animStyle]}>

          {/* Display — fixed height, no flex */}
          <Display
            expression={expression}
            result={result}
            isTablet={isTablet}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Backspace row — fixed height */}
          <View style={[styles.backspaceRow, { height: UI_CHROME.backspaceRow }]}>
            {appMode === 'basic' && (
              <TouchableOpacity
                onPress={() => handlePress('⌫')}
                style={styles.backspaceBtn}
                activeOpacity={0.6}
              >
                <Text style={[styles.backspaceIcon, { color: theme.headerIcon }]}>
                  ⌫
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Buttons — dynamic size fills remaining space */}
          <View style={styles.buttonsWrapper}>
            {CalcButtons}
          </View>

        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ── Shared ───────────────────────────────────────
  rootCol: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACE.sm,
    minHeight: UI_CHROME.topBar,
  },

  // ── Single column ────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
    marginHorizontal: SPACE.xs,
  },
  backspaceRow: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: SPACE.sm,
    height: UI_CHROME.backspaceRow,
  },
  backspaceBtn: { padding: SPACE.xs },
  backspaceIcon: { fontSize: rf(22) },
  buttonsWrapper: { paddingHorizontal: SPACE.xs },
  buttonsCenter: { alignItems: 'stretch' },

  // ── Two column ───────────────────────────────────
  rootRow: {
    flex: 1,
    flexDirection: 'row',
  },
  leftCol: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: SPACE.sm,
    paddingVertical: SPACE.xs,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: SPACE.sm,
  },
  rightCol: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: SPACE.sm,
  },
  rightTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACE.xs,
    paddingBottom: SPACE.sm,
  },
});