import { useState } from 'react';
import HomePage from './components/ui/HomePage';
import GameController from './components/game/GameController';
import { AIDifficulty } from './models/player/AIPlayer';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(4);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);

  const handleStartGame = (name: string, count: number, difficulty: AIDifficulty) => {
    setPlayerName(name);
    setPlayerCount(count);
    setAIDifficulty(difficulty);
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {!gameStarted ? (
        <HomePage onStartGame={handleStartGame} />
      ) : (
        <GameController
          playerName={playerName}
          playerCount={playerCount}
          aiDifficulty={aiDifficulty}
        />
      )}
    </div>
  );
}

export default App
