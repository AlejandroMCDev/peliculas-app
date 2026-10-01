import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export type ThemeContextValue = {
  /** What the user chose. */
  theme: Theme;
  /** What is actually painted ('system' resolved through the OS preference). */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}
