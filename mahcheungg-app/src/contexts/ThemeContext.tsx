import React, { createContext, useState, useContext, ReactNode } from 'react';

// Theme style types
export type ThemeStyle = 'default' | 'brutalist' | 'skeuomorphic' | 'retro';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  style: ThemeStyle;
  mode: ThemeMode;
  setStyle: (style: ThemeStyle) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [style, setStyle] = useState<ThemeStyle>('default');
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ style, mode, setStyle, setMode, toggleMode }}>
      <div data-theme-style={style} data-theme-mode={mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
