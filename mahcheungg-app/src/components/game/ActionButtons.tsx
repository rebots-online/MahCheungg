import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Player } from '../../models/player/Player';

interface ActionButtonsProps {
  onAction: (action: string, targetPlayer?: Player) => void;
  disabledActions?: string[];
  opponents?: Player[];
  currentPlayer?: Player;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  disabledActions = [],
  opponents = [],
  currentPlayer
}) => {
  const [hintVisible, setHintVisible] = useState(false);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  const handleAction = (action: string) => {
    // For Huu (mahjong), show target selection if we have opponents
    if (action === 'huu' && opponents.length > 0 && !showTargetSelection) {
      setShowTargetSelection(true);
      return;
    }

    // For other actions or if target is selected
    if (action !== 'huu' || !showTargetSelection) {
      onAction(action);
    }
  };

  const handleTargetSelection = (player: Player) => {
    setSelectedTarget(player);
    setShowTargetSelection(false);
    onAction('huu', player);
  };

  const toggleHint = () => {
    setHintVisible(!hintVisible);
    setShowTargetSelection(false);
  };

  return (
    <div className={`w-full max-w-4xl mt-4 flex justify-between items-start p-2 rounded-lg shadow ${style === 'deepsite' ? '' : 'bg-gray-200 dark:bg-gray-700'}`}
         style={style === 'deepsite' ? { backgroundColor: 'var(--player-info-bg, #16213e)' } : {}}>
      <div className="space-x-2">
        {style === 'deepsite' ? (
          // DeepSite theme buttons
          <>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${disabledActions.includes('chow') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('sheung')}
              disabled={disabledActions.includes('chow') || disabledActions.includes('sheung')}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-exchange-alt mr-2"></i>Sheung
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${disabledActions.includes('pung') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('pung')}
              disabled={disabledActions.includes('pung')}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-exchange-alt mr-2"></i>Pung
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${disabledActions.includes('kong') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('kong')}
              disabled={disabledActions.includes('kong')}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-exchange-alt mr-2"></i>Kong
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${disabledActions.includes('mahjong') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('huu')}
              disabled={disabledActions.includes('mahjong') || disabledActions.includes('huu')}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-check mr-2"></i>Huu
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all ${disabledActions.includes('discard') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('discard')}
              disabled={disabledActions.includes('discard')}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-times mr-2"></i>Discard
            </button>
            <button
              className="px-4 py-2 rounded-lg transition-all"
              onClick={toggleHint}
              style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderColor: 'var(--accent-color, #ffc107)', borderWidth: '1px' }}
            >
              <i className="fas fa-question-circle mr-2"></i>Hint
            </button>
          </>
        ) : (
          // Original theme buttons
          <>
            <button
              className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${disabledActions.includes('chow') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('sheung')}
              disabled={disabledActions.includes('chow') || disabledActions.includes('sheung')}
            >
              Sheung
            </button>
            <button
              className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${disabledActions.includes('pung') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('pung')}
              disabled={disabledActions.includes('pung')}
            >
              Pung
            </button>
            <button
              className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${disabledActions.includes('kong') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('kong')}
              disabled={disabledActions.includes('kong')}
            >
              Kong
            </button>
            <button
              className={`px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 ${disabledActions.includes('mahjong') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('huu')}
              disabled={disabledActions.includes('mahjong') || disabledActions.includes('huu')}
            >
              Huu
            </button>
            <button
              className={`px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 ${disabledActions.includes('discard') ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleAction('discard')}
              disabled={disabledActions.includes('discard')}
            >
              Discard
            </button>
            <button
              className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
              onClick={toggleHint}
            >
              Hint?
            </button>
          </>
        )}
      </div>
      <div
        id="hint-area"
        className="text-sm text-right w-1/3"
        style={style === 'deepsite' ? { color: 'var(--text-color, #e6e6e6)' } : { color: 'var(--text-color, #1f2937)' }}
      >
        {showTargetSelection ? (
          <div className="bg-gray-800 p-2 rounded shadow-lg">
            <p className="mb-2 font-bold" style={{ color: 'var(--accent-color, #ffc107)' }}>Select player to target:</p>
            <div className="flex flex-col space-y-1">
              {opponents.map((player) => (
                <button
                  key={player.id}
                  className="px-2 py-1 text-left hover:bg-gray-700 rounded"
                  onClick={() => handleTargetSelection(player)}
                  style={{ borderLeft: '2px solid var(--accent-color, #ffc107)' }}
                >
                  {player.name} {player.isAI ? '(AI)' : ''}
                </button>
              ))}
            </div>
          </div>
        ) : hintVisible ? (
          <span className="hint-ok font-semibold">
            Hint: Select a tile to discard.
          </span>
        ) : (
          'Select a tile to discard.'
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
