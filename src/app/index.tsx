import { History } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ButtonGrid from '../components/ButtonGrid';
import Display from '../components/Display';
import HistoryPanel from '../components/HistoryPanel';
import ModeBar, { AppMode } from '../components/ModeBar';
import ScientificGrid from '../components/ScientificGrid';
import ThemeButton from '../components/ThemeButton';
import Toast from '../components/Toast';
import UnitConverter from '../components/UnitConverter';
import { CONTENT_PADDING, SPACE, UI_CHROME } from '../constants/layout';
import { useAnimatedMode } from '../hooks/useAnimatedMode';
import { ButtonValue, useCalculator } from '../hooks/useCalculator';
import { useDynamicButtonSize } from '../hooks/useDynamicButtonSize';
import { HistoryEntry, useHistory } from '../hooks/useHistory';
import { useTheme } from '../theme/ThemeContext';
import { rsp } from '../utils/responsive';

// ─────────────────────────────────────────────────
// Layout preference for the button grid in portrait
// Options: 'flex-start' | 'center' | 'flex-end'
// ─────────────────────────────────────────────────
const BUTTONS_VERTICAL_ALIGN: 'flex-start' | 'center' | 'flex-end' = 'center';

export default function Index() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const {
    expression,
    result,
    handlePress,
    selection,
    onSelectionChange,
    onDirectEdit,
    editError,
    showIncompleteWarning,
    setExpressionDirect,
    lastEvaluatedExpr,
    lastEvaluatedResult,
  } = useCalculator();

  const { entries, addEntry, clearHistory } = useHistory();

  const [appMode, setAppMode] = useState<AppMode>('basic');
  const [historyOpen, setHistoryOpen] = useState(false);
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setTimeout(() => {
        const expr = lastEvaluatedExpr.current;
        const res = lastEvaluatedResult.current;
        if (expr && res) addEntry(expr, res);
      }, 0);
    }
  }, [handlePress, addEntry, lastEvaluatedExpr, lastEvaluatedResult]);

  useEffect(() => {
    if (editError) showToast(editError);
    if (showIncompleteWarning) showToast('Operación incompleta');
  }, [editError, showIncompleteWarning]);

  const showToast = useCallback((msg: string) => {
    if (!msg) return;
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  // ── Tap history entry → load result ─────────────
  const handleSelectEntry = useCallback((entry: HistoryEntry) => {
    // Inject result directly — no simulated button presses
    setExpressionDirect(entry.expression);
    setHistoryOpen(false);
  }, [setExpressionDirect]);

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

  // ── Long press: () → +/- ────────────────────────
  const handleLongPress = useCallback((value: ButtonValue) => {
    if (value === '()') handleCalcPress('+/-');
  }, [handleCalcPress]);

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
        onLongPress={handleLongPress}
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
              selection={selection}
              onSelectionChange={onSelectionChange}
              onDirectEdit={onDirectEdit}
              editError={editError}
              isLandscape={!isTablet}
              isTabletLandscape={isTabletLandscape}
              showIncompleteWarning={showIncompleteWarning}
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

        <Toast message={toastMessage} visible={toastVisible} />

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

          {/* Display — fixed height */}
          <Display
            expression={expression}
            result={result}
            isTablet={isTablet}
            selection={selection}
            onSelectionChange={onSelectionChange}
            onDirectEdit={onDirectEdit}
            editError={editError}
            showIncompleteWarning={showIncompleteWarning}
          />

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Spacer — pushes buttons toward BUTTONS_VERTICAL_ALIGN */}
          <View style={styles.buttonsSpacer} />

          {/* Buttons */}
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

      <Toast message={toastMessage} visible={toastVisible} />

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

  // Spacer: flex grows to push buttons down (flex-end),
  // half-grows to center them, or stays 0 to keep them at top
  buttonsSpacer: {
    flex: ({ 'flex-end': 1, 'center': 0.5, 'flex-start': 0 })[BUTTONS_VERTICAL_ALIGN],
  },
  buttonsWrapper: {
    paddingHorizontal: SPACE.xs,
  },
  buttonsCenter: {
    alignItems: 'stretch',
  },

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