import { Moon, Smartphone, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';
import ButtonGrid from '../components/ButtonGrid';
import Display from '../components/Display';
import ScientificGrid from '../components/ScientificGrid';
import UnitConverter from '../components/UnitConverter';
import { useCalculator } from '../hooks/useCalculator';
import { useTheme } from '../theme/ThemeContext';

// App modes
type AppMode = 'basic' | 'scientific' | 'converter';

export default function Index() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  const { theme, isDark, mode, setMode } = useTheme();
  const { expression, result, handlePress } = useCalculator();

  const [appMode, setAppMode] = useState<AppMode>('basic');
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        isTablet && styles.screenTablet,
        isTablet && isLandscape && styles.screenLandscape,
      ]}
    >

      {/* ══════════════════════════════════════════════
          DISPLAY (only for calc modes)
      ══════════════════════════════════════════════ */}
      {appMode !== 'converter' && (
        <View style={styles.displayWrapper}>
          <Display
            expression={expression}
            result={result}
            isTablet={isTablet}
          />
        </View>
      )}

      {/* ══════════════════════════════════════════════
          TOP BAR
      ══════════════════════════════════════════════ */}
      <View style={[styles.topBar, { borderBottomColor: theme.divider }]}>

        {/* Mode pills */}
        <View style={[styles.modePills, { backgroundColor: theme.btnFunction }]}>
          {(['basic', 'scientific', 'converter'] as AppMode[]).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setAppMode(m)}
              style={[
                styles.pill,
                appMode === m && { backgroundColor: theme.btnOperator },
              ]}
            >
              <Text style={[
                styles.pillText,
                { color: appMode === m ? '#fff' : theme.expressionText },
              ]}>
                {m === 'basic' ? '123' : null}
                {m === 'scientific' ? 'f(x)' : null}
                {m === 'converter' ? '⇄' : null}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme selector button */}
        <TouchableOpacity
          onPress={() => setThemeMenuVisible(true)}
          style={[styles.themeBtn, { backgroundColor: theme.btnFunction }]}
        >
          {mode === 'system'
            ? <Smartphone size={18} color={theme.expressionText} />
            : isDark
              ? <Moon size={18} color={theme.expressionText} />
              : <Sun size={18} color={theme.expressionText} />
          }
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════
          THEME MENU MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        visible={themeMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setThemeMenuVisible(false)}
        >
          <View style={[styles.themeMenu, { backgroundColor: theme.historyItem, borderColor: theme.divider }]}>
            <Text style={[styles.themeMenuTitle, { color: theme.expressionText }]}>
              Apariencia
            </Text>
            {[
              { key: 'system', label: 'Tema del sistema', Icon: Smartphone },
              { key: 'light', label: 'Claro', Icon: Sun },
              { key: 'dark', label: 'Oscuro', Icon: Moon },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => { setMode(opt.key as any); setThemeMenuVisible(false); }}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: mode === opt.key
                      ? theme.btnOperator + '33'
                      : 'transparent',
                    borderRadius: 10,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <opt.Icon
                    size={16}
                    color={mode === opt.key ? theme.btnOperator : theme.expressionText}
                  />
                  <Text style={[
                    styles.themeOptionText,
                    { color: mode === opt.key ? theme.btnOperator : theme.expressionText },
                  ]}>
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ══════════════════════════════════════════════
          DIVIDER
      ══════════════════════════════════════════════ */}
      {appMode !== 'converter' && (
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      )}

      {/* ══════════════════════════════════════════════
          CONTENT BY MODE
      ══════════════════════════════════════════════ */}
      {appMode === 'basic' && (
        <>
          <View style={styles.backspaceRow}>
            <TouchableOpacity onPress={() => handlePress('⌫')} style={styles.iconBtn}>
              <Text style={[styles.backspaceIcon, { color: theme.headerIcon }]}>⌫</Text>
            </TouchableOpacity>
          </View>
          <ButtonGrid onPress={handlePress} isTablet={isTablet} />
        </>
      )}

      {appMode === 'scientific' && (
        <>
          <ScientificGrid onPress={handlePress} isTablet={isTablet} />
          <ButtonGrid onPress={handlePress} isTablet={isTablet} />
        </>
      )}

      {appMode === 'converter' && (
        <UnitConverter isTablet={isTablet} />
      )}

      {/* ══════════════════════════════════════════════
          AD BANNER
      ══════════════════════════════════════════════ */}
      <View style={{ paddingBottom: insets.bottom }}>
        <AdBanner />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end' },
  screenTablet: { alignSelf: 'center', width: '55%' },
  screenLandscape: { width: '40%' },
  displayWrapper: { flex: 1, justifyContent: 'flex-end' },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20, marginBottom: 8 },

  // ── Top bar ──────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Mode pills container
  modePills: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 17,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Theme button
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnIcon: {
    fontSize: 18,
  },

  // Theme modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 16,
  },
  themeMenu: {
    width: 210,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  themeMenuTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 8,
    opacity: 0.6,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Basic mode backspace row
  backspaceRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  iconBtn: { padding: 8 },
  backspaceIcon: { fontSize: 22 },

  // Converter placeholder
  converterPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});