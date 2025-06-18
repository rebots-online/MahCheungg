import React, { useState } from 'react';
import { AIDifficulty, AIPersonality } from '../../models/player/AIPlayer';
import { useTheme } from '../../contexts/ThemeContext';
import { SubscriptionTier } from '../../services/StripeService';
import SubscriptionService from '../../services/SubscriptionService';

interface GameSetupComponentProps {
  onStartGame: (config: GameConfig) => void;
  currentSubscriptionTier: SubscriptionTier;
}

export interface GameConfig {
  playerName: string;
  playerCount: number;
  aiDifficulty: AIDifficulty;
  aiPersonality: AIPersonality;
  includeBonus: boolean;
}

const GameSetupComponent: React.FC<GameSetupComponentProps> = ({
  onStartGame,
  currentSubscriptionTier
}) => {
  const [playerName, setPlayerName] = useState<string>('Player 1');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(AIPersonality.BALANCED);
  const [includeBonus, setIncludeBonus] = useState<boolean>(true);

  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  // Check if the current subscription tier allows the selected player count
  const isPlayerCountAllowed = () => {
    if (currentSubscriptionTier === SubscriptionTier.FREE) {
      return playerCount <= 2;
    } else if (currentSubscriptionTier === SubscriptionTier.STANDARD) {
      return playerCount <= 4;
    } else {
      return true;
    }
  };

  // Check if the current subscription tier allows the selected AI difficulty
  const isAiDifficultyAllowed = () => {
    if (currentSubscriptionTier === SubscriptionTier.FREE) {
      return aiDifficulty === AIDifficulty.EASY;
    } else if (currentSubscriptionTier === SubscriptionTier.STANDARD) {
      return aiDifficulty !== AIDifficulty.EXPERT;
    } else {
      return true;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPlayerCountAllowed() || !isAiDifficultyAllowed()) {
      return;
    }

    onStartGame({
      playerName,
      playerCount,
      aiDifficulty,
      aiPersonality,
      includeBonus
    });
  };

  return (
    <div className="p-6 rounded-lg shadow-lg max-w-md mx-auto" style={{ backgroundColor: isDeepSite ? '#1e293b' : '#ffffff' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
        Game Setup
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Player Name */}
        <div className="mb-4">
          <label className="block mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 rounded-md"
            style={{
              backgroundColor: isDeepSite ? '#334155' : '#f3f4f6',
              color: isDeepSite ? '#cbd5e1' : '#1f2937',
              border: `1px solid ${isDeepSite ? '#475569' : '#d1d5db'}`
            }}
            required
          />
        </div>

        {/* Player Count */}
        <div className="mb-4">
          <label className="block mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
            Number of Players
          </label>
          <div className="flex space-x-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setPlayerCount(count)}
                className={`flex-1 p-2 rounded-md ${playerCount === count ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: isDeepSite ? '#334155' : '#f3f4f6',
                  color: isDeepSite ? '#cbd5e1' : '#1f2937',
                  border: `1px solid ${isDeepSite ? '#475569' : '#d1d5db'}`,
                  ringColor: isDeepSite ? '#ffc107' : '#3b82f6',
                  opacity: (currentSubscriptionTier === SubscriptionTier.FREE && count > 2) ? 0.5 : 1
                }}
                disabled={currentSubscriptionTier === SubscriptionTier.FREE && count > 2}
              >
                {count}
              </button>
            ))}
          </div>
          {currentSubscriptionTier === SubscriptionTier.FREE && playerCount > 2 && (
            <p className="mt-1 text-sm" style={{ color: isDeepSite ? '#f87171' : '#ef4444' }}>
              Upgrade your subscription to play with more than 2 players.
            </p>
          )}
        </div>

        {/* AI Difficulty */}
        <div className="mb-4">
          <label className="block mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
            AI Difficulty
          </label>
          <select
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(e.target.value as AIDifficulty)}
            className="w-full p-2 rounded-md"
            style={{
              backgroundColor: isDeepSite ? '#334155' : '#f3f4f6',
              color: isDeepSite ? '#cbd5e1' : '#1f2937',
              border: `1px solid ${isDeepSite ? '#475569' : '#d1d5db'}`
            }}
          >
            <option value={AIDifficulty.EASY}>Easy</option>
            <option value={AIDifficulty.MEDIUM}>Medium</option>
            <option value={AIDifficulty.HARD} disabled={currentSubscriptionTier === SubscriptionTier.FREE}>
              Hard {currentSubscriptionTier === SubscriptionTier.FREE ? '(Premium)' : ''}
            </option>
            <option value={AIDifficulty.EXPERT} disabled={currentSubscriptionTier !== SubscriptionTier.PREMIUM}>
              Expert {currentSubscriptionTier !== SubscriptionTier.PREMIUM ? '(Premium)' : ''}
            </option>
          </select>
          {!isAiDifficultyAllowed() && (
            <p className="mt-1 text-sm" style={{ color: isDeepSite ? '#f87171' : '#ef4444' }}>
              Upgrade your subscription to access higher difficulty levels.
            </p>
          )}
        </div>

        {/* AI Personality */}
        <div className="mb-4">
          <label className="block mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
            AI Personality
          </label>
          <select
            value={aiPersonality}
            onChange={(e) => setAiPersonality(e.target.value as AIPersonality)}
            className="w-full p-2 rounded-md"
            style={{
              backgroundColor: isDeepSite ? '#334155' : '#f3f4f6',
              color: isDeepSite ? '#cbd5e1' : '#1f2937',
              border: `1px solid ${isDeepSite ? '#475569' : '#d1d5db'}`
            }}
          >
            <option value={AIPersonality.BALANCED}>Balanced</option>
            <option value={AIPersonality.AGGRESSIVE}>Aggressive</option>
            <option value={AIPersonality.DEFENSIVE}>Defensive</option>
            <option value={AIPersonality.RISKY}>Risky</option>
          </select>
        </div>

        {/* Include Bonus Tiles */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(e) => setIncludeBonus(e.target.checked)}
              className="mr-2"
            />
            <span style={{ color: isDeepSite ? '#cbd5e1' : '#1f2937' }}>
              Include Bonus Tiles (Flowers)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 rounded-md font-bold"
          style={{
            backgroundColor: isDeepSite ? '#4a2545' : '#3b82f6',
            color: isDeepSite ? '#ffc107' : '#ffffff',
            border: isDeepSite ? '1px solid #ffc107' : 'none',
            opacity: (!isPlayerCountAllowed() || !isAiDifficultyAllowed()) ? 0.5 : 1
          }}
          disabled={!isPlayerCountAllowed() || !isAiDifficultyAllowed()}
        >
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameSetupComponent;
