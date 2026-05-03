import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DisplayProps {
  expression: string;
  result: string;
  isTablet: boolean;
}

export default function Display({ expression, result, isTablet }: DisplayProps) {
  const { theme } = useTheme();

  const exprFontSize = isTablet
    ? expression.length > 18 ? 36 : 52
    : expression.length > 14 ? 28 : 42;

  return (
    <View style={styles.container}>

      {/* ── Expression (top, larger) ─────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text
          style={[styles.expression, {
            fontSize: exprFontSize,
            color: theme.expressionText,
          }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {expression}
        </Text>
      </ScrollView>

      {/* ── Live result (bottom, smaller) ───────────── */}
      {result !== '' && (
        <Text
          style={[styles.result, {
            fontSize: isTablet ? 30 : 24,
            color: theme.resultText,
          }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          = {result}
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical:   12,
    alignItems:        'flex-end',
    minHeight:         120,
    justifyContent:    'flex-end',
  },
  scroll: {
    flexGrow:       1,
    justifyContent: 'flex-end',
  },
  expression: {
    fontWeight:    '300',
    letterSpacing: 1,
  },
  result: {
    fontWeight: '300',
    marginTop:  4,   // ← separación respecto a la expresión
  },
});