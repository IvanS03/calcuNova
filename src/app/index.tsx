import { History } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
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
import HistoryPanel from '../components/HistoryPanel';
import ModeBar, { AppMode } from '../components/ModeBar';
import ScientificGrid from '../components/ScientificGrid';
import ThemeButton from '../components/ThemeButton';
import UnitConverter from '../components/UnitConverter';
import { CONTENT_PADDING, SPACE, UI_CHROME } from '../constants/layout';
import { useAnimatedMode } from '../hooks/useAnimatedMode';
import { useCalculator } from '../hooks/useCalculator';
import { useDynamicButtonSize } from '../hooks/useDynamicButtonSize';
import { HistoryEntry, useHistory } from '../hooks/useHistory';
import { useTheme } from '../theme/ThemeContext';
import { rf, rsp } from '../utils/responsive';

export default function Index() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const {
    expression,
    result,
    handlePress,
    lastEvaluatedExpr,
    lastEvaluatedResult,
  } = useCalculator();

  const { entries, addEntry, clearHistory } = useHistory();

  const [appMode, setAppMode] = useState<AppMode>('basic');
  const [historyOpen, setHistoryOpen] = useState(false);

  const isTablet = width >= 768;
  const isLandscape = width > height;
  const aspectRatio = width / height;
  const twoColumn = isLandscape && aspectRatio > 1.1;
  const isTabletLandscape = twoColumn && isTablet;
  const sciMode = appMode === 'scientific';

  const hPad = isTablet ? CONTENT_PADDING.tablet : CONTENT_PADDING.phone;

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

  // ── Handle = press — save to history ────────────
  const handleCalcPress = useCallback((value: Parameters<typeof handlePress>[0]) => {
    handlePress(value);
    if (value === '=') {
      // Refs are updated inside handlePress synchronously before setState
      // Use setTimeout(0) to read after state flush
      setTimeout(() => {
        const expr = lastEvaluatedExpr.current;
        const res = lastEvaluatedResult.current;
        if (expr && res) addEntry(expr, res);
      }, 0);
    }
  }, [handlePress, addEntry, lastEvaluatedExpr, lastEvaluatedResult]);

  // ── Tap history entry → load result ─────────────
  const handleSelectEntry = useCallback((entry: HistoryEntry) => {
    // Simulate pressing the digits of the result
    handlePress('AC');
    // Set expression directly by pressing each char
    // Simplest: just use AC then inject via a small helper
    // We'll expose a setter approach instead — inject result as expression
    entry.result.split('').forEach(char => {
      if (char === '-') {
        handlePress('+/-' as any);
      } else if (char === '.') {
        handlePress('.');
      } else if (/[0-9]/.test(char)) {
        handlePress(char as any);
      }
    });
    setHistoryOpen(false);
  }, [handlePress]);

  // ── History button (only in calculator modes) ───
  const HistoryButton = appMode !== 'converter' ? (
    <TouchableOpacity
      onPress={() => setHistoryOpen(true)}
      activeOpacity={0.7}
      style={[styles.historyBtn, { backgroundColor: theme.btnFunction }]}
    >
      <History
        color={theme.expressionText}
        size={rsp(20)}
      />
    </TouchableOpacity>
  ) : null;

  // ── Shared buttons ───────────────────────────────
  const CalcButtons = (
    <View style={styles.buttonsCenter}>
      {sciMode && (
        <ScientificGrid
          onPress={handleCalcPress}
          isTablet={isTablet}
          isLandscape={twoColumn && !isTablet}
          isTabletLandscape={isTabletLandscape}
          dynamicSize={dynamicSize}
        />
      )}
      <ButtonGrid
        onPress={handleCalcPress}
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
            <View style={styles.rightTopActions}>
              {HistoryButton}
              <ThemeButton />
            </View>
          </View>

          <Animated.View style={[styles.flex, animStyle]}>
            <Display
              expression={expression}
              result={result}
              isTablet={false}
              isLandscape={!isTablet}
              isTabletLandscape={isTabletLandscape}
              onBackspace={() => handleCalcPress('⌫')}
            />
          </Animated.View>
        </View>

        <HistoryPanel
          visible={historyOpen}
          entries={entries}
          onClose={() => setHistoryOpen(false)}
          onSelect={handleSelectEntry}
          onClear={clearHistory}
        />

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
        paddingLeft: insets.left + hPad,
        paddingRight: insets.right + hPad,
      },
    ]}>

      {/* Top bar */}
      <View style={[styles.topBar, { minHeight: UI_CHROME.topBar }]}>
        <ModeBar
          current={appMode}
          onChange={setAppMode}
          direction="horizontal"
          compact={!isTablet}
        />
        <View style={styles.topBarActions}>
          {HistoryButton}
          <ThemeButton />
        </View>
      </View>

      {appMode === 'converter' ? (
        <Animated.View style={[styles.flex, animStyle]}>
          <UnitConverter isTablet={isTablet} />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.flex, animStyle]}>

          <Display
            expression={expression}
            result={result}
            isTablet={isTablet}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={[styles.backspaceRow, { height: UI_CHROME.backspaceRow }]}>
            {appMode === 'basic' && (
              <TouchableOpacity
                onPress={() => handleCalcPress('⌫')}
                style={styles.backspaceBtn}
                activeOpacity={0.6}
              >
                <Text style={[styles.backspaceIcon, { color: theme.headerIcon }]}>
                  ⌫
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonsWrapper}>
            {CalcButtons}
          </View>

        </Animated.View>
      )}

      <HistoryPanel
        visible={historyOpen}
        entries={entries}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectEntry}
        onClear={clearHistory}
      />

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
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
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
  },
  backspaceBtn: { padding: SPACE.xs },
  backspaceIcon: { fontSize: rf(22) },
  buttonsWrapper: { paddingHorizontal: SPACE.xs },
  buttonsCenter: { alignItems: 'stretch' },

  // ── History button ───────────────────────────────
  historyBtn: {
    width: rsp(38),
    height: rsp(38),
    borderRadius: rsp(19),
    justifyContent: 'center',
    alignItems: 'center',
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
  rightTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
  },
});