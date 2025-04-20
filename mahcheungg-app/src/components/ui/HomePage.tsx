import React, { useState, useEffect } from 'react';
import { AIDifficulty } from '../../models/player/AIPlayer';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { TileFactory, WindType, DragonType } from '../../models/game/Tile';

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

  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
         style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}>
      <div className="rounded-lg shadow-lg p-6 w-full max-w-md"
           style={isDeepSite ?
             { backgroundColor: 'var(--player-info-bg, #16213e)', borderLeft: '4px solid var(--accent-color, #ffc107)' } :
             { backgroundColor: 'var(--board-bg, #e5e7eb)' }}>
        {/* Game title with mahjong tile icons */}
        <div className="flex justify-center items-center mb-2">
          <div className="mahjong-tile-hidden w-10 h-14 mr-2" style={{ transform: 'rotate(-5deg)' }}></div>
          <h1 className="text-3xl font-bold text-center"
              style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            MahCheungg
          </h1>
          <div className="mahjong-tile-hidden w-10 h-14 ml-2" style={{ transform: 'rotate(5deg)' }}></div>
        </div>

        <p className="text-center mb-6"
           style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
          The Ultimate Mahjong Experience
        </p>
        <ThemeSelector />

        <div className="mb-4">
          <label className="block mb-2 font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={isDeepSite ? {
              backgroundColor: '#2a2a4a',
              color: '#ffffff',
              borderColor: '#ffc107',
              boxShadow: '0 0 5px rgba(255, 193, 7, 0.3)'
            } : {}}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            Number of Players
          </label>
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={isDeepSite ? {
              backgroundColor: '#2a2a4a',
              color: '#ffffff',
              borderColor: '#ffc107',
              boxShadow: '0 0 5px rgba(255, 193, 7, 0.3)'
            } : {}}
          >
            <option value={2} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>2 Players</option>
            <option value={3} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>3 Players</option>
            <option value={4} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>4 Players</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
            AI Difficulty
          </label>
          <select
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value as AIDifficulty)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={isDeepSite ? {
              backgroundColor: '#2a2a4a',
              color: '#ffffff',
              borderColor: '#ffc107',
              boxShadow: '0 0 5px rgba(255, 193, 7, 0.3)'
            } : {}}
          >
            <option value={AIDifficulty.EASY} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>Easy</option>
            <option value={AIDifficulty.MEDIUM} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>Medium</option>
            <option value={AIDifficulty.HARD} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>Hard</option>
            <option value={AIDifficulty.EXPERT} style={isDeepSite ? { backgroundColor: '#1a1a2e' } : {}}>Expert</option>
          </select>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 relative overflow-hidden"
          style={isDeepSite ? {
            backgroundColor: '#4a2545',
            color: '#ffffff',
            border: '2px solid #ffc107',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(0)',
          } : { backgroundColor: 'var(--board-bg, #e5e7eb)', color: 'var(--text-color, #1f2937)' }}
          onMouseOver={(e) => {
            if (isDeepSite) {
              e.currentTarget.style.backgroundColor = '#5c2d56';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (isDeepSite) {
              e.currentTarget.style.backgroundColor = '#4a2545';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
            }
          }}
        >
          <span className="mr-2">🀄</span>
          Start Game
          <span className="ml-2">🀄</span>
        </button>

        <div className="mt-6 pt-4" style={isDeepSite ? { borderTop: '1px solid rgba(255, 193, 7, 0.3)' } : {}}>
          <button
            onClick={() => setShowSubscriptionInfo(!showSubscriptionInfo)}
            className="text-sm underline"
            style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}
          >
            {showSubscriptionInfo ? 'Hide Subscription Info' : 'Show Subscription Info'}
          </button>

          {showSubscriptionInfo && (
            <div className="mt-3 text-sm rounded-lg p-3"
                 style={isDeepSite ? {
                   backgroundColor: 'rgba(74, 37, 69, 0.5)',
                   color: '#ffffff',
                   border: '1px solid rgba(255, 193, 7, 0.3)'
                 } : {}}>
              <h3 className="font-bold mb-2" style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                Subscription Tiers:
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold" style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Free Trial/Teaching Mode:
                  </span>
                  <span style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    Limited functionality focused on learning
                  </span>
                </li>
                <li>
                  <span className="font-semibold" style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Standard Tier ($4.99/month):
                  </span>
                  <span style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    Local LAN play with AI and human players
                  </span>
                </li>
                <li>
                  <span className="font-semibold" style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                    Premium Tier ($9.99/month):
                  </span>
                  <span style={{ color: isDeepSite ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
                    Online matchmaking with similarly skilled players
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-center font-bold"
                 style={{ color: isDeepSite ? '#ffc107' : 'var(--text-color, #1f2937)' }}>
                You are currently using the Free Trial version.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
