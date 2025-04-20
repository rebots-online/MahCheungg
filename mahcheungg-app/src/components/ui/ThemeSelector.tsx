import React from 'react';
import { useTheme, ThemeStyle, ThemeMode } from '../../contexts/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { style, mode, setStyle, toggleMode } = useTheme();

  const themeStyles: ThemeStyle[] = ['default', 'brutalist', 'skeuomorphic', 'retro'];

  return (
    <div className="theme-selector p-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow">
      <div className="flex items-center mb-2">
        <span className="mr-2 text-sm">Theme:</span>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as ThemeStyle)}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          {themeStyles.map((themeStyle) => (
            <option key={themeStyle} value={themeStyle}>
              {themeStyle.charAt(0).toUpperCase() + themeStyle.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={toggleMode}
          className="ml-4 p-1 rounded bg-gray-300 dark:bg-gray-600"
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
