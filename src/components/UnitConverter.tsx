import { ArrowUpDown } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SPACE } from '../constants/layout';
import { useTheme } from '../theme/ThemeContext';
import {
  CATEGORIES,
  Unit,
  UnitCategory,
  convert,
  formatResult,
} from '../utils/conversions';

// Category icons
const CATEGORY_ICONS: Record<UnitCategory, string> = {
  length: '📏',
  weight: '⚖️',
  volume: '🧪',
  temperature: '🌡️',
  area: '⬜',
  speed: '💨',
};

interface UnitConverterProps {
  isTablet: boolean;
}

export default function UnitConverter({ isTablet }: UnitConverterProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [categoryKey, setCategoryKey] = useState<UnitCategory>('length');
  const category = CATEGORIES.find(c => c.key === categoryKey)!;

  const [fromUnit, setFromUnit] = useState<Unit>(category.units[0]);
  const [toUnit, setToUnit] = useState<Unit>(category.units[1]);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);

  // ── Category change ──────────────────────────────
  const handleCategoryChange = useCallback((key: UnitCategory) => {
    const cat = CATEGORIES.find(c => c.key === key)!;
    setCategoryKey(key);
    setFromUnit(cat.units[0]);
    setToUnit(cat.units[1]);
    setFromValue('');
    setToValue('');
    setPickerOpen(null);
  }, []);

  // ── Input handlers ───────────────────────────────
  const handleFromChange = useCallback((text: string) => {
    setFromValue(text);
    const num = parseFloat(text.replace(',', '.'));
    if (isNaN(num)) { setToValue(''); return; }
    setToValue(formatResult(convert(num, fromUnit.key, toUnit.key, categoryKey)));
  }, [fromUnit, toUnit, categoryKey]);

  const handleToChange = useCallback((text: string) => {
    setToValue(text);
    const num = parseFloat(text.replace(',', '.'));
    if (isNaN(num)) { setFromValue(''); return; }
    setFromValue(formatResult(convert(num, toUnit.key, fromUnit.key, categoryKey)));
  }, [fromUnit, toUnit, categoryKey]);

  // ── Swap ─────────────────────────────────────────
  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  }, [fromUnit, toUnit, fromValue, toValue]);

  // ── Unit select ──────────────────────────────────
  const handleUnitSelect = useCallback((unit: Unit, side: 'from' | 'to') => {
    if (side === 'from') {
      setFromUnit(unit);
      const num = parseFloat(fromValue.replace(',', '.'));
      if (!isNaN(num))
        setToValue(formatResult(convert(num, unit.key, toUnit.key, categoryKey)));
    } else {
      setToUnit(unit);
      const num = parseFloat(fromValue.replace(',', '.'));
      if (!isNaN(num))
        setToValue(formatResult(convert(num, fromUnit.key, unit.key, categoryKey)));
    }
    setPickerOpen(null);
  }, [fromValue, fromUnit, toUnit, categoryKey]);

  // ── Category grid ────────────────────────────────
  const CategoryGrid = (
    <View style={styles.categoryGrid}>
      {CATEGORIES.map(cat => {
        const active = categoryKey === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => handleCategoryChange(cat.key)}
            activeOpacity={0.75}
            style={[
              styles.categoryBtn,
              {
                backgroundColor: active
                  ? theme.btnOperator
                  : theme.btnFunction,
                borderColor: active
                  ? theme.btnOperator
                  : theme.divider,
              },
            ]}
          >
            <Text style={styles.categoryIcon}>
              {CATEGORY_ICONS[cat.key]}
            </Text>
            <Text style={[
              styles.categoryLabel,
              { color: active ? '#fff' : theme.expressionText },
            ]}>
              {cat.label}
            </Text>
            {active && (
              <View style={[
                styles.activeDot,
                { backgroundColor: '#ffffff88' },
              ]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Conversion display ───────────────────────────
  const ConversionDisplay = (
    <View style={styles.conversionArea}>

      {/* FROM block */}
      <View style={[styles.block, { backgroundColor: theme.btnFunction }]}>
        <TouchableOpacity
          onPress={() => setPickerOpen(p => p === 'from' ? null : 'from')}
          style={styles.unitHeader}
          activeOpacity={0.75}
        >
          <View style={styles.unitHeaderLeft}>
            <Text style={[styles.unitSymbol, { color: theme.btnOperator }]}>
              {fromUnit.symbol}
            </Text>
            <Text style={[styles.unitName, { color: theme.resultText }]}>
              {fromUnit.label}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.resultText }]}>
            {pickerOpen === 'from' ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {pickerOpen === 'from' && (
          <UnitPicker
            units={category.units}
            selected={fromUnit}
            onSelect={u => handleUnitSelect(u, 'from')}
            theme={theme}
          />
        )}

        <TextInput
          style={[
            styles.bigInput,
            {
              color: theme.expressionText,
              borderTopColor: theme.divider,
              fontSize: isTablet ? 40 : 34,
            },
          ]}
          value={fromValue}
          onChangeText={handleFromChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.divider}
          textAlign="right"
        />
      </View>

      {/* Swap button */}
      <View style={styles.swapRow}>
        <View style={[styles.swapLine, { backgroundColor: theme.divider }]} />
        <TouchableOpacity
          onPress={handleSwap}
          activeOpacity={0.8}
          style={[styles.swapBtn, { backgroundColor: theme.btnOperator }]}
        >
          <ArrowUpDown size={18} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.swapLine, { backgroundColor: theme.divider }]} />
      </View>

      {/* TO block */}
      <View style={[styles.block, { backgroundColor: theme.btnFunction }]}>
        <TouchableOpacity
          onPress={() => setPickerOpen(p => p === 'to' ? null : 'to')}
          style={styles.unitHeader}
          activeOpacity={0.75}
        >
          <View style={styles.unitHeaderLeft}>
            <Text style={[styles.unitSymbol, { color: theme.btnOperator }]}>
              {toUnit.symbol}
            </Text>
            <Text style={[styles.unitName, { color: theme.resultText }]}>
              {toUnit.label}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.resultText }]}>
            {pickerOpen === 'to' ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {pickerOpen === 'to' && (
          <UnitPicker
            units={category.units}
            selected={toUnit}
            onSelect={u => handleUnitSelect(u, 'to')}
            theme={theme}
          />
        )}

        <TextInput
          style={[
            styles.bigInput,
            {
              color: theme.expressionText,
              borderTopColor: theme.divider,
              fontSize: isTablet ? 40 : 34,
            },
          ]}
          value={toValue}
          onChangeText={handleToChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.divider}
          textAlign="right"
        />
      </View>

    </View>
  );

  // ════════════════════════════════════════════════
  // LANDSCAPE — 2 columns
  // ════════════════════════════════════════════════
  if (isLandscape) {
    return (
      <View style={styles.landscapeRoot}>

        {/* LEFT: category grid */}
        <View style={styles.landscapeLeft}>
          <Text style={[styles.sectionTitle, { color: theme.resultText }]}>
            Categoría
          </Text>
          {CategoryGrid}
        </View>

        {/* Divider */}
        <View style={[styles.landscapeDivider, { backgroundColor: theme.divider }]} />

        {/* RIGHT: conversion display */}
        <View style={styles.landscapeRight}>
          <Text style={[styles.sectionTitle, { color: theme.resultText }]}>
            {CATEGORY_ICONS[categoryKey]}{'  '}{category.label}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {ConversionDisplay}
          </ScrollView>
        </View>

      </View>
    );
  }

  // ════════════════════════════════════════════════
  // PORTRAIT — stacked
  // ════════════════════════════════════════════════
  return (
    <ScrollView
      style={styles.portraitRoot}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Category section */}
      <Text style={[styles.sectionTitle, { color: theme.resultText }]}>
        Categoría
      </Text>
      {CategoryGrid}

      {/* Divider */}
      <View style={[styles.portraitDivider, { backgroundColor: theme.divider }]} />

      {/* Conversion section */}
      <Text style={[styles.sectionTitle, { color: theme.resultText }]}>
        {CATEGORY_ICONS[categoryKey]}{'  '}{category.label}
      </Text>
      {ConversionDisplay}

      {/* Bottom padding so last input clears keyboard */}
      <View style={{ height: SPACE.xl }} />
    </ScrollView>
  );
}

