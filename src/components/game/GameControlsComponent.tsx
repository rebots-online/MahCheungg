import React from 'react';
import { GameAction } from '../../models/player/Player';
import { useTheme } from '../../contexts/ThemeContext';

interface GameControlsComponentProps {
  availableActions: GameAction[];
  onAction: (action: GameAction) => void;
  isCurrentPlayer: boolean;
  isGameInProgress: boolean;
  onStartGame?: () => void;
  onRestartGame?: () => void;
}

const GameControlsComponent: React.FC<GameControlsComponentProps> = ({
  availableActions,
  onAction,
  isCurrentPlayer,
  isGameInProgress,
  onStartGame,
  onRestartGame
}) => {
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';
  
  // Handle action button click
  const handleActionClick = (action: GameAction) => {
    onAction(action);
  };
  
  // Get button style based on theme
  const getButtonStyle = (isDisabled: boolean = false) => {
    return {
      backgroundColor: isDeepSite ? '#4a2545' : '#3b82f6',
      color: isDeepSite ? '#ffc107' : '#ffffff',
      border: isDeepSite ? '1px solid #ffc107' : 'none',
      opacity: isDisabled ? 0.5 : 1
    };
  };
  
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: isDeepSite ? '#1e293b' : '#f3f4f6' }}>
      <div className="text-center mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
        Game Controls
      </div>
      
      <div className="flex flex-wrap justify-center gap-2">
        {/* Game Start/Restart Controls */}
        {!isGameInProgress && onStartGame && (
          <button
            onClick={onStartGame}
            className="px-4 py-2 rounded-lg font-bold"
            style={getButtonStyle()}
          >
            Start Game
          </button>
        )}
        
        {isGameInProgress && onRestartGame && (
          <button
            onClick={onRestartGame}
            className="px-4 py-2 rounded-lg font-bold"
            style={getButtonStyle()}
          >
            Restart Game
          </button>
        )}
        
        {/* Action Controls */}
        {isGameInProgress && isCurrentPlayer && (
          <>
            {availableActions.includes(GameAction.CHOW) && (
              <button
                onClick={() => handleActionClick(GameAction.CHOW)}
                className="px-4 py-2 rounded-lg font-bold"
                style={getButtonStyle()}
              >
                Chow (Sreung)
              </button>
            )}
            
            {availableActions.includes(GameAction.PUNG) && (
              <button
                onClick={() => handleActionClick(GameAction.PUNG)}
                className="px-4 py-2 rounded-lg font-bold"
                style={getButtonStyle()}
              >
                Pung
              </button>
            )}
            
            {availableActions.includes(GameAction.KONG) && (
              <button
                onClick={() => handleActionClick(GameAction.KONG)}
                className="px-4 py-2 rounded-lg font-bold"
                style={getButtonStyle()}
              >
                Kong
              </button>
            )}
            
            {availableActions.includes(GameAction.MAHJONG) && (
              <button
                onClick={() => handleActionClick(GameAction.MAHJONG)}
                className="px-4 py-2 rounded-lg font-bold"
                style={{
                  backgroundColor: isDeepSite ? '#b91c1c' : '#ef4444',
                  color: '#ffffff',
                  border: isDeepSite ? '1px solid #ffc107' : 'none'
                }}
              >
                Mahjong (Huu)
              </button>
            )}
          </>
        )}
        
        {/* Pass Button */}
        {isGameInProgress && isCurrentPlayer && availableActions.length > 0 && (
          <button
            onClick={() => handleActionClick(GameAction.DRAW)}
            className="px-4 py-2 rounded-lg font-bold"
            style={{
              backgroundColor: isDeepSite ? '#334155' : '#9ca3af',
              color: isDeepSite ? '#cbd5e1' : '#ffffff'
            }}
          >
            Pass
          </button>
        )}
      </div>
    </div>
  );
};

export default GameControlsComponent;
