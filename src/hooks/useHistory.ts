import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'calc_history';
const MAX_ENTRIES = 25;

export interface HistoryEntry {
    id: string;
    expression: string;
    result: string;
    timestamp: number;
}

export function useHistory() {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    // ── Load from storage on mount ──────────────────
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then(raw => {
                if (raw) {
                    const parsed = JSON.parse(raw) as HistoryEntry[];
                    setEntries(parsed);
                }
            })
            .catch(() => { }) // silently ignore read errors
            .finally(() => setLoaded(true));
    }, []);

    // ── Persist whenever entries change (after load) ─
    useEffect(() => {
        if (!loaded) return;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
            .catch(() => { });
    }, [entries, loaded]);

    // ── Add entry (called on = press) ───────────────
    const addEntry = useCallback((expression: string, result: string) => {
        if (!expression || !result || result === 'Error') return;
        // Avoid duplicate consecutive entries
        setEntries(prev => {
            const last = prev[0];
            if (last?.expression === expression && last?.result === result) return prev;

            const entry: HistoryEntry = {
                id: `${Date.now()}-${Math.random()}`,
                expression,
                result,
                timestamp: Date.now(),
            };

            // Keep newest first, max 25
            return [entry, ...prev].slice(0, MAX_ENTRIES);
        });
    }, []);

    // ── Clear all ────────────────────────────────────
    const clearHistory = useCallback(() => {
        setEntries([]);
    }, []);

    return { entries, addEntry, clearHistory };
}