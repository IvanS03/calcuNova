import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from './colors';

type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'app_theme_mode';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  isDark: true,
  mode: 'system',
  setMode: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  // ── Load persisted mode ─────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => { })
      .finally(() => setLoaded(true));
  }, []);

  // ── Persist on change ───────────────────────────
  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => { });
  }, []);

  const isDark = mode === 'system'
    ? systemScheme !== 'light'
    : mode === 'dark';

  // Don't render until loaded to avoid flash
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      mode,
      setMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}