import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AudioService from '../../services/AudioService';

interface CantoneseCharacterProps {
  character: string;
  romanization?: string;
  meaning?: string;
  showMeaning?: boolean;
}

const CantoneseCharacter: React.FC<CantoneseCharacterProps> = ({ 
  character, 
  romanization, 
  meaning, 
  showMeaning = true 
}) => {
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';
  
  const handlePlayAudio = () => {
    const audioService = AudioService.getInstance();
    audioService.playCantonese(character);
  };
  
  return (
    <span 
      className="inline-flex items-center rounded-md px-2 py-1 mx-1 cursor-pointer transition-all hover:scale-105"
      style={{ 
        backgroundColor: isDeepSite ? '#334155' : 'var(--accent-light, #f3f4f6)',
        border: isDeepSite ? '1px solid #475569' : '1px solid #e5e7eb',
        boxShadow: isDeepSite ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
      onClick={handlePlayAudio}
      title={`${meaning ? meaning + ' - ' : ''}Click to hear pronunciation`}
    >
      <span 
        className="text-lg font-bold mr-1"
        style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}
      >
        {character}
      </span>
      
      {romanization && (
        <span 
          className="text-xs"
          style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
        >
          ({romanization})
        </span>
      )}
      
      {showMeaning && meaning && (
        <span 
          className="text-xs ml-1"
          style={{ color: isDeepSite ? '#cbd5e1' : 'var(--text-secondary, #4b5563)' }}
        >
          - {meaning}
        </span>
      )}
      
      <span 
        className="ml-1 text-xs"
        style={{ color: isDeepSite ? '#ffc107' : 'var(--accent, #3b82f6)' }}
      >
        🔊
      </span>
    </span>
  );
};

export default CantoneseCharacter;
