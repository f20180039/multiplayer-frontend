import { createContext, useContext } from "react";
import { clientEnv } from "./config/env";
import { LocalStorageKey } from "./constants";

export enum AppTheme {
  AURORA = "aurora",
  MIDNIGHT = "midnight",
  EMBER = "ember",
}

export const THEME_OPTIONS = [
  { id: AppTheme.AURORA, label: "Aurora" },
  { id: AppTheme.MIDNIGHT, label: "Midnight" },
  { id: AppTheme.EMBER, label: "Ember" },
] as const;

export interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themes: typeof THEME_OPTIONS;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const isAppTheme = (value?: string | null): value is AppTheme =>
  Boolean(value && Object.values(AppTheme).includes(value as AppTheme));

export const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(LocalStorageKey.THEME);
  if (isAppTheme(savedTheme)) return savedTheme;
  if (isAppTheme(clientEnv.defaultTheme)) return clientEnv.defaultTheme;
  return AppTheme.AURORA;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
