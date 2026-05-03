import { ArrowUpDown } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
    CATEGORIES,
    Unit,
    UnitCategory,
    convert,
    formatResult,
} from '../utils/conversions';

export default function UnitConverter({ isTablet }: { isTablet: boolean }) {
  const { theme } = useTheme();

  const [categoryKey, setCategoryKey] = useState<UnitCategory>('length');
  const category = CATEGORIES.find(c => c.key === categoryKey)!;

  const [fromUnit, setFromUnit] = useState<Unit>(category.units[0]);
  const [toUnit,   setToUnit]   = useState<Unit>(category.units[1]);

  const [fromValue, setFromValue] = useState('');
  const [toValue,   setToValue]   = useState('');

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

  const inputSize = isTablet ? 44 : 36;

  return (
    <View style={styles.wrapper}>

      {/* ══════════════════════════════════════════
          CONVERSION AREA (top, takes all space)
      ══════════════════════════════════════════ */}
      <View style={styles.conversionArea}>

        {/* FROM block */}
        <View style={[styles.block, { backgroundColor: theme.btnFunction }]}>
          {/* Unit selector button */}
          <TouchableOpacity
            onPress={() => setPickerOpen(p => p === 'from' ? null : 'from')}
            style={styles.unitHeader}
          >
            <View style={styles.unitHeaderLeft}>
              <Text style={[styles.unitSymbolLarge, { color: theme.btnOperator }]}>
                {fromUnit.symbol}
              </Text>
              <Text style={[styles.unitLabelSmall, { color: theme.resultText }]}>
                {fromUnit.label}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.resultText }]}>
              {pickerOpen === 'from' ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {/* Inline picker */}
          {pickerOpen === 'from' && (
            <UnitPicker
              units={category.units}
              selected={fromUnit}
              onSelect={u => handleUnitSelect(u, 'from')}
              theme={theme}
            />
          )}

          {/* Input */}
          <TextInput
            style={[styles.bigInput, {
              color:     theme.expressionText,
              fontSize:  inputSize,
              borderTopColor: theme.divider,
            }]}
            value={fromValue}
            onChangeText={handleFromChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.divider}
            textAlign="right"
          />
        </View>

        {/* SWAP button between blocks */}
        <View style={styles.swapWrapper}>
          <View style={[styles.swapLine, { backgroundColor: theme.divider }]} />
          <TouchableOpacity
            onPress={handleSwap}
            style={[styles.swapBtn, { backgroundColor: theme.btnOperator }]}
          >
            {/* Wrap icon in View to apply transform — Lucide doesn't support style.transform */}
            <View>
              <ArrowUpDown size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={[styles.swapLine, { backgroundColor: theme.divider }]} />
        </View>

        {/* TO block */}
        <View style={[styles.block, { backgroundColor: theme.btnFunction }]}>
          <TouchableOpacity
            onPress={() => setPickerOpen(p => p === 'to' ? null : 'to')}
            style={styles.unitHeader}
          >
            <View style={styles.unitHeaderLeft}>
              <Text style={[styles.unitSymbolLarge, { color: theme.btnOperator }]}>
                {toUnit.symbol}
              </Text>
              <Text style={[styles.unitLabelSmall, { color: theme.resultText }]}>
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
            style={[styles.bigInput, {
              color:    theme.expressionText,
              fontSize: inputSize,
              borderTopColor: theme.divider,
            }]}
            value={toValue}
            onChangeText={handleToChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.divider}
            textAlign="right"
          />
        </View>

      </View>

      {/* ══════════════════════════════════════════
          CATEGORY SELECTOR (bottom, compact)
      ══════════════════════════════════════════ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => handleCategoryChange(cat.key)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: categoryKey === cat.key
                  ? theme.btnOperator
                  : theme.btnFunction,
              },
            ]}
          >
            <Text style={[
              styles.categoryChipText,
              { color: categoryKey === cat.key ? '#fff' : theme.expressionText },
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );
}

// ── Inline unit picker ───────────────────────────────
function UnitPicker({ units, selected, onSelect, theme }: {
  units:    Unit[];
  selected: Unit;
  onSelect: (u: Unit) => void;
  theme:    any;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerRow}
    >
      {units.map(u => (
        <TouchableOpacity
          key={u.key}
          onPress={() => onSelect(u)}
          style={[
            styles.pickerChip,
            {
              backgroundColor: selected.key === u.key
                ? theme.btnOperator
                : theme.background,
              borderColor: theme.divider,
            },
          ]}
        >
          <Text style={[
            styles.pickerSymbol,
            { color: selected.key === u.key ? '#fff' : theme.expressionText },
          ]}>
            {u.symbol}
          </Text>
          <Text style={[
            styles.pickerLabel,
            { color: selected.key === u.key ? '#ffffffcc' : theme.resultText },
          ]}>
            {u.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex:            1,
    paddingHorizontal: 12,
    paddingTop:        8,
    paddingBottom:     8,
    justifyContent:  'space-between',
  },

  // ── Conversion area ──────────────────────────────
  conversionArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },

  block: {
    borderRadius: 18,
    overflow:     'hidden',
    paddingBottom: 4,
  },

  unitHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  unitHeaderLeft: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           8,
  },
  unitSymbolLarge: {
    fontSize:   22,
    fontWeight: '700',
  },
  unitLabelSmall: {
    fontSize:   13,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 11,
  },

  bigInput: {
    fontWeight:       '300',
    paddingHorizontal: 16,
    paddingTop:        10,
    paddingBottom:     14,
    borderTopWidth:    StyleSheet.hairlineWidth,
  },

  // ── Picker ───────────────────────────────────────
  pickerRow: {
    paddingHorizontal: 12,
    paddingVertical:    8,
    gap:                8,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical:    8,
    borderRadius:      10,
    borderWidth:        1,
    alignItems:        'center',
    minWidth:           58,
  },
  pickerSymbol: {
    fontSize:   14,
    fontWeight: '700',
  },
  pickerLabel: {
    fontSize:  10,
    marginTop:  2,
  },

  // ── Swap ─────────────────────────────────────────
  swapWrapper: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: 10,
  },
  swapLine: {
    flex:   1,
    height: StyleSheet.hairlineWidth,
  },
  swapBtn: {
    width:            40,
    height:           40,
    borderRadius:     20,
    justifyContent:   'center',
    alignItems:       'center',
    marginHorizontal: 14,
    // Shadow
    shadowColor:    '#7119c3',
    shadowOffset:   { width: 0, height: 0 },
    shadowOpacity:  0.5,
    shadowRadius:   8,
    elevation:      6,
  },

  // ── Category selector (bottom) ───────────────────
  categoryRow: {
    paddingTop:    12,
    paddingBottom:  4,
    gap:            8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical:    7,
    borderRadius:      20,
  },
  categoryChipText: {
    fontSize:   13,
    fontWeight: '600',
  },
});