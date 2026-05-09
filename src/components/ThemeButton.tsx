import { Moon, Smartphone, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeButton() {
    const { theme, isDark, mode, setMode } = useTheme();
    const [open, setOpen] = useState(false);

    const Icon = mode === 'system'
        ? Smartphone
        : isDark ? Moon : Sun;

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                style={[styles.btn, { backgroundColor: theme.btnFunction }]}
                activeOpacity={0.8}
            >
                <Icon size={18} color={theme.expressionText} />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <View style={[styles.menu, {
                        backgroundColor: theme.historyItem,
                        borderColor: theme.divider,
                    }]}>
                        <Text style={[styles.title, { color: theme.expressionText }]}>
                            Apariencia
                        </Text>

                        {[
                            { key: 'system', label: 'Sistema', Icon: Smartphone },
                            { key: 'light', label: 'Claro', Icon: Sun },
                            { key: 'dark', label: 'Oscuro', Icon: Moon },
                        ].map(opt => {
                            const active = mode === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => { setMode(opt.key as any); setOpen(false); }}
                                    style={[
                                        styles.option,
                                        active && {
                                            backgroundColor: theme.btnOperator + '22',
                                            borderRadius: 10,
                                        },
                                    ]}
                                >
                                    <View style={styles.optionLeft}>
                                        <opt.Icon
                                            size={16}
                                            color={active ? theme.btnOperator : theme.expressionText}
                                        />
                                        <Text style={[
                                            styles.optionText,
                                            { color: active ? theme.btnOperator : theme.expressionText },
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </View>
                                    {active && (
                                        <Text style={{ color: theme.btnOperator, fontSize: 14 }}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    btn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 90,
        paddingRight: 16,
    },
    menu: {
        width: 200,
        borderRadius: 16,
        borderWidth: 1,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.5,
        paddingLeft: 8,
        marginBottom: 6,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    optionText: {
        fontSize: 15,
        fontWeight: '500',
    },
});