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
import { CONTENT_PADDING, SPACE } from '../constants/layout';
import { useAnimatedMode } from '../hooks/useAnimatedMode';
import { useCalculator } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

export default function Index() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { expression, result, handlePress } = useCalculator();
  const [appMode, setAppMode] = useState<AppMode>('basic');

  const isTablet = width >= 768;
  const isLandscape = width > height;
  // 2-column layout: tablet landscape only
  // const twoColumn = isTablet && isLandscape;
  // 2 columns in landscape on all devices with min width (including phones)
  // const twoColumn = isLandscape && width >= 600;
  // 2 columns in landscape on all devices, no min width (even small phones)
  const twoColumn = isLandscape;

  const hPad = isTablet ? CONTENT_PADDING.tablet : CONTENT_PADDING.phone;

  const { opacity, translateY } = useAnimatedMode(appMode);
  const animStyle = {
    opacity,
    transform: [{ translateY }],
  };

  // ── Buttons — shared between layouts ────────────
  const CalcButtons = (
    <View style={styles.buttonsCenter}>
      {appMode === 'scientific' && (
        <ScientificGrid
          onPress={handlePress}
          isTablet={isTablet}
          isLandscape={twoColumn}
        />
      )}
      <ButtonGrid
        onPress={handlePress}
        isTablet={isTablet}
        isLandscape={twoColumn}
      />
    </View>
  );

  // ════════════════════════════════════════════════
  // TWO-COLUMN — converter gets full width
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
          <ModeBar
            current={appMode}
            onChange={setAppMode}
            direction="horizontal"
            compact
          />
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

        {/* ── LEFT: buttons centered ────────────── */}
        <View style={styles.leftCol}>
          {CalcButtons}
        </View>

        {/* ── DIVIDER ───────────────────────────── */}
        <View style={[
          styles.verticalDivider,
          { backgroundColor: theme.divider },
        ]} />

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
            <View style={styles.displayFull}>
              <Display
                expression={expression}
                result={result}
                isTablet={false}
                isLandscape
              />
            </View>
          </Animated.View>

        </View>

      </View>
    );
  }

  // ════════════════════════════════════════════════
  // SINGLE COLUMN — portrait (phone + tablet)
  // ════════════════════════════════════════════════
  return (
    <View style={[
      styles.rootCol,
      { backgroundColor: theme.background },
      {
        paddingTop: insets.top + SPACE.sm,
        paddingBottom: insets.bottom + SPACE.sm,
        paddingLeft: insets.left + hPad,
        paddingRight: insets.right + hPad,
      },
    ]}>

      {/* ── Top bar ───────────────────────────────── */}
      <View style={styles.topBar}>
        <ModeBar
          current={appMode}
          onChange={setAppMode}
          direction="horizontal"
          compact={!isTablet}
        />
        <ThemeButton />
      </View>

      {/* ── Converter ─────────────────────────────── */}
      {appMode === 'converter' ? (
        <Animated.View style={[styles.flex, animStyle]}>
          <UnitConverter isTablet={isTablet} />
        </Animated.View>

      ) : (

        /* ── Calculator ───────────────────────────── */
        <Animated.View style={[styles.flex, animStyle]}>

          {/* Display */}
          <View style={styles.displayWrapper}>
            <Display
              expression={expression}
              result={result}
              isTablet={isTablet}
            />
          </View>

          {/* Divider */}
          <View style={[
            styles.divider,
            { backgroundColor: theme.divider },
          ]} />

          {/* Backspace — basic mode only */}
          {appMode === 'basic' && (
            <View style={styles.backspaceRow}>
              <TouchableOpacity
                onPress={() => handlePress('⌫')}
                style={styles.backspaceBtn}
                activeOpacity={0.6}
              >
                <Text style={[
                  styles.backspaceIcon,
                  { color: theme.headerIcon },
                ]}>
                  ⌫
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Buttons */}
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
  },

  // ── Single column ────────────────────────────────
  displayWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACE.sm,
    minHeight: 100,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.sm,
    marginHorizontal: SPACE.xs,
  },
  backspaceRow: {
    alignItems: 'flex-end',
    paddingRight: SPACE.sm,
    marginBottom: SPACE.xs,
  },
  backspaceBtn: { padding: SPACE.sm },
  backspaceIcon: { fontSize: 22 },
  buttonsWrapper: {
    paddingHorizontal: SPACE.xs,
  },
  buttonsCenter: {
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'center',
  },

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
    paddingVertical: SPACE.sm,
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
    marginBottom: SPACE.sm,
    paddingTop: SPACE.xs,
  },
  displayFull: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACE.sm,
  },
});