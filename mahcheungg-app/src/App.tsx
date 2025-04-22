import { useState, useEffect } from 'react';
import HomePage from './components/ui/HomePage';
import GameController from './components/game/GameController';
import GameHub from './components/hub/GameHub';
import LearningCenter from './components/learn/LearningCenter';
import { AIDifficulty } from './models/player/AIPlayer';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import WebLNService from './services/WebLNService';
import AudioService from './services/AudioService';
import ChatbotService from './services/ChatbotService';
import SpeechService from './services/SpeechService';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameHub, setShowGameHub] = useState(true); // Set to true to show the game hub by default
  const [showLearningCenter, setShowLearningCenter] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(4);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [weblnAvailable, setWeblnAvailable] = useState(false);

  // Initialize services
  useEffect(() => {
    // Initialize WebLN
    const initializeWebLN = async () => {
      try {
        const webLNService = WebLNService.getInstance();
        const available = await webLNService.initialize();
        setWeblnAvailable(available);
      } catch (error) {
        console.error('Failed to initialize WebLN:', error);
        setWeblnAvailable(false);
      }
    };

    // Initialize Audio Service
    const initializeAudio = () => {
      try {
        const audioService = AudioService.getInstance();
        audioService.preloadCommonTerms();
      } catch (error) {
        console.error('Failed to initialize Audio Service:', error);
      }
    };

    // Initialize Chatbot Service
    const initializeChatbot = () => {
      try {
        // Just get the instance to initialize it
        ChatbotService.getInstance();
      } catch (error) {
        console.error('Failed to initialize Chatbot Service:', error);
      }
    };

    // Initialize Speech Service
    const initializeSpeech = () => {
      try {
        // Just get the instance to initialize it
        SpeechService.getInstance();
      } catch (error) {
        console.error('Failed to initialize Speech Service:', error);
      }
    };

    initializeWebLN();
    initializeAudio();
    initializeChatbot();
    initializeSpeech();
  }, []);

  const handleStartGame = (name: string, count: number, difficulty: AIDifficulty, mode?: string) => {
    if (mode === 'learn') {
      setShowGameHub(false);
      setShowLearningCenter(true);
      setGameStarted(false);
    } else {
      setPlayerName(name);
      setPlayerCount(count);
      setAIDifficulty(difficulty);
      setGameStarted(true);
      setShowGameHub(false);
      setShowLearningCenter(false);
    }
  };

  const handleBackToHub = () => {
    setShowGameHub(true);
    setShowLearningCenter(false);
    setGameStarted(false);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
          {showGameHub ? (
            <GameHub onStartGame={handleStartGame} />
          ) : showLearningCenter ? (
            <LearningCenter onBack={handleBackToHub} />
          ) : !gameStarted ? (
            <HomePage onStartGame={handleStartGame} />
          ) : (
            <GameController
              playerName={playerName}
              playerCount={playerCount}
              aiDifficulty={aiDifficulty}
            />
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App
