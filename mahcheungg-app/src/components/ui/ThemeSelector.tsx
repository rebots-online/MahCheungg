import React from 'react';
import { useTheme, ThemeStyle, ThemeMode } from '../../contexts/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { style, mode, setStyle, toggleMode } = useTheme();

  const themeStyles: ThemeStyle[] = ['brutalist', 'skeuomorphic', 'retro'];

  return (
    <div className="theme-selector p-3 mb-4 rounded-lg shadow" style={{ backgroundColor: 'var(--board-bg, #e5e7eb)', borderColor: 'var(--tile-border, #d1d5db)', borderWidth: '2px' }}>
      <div className="flex items-center">
        <span className="mr-2 font-bold" style={{ color: 'var(--text-color, #1f2937)' }}>Theme:</span>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as ThemeStyle)}
          className="px-2 py-1 rounded border text-sm"
          style={{
            backgroundColor: 'var(--tile-bg, white)',
            color: 'var(--text-color, #1f2937)',
            borderColor: 'var(--tile-border, #d1d5db)'
          }}
        >
          {themeStyles.map((themeStyle) => (
            <option key={themeStyle} value={themeStyle}>
              {themeStyle.charAt(0).toUpperCase() + themeStyle.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={toggleMode}
          className="ml-4 p-2 rounded"
          style={{
            backgroundColor: 'var(--tile-bg, white)',
            color: 'var(--text-color, #1f2937)',
            borderColor: 'var(--tile-border, #d1d5db)',
            borderWidth: '1px'
          }}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
