import { DraftingCompass } from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE } from '../constants/layout';
import { HistoryEntry } from '../hooks/useHistory';
import { useTheme } from '../theme/ThemeContext';
import { rf, rsp } from '../utils/responsive';

interface HistoryPanelProps {
    visible: boolean;
    entries: HistoryEntry[];
    onClose: () => void;
    onSelect: (entry: HistoryEntry) => void;
    onClear: () => void;
}

export default function HistoryPanel({
    visible,
    entries,
    onClose,
    onSelect,
    onClear,
}: HistoryPanelProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const renderEntry = useCallback(({ item, index }: {
        item: HistoryEntry;
        index: number;
    }) => (
        <TouchableOpacity
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
            style={[
                styles.entry,
                {
                    backgroundColor: theme.historyItem,
                    borderColor: theme.historyBorder,
                    // Slightly highlight the most recent
                    borderLeftWidth: index === 0 ? 3 : 1,
                    borderLeftColor: index === 0 ? theme.btnOperator : theme.historyBorder,
                },
            ]}
        >
            {/* Expression — truncated */}
            <Text
                style={[styles.entryExpr, { color: theme.historyExpr }]}
                numberOfLines={1}
                ellipsizeMode="middle"
            >
                {item.expression}
            </Text>

            {/* Result — prominent */}
            <Text
                style={[styles.entryResult, { color: theme.historyResult }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                = {item.result}
            </Text>
        </TouchableOpacity>
    ), [theme, onSelect]);

    const ListEmpty = (
        <View style={styles.emptyWrapper}>
            <DraftingCompass
                size={rf(34)}
                color="#7119c3"
            />
            <Text style={[styles.emptyText, { color: theme.historyExpr }]}>
                Sin historial aún
            </Text>
            <Text style={[styles.emptyHint, { color: theme.divider }]}>
                Presiona = para guardar
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop — tap to close */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* Panel — slides in from right */}
            <View
                style={[
                    styles.panel,
                    {
                        backgroundColor: theme.historyBg,
                        paddingTop: insets.top + SPACE.sm,
                        paddingBottom: insets.bottom + SPACE.sm,
                        borderLeftColor: theme.divider,
                    },
                ]}
            >

                {/* ── Header ──────────────────────────────── */}
                <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.expressionText }]}>
                            Historial
                        </Text>
                        <Text style={[styles.headerSub, { color: theme.historyExpr }]}>
                            {entries.length === 0
                                ? 'Vacío'
                                : `${entries.length} operación${entries.length !== 1 ? 'es' : ''}`}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        {entries.length > 0 && (
                            <TouchableOpacity
                                onPress={onClear}
                                activeOpacity={0.7}
                                style={[styles.clearBtn, { borderColor: theme.divider }]}
                            >
                                <Text style={[styles.clearText, { color: theme.historyExpr }]}>
                                    Limpiar
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                            style={[styles.closeBtn, { backgroundColor: theme.btnFunction }]}
                        >
                            <Text style={[styles.closeIcon, { color: theme.expressionText }]}>
                                ✕
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Hint ────────────────────────────────── */}
                {entries.length > 0 && (
                    <Text style={[styles.tapHint, { color: theme.divider }]}>
                        Toca un resultado para usarlo
                    </Text>
                )}

                {/* ── List ────────────────────────────────── */}
                <FlatList
                    data={entries}
                    keyExtractor={item => item.id}
                    renderItem={renderEntry}
                    ListEmptyComponent={ListEmpty}
                    contentContainerStyle={[
                        styles.listContent,
                        entries.length === 0 && styles.listContentEmpty,
                    ]}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                        <View style={[styles.separator, { backgroundColor: theme.divider }]} />
                    )}
                />

            </View>
        </Modal>
    );
}

const PANEL_WIDTH = '78%';

const styles = StyleSheet.create({
    // ── Modal backdrop ───────────────────────────────
    backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },

    // ── Panel ────────────────────────────────────────
    panel: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: PANEL_WIDTH,
        borderLeftWidth: StyleSheet.hairlineWidth,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        // Shadow for Android
        elevation: 16,
    },

    // ── Header ───────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACE.md,
        paddingVertical: SPACE.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: SPACE.xs,
    },
    headerTitle: {
        fontSize: rf(17),
        fontWeight: '600',
    },
    headerSub: {
        fontSize: rf(12),
        marginTop: 2,
        opacity: 0.7,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.sm,
    },
    clearBtn: {
        paddingHorizontal: SPACE.sm,
        paddingVertical: SPACE.xs,
        borderRadius: 8,
        borderWidth: 1,
    },
    clearText: {
        fontSize: rf(12),
        fontWeight: '500',
    },
    closeBtn: {
        width: rsp(30),
        height: rsp(30),
        borderRadius: rsp(15),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: rf(13),
        fontWeight: '500',
    },

    // ── Hint ─────────────────────────────────────────
    tapHint: {
        fontSize: rf(11),
        paddingHorizontal: SPACE.md,
        paddingBottom: SPACE.xs,
        fontStyle: 'italic',
    },

    // ── List ─────────────────────────────────────────
    listContent: {
        paddingHorizontal: SPACE.sm,
        paddingBottom: SPACE.md,
    },
    listContentEmpty: {
        flex: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: SPACE.sm,
    },

    // ── Entry ────────────────────────────────────────
    entry: {
        borderRadius: 12,
        borderWidth: 1,
        padding: SPACE.sm,
        marginVertical: rsp(3),
    },
    entryExpr: {
        fontSize: rf(12),
        fontWeight: '400',
        marginBottom: rsp(3),
        letterSpacing: 0.2,
    },
    entryResult: {
        fontSize: rf(17),
        fontWeight: '600',
    },

    // ── Empty state ──────────────────────────────────
    emptyWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE.sm,
    },
    emptyText: {
        fontSize: rf(15),
        fontWeight: '500',
    },
    emptyHint: {
        fontSize: rf(12),
    },
});