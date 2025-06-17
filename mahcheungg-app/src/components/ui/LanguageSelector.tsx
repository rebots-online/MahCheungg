import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Language } from '../../i18n/translations';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh-HK', name: '廣東話', flag: '🇭🇰' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center px-3 py-2 rounded-lg transition-all hover:scale-105"
        style={{
          backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
          color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)',
          border: isDeepSite ? '1px solid #475569' : '1px solid #e5e7eb',
          boxShadow: isDeepSite ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <span className="mr-2">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <span className="ml-2">▼</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50"
          style={{
            backgroundColor: isDeepSite ? '#1e293b' : 'var(--card-bg, #ffffff)',
            border: isDeepSite ? '1px solid #334155' : '1px solid #e5e7eb',
            boxShadow: isDeepSite ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="py-1">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className="flex items-center w-full px-4 py-2 text-left hover:scale-105 transition-all"
                style={{
                  backgroundColor: language === lang.code
                    ? (isDeepSite ? '#4a2545' : 'var(--accent-light, #f3f4f6)')
                    : 'transparent',
                  color: isDeepSite
                    ? (language === lang.code ? '#ffc107' : '#cbd5e1')
                    : 'var(--text-color, #1f2937)'
                }}
              >
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
