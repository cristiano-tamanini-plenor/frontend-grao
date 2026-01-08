import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
import { applyTheme, type ThemeMode } from './index';

export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';

const THEME_STORAGE_KEY = 'theme-preference';

/**
 * Get theme preference from localStorage
 */
function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'LIGHT';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'LIGHT' || stored === 'DARK' || stored === 'SYSTEM') {
    return stored;
  }
  return 'LIGHT';
}

/**
 * Save theme preference to localStorage
 */
function saveThemePreference(preference: ThemePreference): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }
}

/**
 * Get effective theme mode from preference
 */
function getModeFromPreference(preference: ThemePreference): ThemeMode {
  if (preference === 'SYSTEM') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference.toLowerCase() as ThemeMode;
}

interface ThemeContextType {
  preference: ThemePreference;
  mode: ThemeMode;
  setTheme: (preference: ThemePreference) => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Filters out unwanted props that might be injected by dev tools or browser extensions
 */
function filterUnwantedProps(props: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {};
  const unwantedPrefixes = ['data-lov-', 'data-component-'];
  
  for (const key in props) {
    const shouldInclude = !unwantedPrefixes.some(prefix => key.startsWith(prefix));
    if (shouldInclude) {
      filtered[key] = props[key];
    }
  }
  
  return filtered;
}

/**
 * Theme Provider component
 * Provides theme state to all child components
 */
export function ThemeProvider({ children, ...props }: { children: ReactNode } & Record<string, any>) {
  
  // Initialize preference from localStorage
  const storedPreference = getStoredThemePreference();
  const initialMode = getModeFromPreference(storedPreference);
  
  // Apply theme synchronously during initialization to prevent flash
  if (typeof window !== 'undefined') {
    applyTheme(initialMode);
  }
  
  const [preference, setPreference] = useState<ThemePreference>(storedPreference);
  const [actualMode, setActualMode] = useState<ThemeMode>(initialMode);

  // Apply theme based on preference
  const applyThemeFromPreference = useCallback((newPreference: ThemePreference) => {
    const mode = getModeFromPreference(newPreference);
    applyTheme(mode);
    setActualMode(mode);
  }, []);

  // Apply theme when preference changes
  useEffect(() => {
    applyThemeFromPreference(preference);
  }, [preference, applyThemeFromPreference]);

  // Watch for system preference changes when preference is SYSTEM
  useEffect(() => {
    if (preference !== 'SYSTEM') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const mode = mediaQuery.matches ? 'dark' : 'light';
      applyTheme(mode);
      setActualMode(mode);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [preference]);

  // Sincronizar com localStorage quando o componente é montado ou quando a página ganha foco
  // Isso garante que sempre use o valor do localStorage como fonte da verdade
  useEffect(() => {
    const syncThemeFromStorage = () => {
      const storedPreference = getStoredThemePreference();
      // Só atualizar se o valor no localStorage for diferente do estado atual
      if (storedPreference !== preference) {
        setPreference(storedPreference);
        applyThemeFromPreference(storedPreference);
      }
    };

    // Sincronizar imediatamente ao montar
    syncThemeFromStorage();

    // Sincronizar quando a janela ganha foco (útil quando voltar de outra aba)
    window.addEventListener('focus', syncThemeFromStorage);
    
    // Sincronizar quando o storage mudar (útil se houver múltiplas abas)
    window.addEventListener('storage', syncThemeFromStorage);

    return () => {
      window.removeEventListener('focus', syncThemeFromStorage);
      window.removeEventListener('storage', syncThemeFromStorage);
    };
  }, [preference, applyThemeFromPreference]);

  const setTheme = useCallback((newPreference: ThemePreference) => {
    setPreference(newPreference);
    saveThemePreference(newPreference);
    applyThemeFromPreference(newPreference);
  }, [applyThemeFromPreference]);

  const value = {
    preference,
    mode: actualMode,
    setTheme,
    isDark: actualMode === 'dark',
    isLight: actualMode === 'light',
    isSystem: preference === 'SYSTEM',
  };

  // Tema MUI com localização pt-BR
  const muiTheme = createTheme({}, ptBR);

  // Filter out unwanted props before passing to MuiThemeProvider
  const filteredProps = filterUnwantedProps(props);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme} {...filteredProps}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to manage theme with SYSTEM, LIGHT, and DARK modes
 * SYSTEM mode automatically follows the system preference
 * Theme preference is persisted in localStorage
 * 
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