// ── Inline unit picker ───────────────────────────────
function UnitPicker({
  units, selected, onSelect, theme,
}: {
  units: Unit[];
  selected: Unit;
  onSelect: (u: Unit) => void;
  theme: any;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerRow}
      keyboardShouldPersistTaps="handled"
    >
      {units.map(u => {
        const active = selected.key === u.key;
        return (
          <TouchableOpacity
            key={u.key}
            onPress={() => onSelect(u)}
            activeOpacity={0.75}
            style={[
              styles.pickerChip,
              {
                backgroundColor: active ? theme.btnOperator : theme.background,
                borderColor: active ? theme.btnOperator : theme.divider,
              },
            ]}
          >
            <Text style={[
              styles.pickerSymbol,
              { color: active ? '#fff' : theme.expressionText },
            ]}>
              {u.symbol}
            </Text>
            <Text style={[
              styles.pickerLabel,
              { color: active ? '#ffffffcc' : theme.resultText },
            ]}>
              {u.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  // ── Portrait ─────────────────────────────────────
  portraitRoot: {
    flex: 1,
  },
  portraitDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACE.md,
    marginHorizontal: SPACE.xs,
  },

  // ── Landscape ────────────────────────────────────
  landscapeRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeft: {
    width: '38%',
    paddingRight: SPACE.sm,
  },
  landscapeDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: SPACE.sm,
  },
  landscapeRight: {
    flex: 1,
    paddingLeft: SPACE.sm,
  },

  // ── Section title ────────────────────────────────
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACE.sm,
    marginLeft: SPACE.xs,
  },

  // ── Category grid — 2 columns ────────────────────
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE.sm,
  },
  categoryBtn: {
    // 2 columns with gap
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activeDot: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // ── Conversion area ──────────────────────────────
  conversionArea: {
    gap: SPACE.sm,
  },
  block: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.md,
    paddingVertical: 12,
  },
  unitHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACE.sm,
  },
  unitSymbol: {
    fontSize: 20,
    fontWeight: '700',
  },
  unitName: {
    fontSize: 13,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 11,
  },
  bigInput: {
    fontWeight: '300',
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // ── Swap ─────────────────────────────────────────
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACE.xs,
  },
  swapLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACE.md,
    shadowColor: '#7119c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── Unit picker ──────────────────────────────────
  pickerRow: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
    gap: SPACE.sm,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 58,
  },
  pickerSymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickerLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});