import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'warm' | 'luxury';

export interface ThemePreset {
  id: AppTheme;
  word: string;
  name: string;
  palette: {
    dark: string;
    subtle: string;
    primary: string;
    accent: string;
    light: string;
  };
}

export const THEME_PRESETS: Record<AppTheme, ThemePreset> = {
  warm: {
    id: 'warm',
    word: 'Warm',
    name: 'Warm Ethiopian Café',
    palette: {
      dark: '#211710',
      subtle: '#302218',
      primary: '#E99524',
      accent: '#E99524',
      light: '#F7F1E8',
    },
  },
  luxury: {
    id: 'luxury',
    word: 'Luxury',
    name: 'Modern Luxury Café',
    palette: {
      dark: '#171719',
      subtle: '#292326',
      primary: '#4B3024',
      accent: '#C6A15B',
      light: '#F2EBDD',
    },
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  preset: ThemePreset;
  allPresets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('zion_theme');
    return saved === 'luxury' || saved === 'warm' ? saved : 'warm';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zion_theme', theme);
  }, [theme]);

  const setTheme = (t: AppTheme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'warm' ? 'luxury' : 'warm'));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        preset: THEME_PRESETS[theme],
        allPresets: Object.values(THEME_PRESETS),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
