import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeStyle = 'deepsite' | 'brutalist' | 'skeuomorphic' | 'retro';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  style: ThemeStyle;
  mode: ThemeMode;
  setStyle: (style: ThemeStyle) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  style: 'deepsite',
  mode: 'dark',
  setStyle: () => {},
  setMode: () => {},
  toggleMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [style, setStyle] = useState<ThemeStyle>('deepsite');
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Load theme preferences from localStorage
  useEffect(() => {
    const storedStyle = localStorage.getItem('themeStyle') as ThemeStyle;
    const storedMode = localStorage.getItem('themeMode') as ThemeMode;

    if (storedStyle) {
      setStyle(storedStyle);
    }

    if (storedMode) {
      setMode(storedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('themeStyle', style);
    localStorage.setItem('themeMode', mode);

    // Apply theme to the document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);

    // Apply theme style
    document.documentElement.setAttribute('data-theme-style', style);
  }, [style, mode]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const value = {
    style,
    mode,
    setStyle,
    setMode,
    toggleMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
