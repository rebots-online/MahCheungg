import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Theme style types
export type ThemeStyle = 'deepsite' | 'brutalist' | 'skeuomorphic' | 'retro';
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
  const [style, setStyle] = useState<ThemeStyle>('deepsite');
  const [mode, setMode] = useState<ThemeMode>('light');

  // Custom setStyle that preserves the current mode
  const handleSetStyle = (newStyle: ThemeStyle) => {
    setStyle(newStyle);
    // Keep the current mode when changing styles
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Apply theme attributes to document body
  useEffect(() => {
    document.body.setAttribute('data-theme-style', style);
    document.body.setAttribute('data-theme-mode', mode);

    return () => {
      document.body.removeAttribute('data-theme-style');
      document.body.removeAttribute('data-theme-mode');
    };
  }, [style, mode]);

  return (
    <ThemeContext.Provider value={{ style, mode, setStyle: handleSetStyle, setMode, toggleMode }}>
      {children}
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
