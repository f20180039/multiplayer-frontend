import { FiCheck } from "react-icons/fi";
import { AppTheme, useTheme } from "../theme";

const themeLabels: Record<AppTheme, string> = {
  [AppTheme.AURORA]: "Aurora",
  [AppTheme.MIDNIGHT]: "Midnight",
  [AppTheme.EMBER]: "Ember",
};

export const ThemeToggle = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="theme-switcher" aria-label="Theme selector">
      {themes.map((option) => {
        const isActive = option.id === theme;
        return (
          <button
            key={option.id}
            type="button"
            className="theme-switcher__button"
            data-active={isActive}
            onClick={() => setTheme(option.id)}
            aria-pressed={isActive}
          >
            {isActive && <FiCheck aria-hidden="true" />}
            <span>{themeLabels[option.id]}</span>
          </button>
        );
      })}
    </div>
  );
};
