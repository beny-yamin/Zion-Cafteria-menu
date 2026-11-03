import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme, THEME_PRESETS } from '../../context/ThemeContext.js';

export const ThemeSwitcher: React.FC<{ compact?: boolean }> = () => {
  const { theme, toggleTheme } = useTheme();
  const isWarm = theme === 'warm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Current: ${isWarm ? 'Warm Ethiopian' : 'Modern Luxury'}. Tap to toggle theme`}
      title={isWarm ? 'Tap to switch to Modern Luxury' : 'Tap to switch to Warm Ethiopian'}
      className="touch-target min-h-[44px] min-w-[44px] px-3 py-2 rounded-2xl bg-cafe-card hover:bg-cafe-cream border border-cafe-border flex items-center justify-center space-x-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cafe-amber active:scale-95"
    >
      {isWarm ? (
        <Sun className="w-4 h-4 text-cafe-amber" />
      ) : (
        <Moon className="w-4 h-4 text-cafe-accent" />
      )}
      <div className="flex -space-x-1 items-center">
        <span
          className="w-2.5 h-2.5 rounded-full border border-cafe-card transition-colors"
          style={{ backgroundColor: THEME_PRESETS[theme].palette.dark }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full border border-cafe-card transition-colors"
          style={{ backgroundColor: THEME_PRESETS[theme].palette.primary }}
        />
      </div>
    </button>
  );
};
