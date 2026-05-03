import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getInitialTheme,
  ThemeContext,
  THEME_OPTIONS,
  type AppTheme,
  type ThemeContextValue,
} from "./theme";
import { LocalStorageKey } from "./constants";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(LocalStorageKey.THEME, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      themes: THEME_OPTIONS,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
