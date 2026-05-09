import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Defined here, imported by index.tsx and any other file that needs it
export type AppMode = 'basic' | 'scientific' | 'converter';

const MODES: { key: AppMode; label: string }[] = [
    { key: 'basic', label: '123' },
    { key: 'scientific', label: 'f(x)' },
    { key: 'converter', label: '⇄' },
];

interface ModeBarProps {
    current: AppMode;
    onChange: (m: AppMode) => void;
    direction: 'horizontal' | 'vertical';
    compact?: boolean;
}

export default function ModeBar({
    current,
    onChange,
    direction,
    compact = false,
}: ModeBarProps) {
    const { theme } = useTheme();
    const isVertical = direction === 'vertical';

    return (
        <View style={[
            styles.container,
            isVertical ? styles.vertical : styles.horizontal,
            { backgroundColor: theme.btnFunction },
        ]}>
            {MODES.map((m) => {
                const isActive = current === m.key;
                return (
                    <TouchableOpacity
                        key={m.key}
                        onPress={() => onChange(m.key)}
                        style={[
                            styles.pill,
                            isVertical ? styles.pillV : styles.pillH,
                            compact ? styles.pillCompact : styles.pillNormal,
                            isActive && { backgroundColor: theme.btnOperator },
                        ]}
                        activeOpacity={0.75}
                    >
                        <Text style={[
                            styles.label,
                            compact ? styles.labelSm : styles.labelMd,
                            { color: isActive ? '#fff' : theme.expressionText },
                        ]}>
                            {m.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 22,
        padding: 3,
    },
    horizontal: {
        flexDirection: 'row',
    },
    vertical: {
        flexDirection: 'column',
    },
    pill: {
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillH: {
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    pillV: {
        paddingVertical: 12,
        paddingHorizontal: 6,
        width: 48,
    },
    pillNormal: {},
    pillCompact: {},
    label: {
        fontWeight: '600',
    },
    labelMd: {
        fontSize: 14,
    },
    labelSm: {
        fontSize: 13,
    },
});