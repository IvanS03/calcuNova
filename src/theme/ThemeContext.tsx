import React, {
  createContext,
  ReactNode,
  useContext,
  useState
} from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from './colors';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme:       AppTheme;
  isDark:      boolean;
  mode:        ThemeMode;
  setMode:     (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:   darkTheme,
  isDark:  true,
  mode:    'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark =
    mode === 'system'
      ? systemScheme !== 'light'   // follows phone
      : mode === 'dark';

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