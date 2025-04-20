import React, { useState } from 'react';
import { AIDifficulty } from '../../models/player/AIPlayer';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../../contexts/ThemeContext';

interface HomePageProps {
  onStartGame: (playerName: string, playerCount: number, aiDifficulty: AIDifficulty) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('Player 1');
  const [playerCount, setPlayerCount] = useState(4);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);
  const { mode } = useTheme();

  const handleStartGame = () => {
    onStartGame(playerName, playerCount, aiDifficulty);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <ThemeSelector />
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          MahCheungg
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Number of Players
          </label>
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            AI Difficulty
          </label>
          <select
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value as AIDifficulty)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value={AIDifficulty.EASY}>Easy</option>
            <option value={AIDifficulty.MEDIUM}>Medium</option>
            <option value={AIDifficulty.HARD}>Hard</option>
            <option value={AIDifficulty.EXPERT}>Expert</option>
          </select>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          Start Game
        </button>

        <div className="mt-4">
          <button
            onClick={() => setShowSubscriptionInfo(!showSubscriptionInfo)}
            className="text-blue-500 hover:text-blue-600 text-sm underline"
          >
            {showSubscriptionInfo ? 'Hide Subscription Info' : 'Show Subscription Info'}
          </button>

          {showSubscriptionInfo && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <h3 className="font-bold mb-1">Subscription Tiers:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-semibold">Free Trial/Teaching Mode:</span> Limited functionality focused on learning
                </li>
                <li>
                  <span className="font-semibold">Standard Tier ($4.99/month):</span> Local LAN play with AI and human players
                </li>
                <li>
                  <span className="font-semibold">Premium Tier ($9.99/month):</span> Online matchmaking with similarly skilled players
                </li>
              </ul>
              <p className="mt-2">
                You are currently using the Free Trial version. Upgrade for full features!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
