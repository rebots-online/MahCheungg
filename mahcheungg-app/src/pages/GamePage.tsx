import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameManager } from '../models/game/GameManager';
import { GameState } from '../models/game/GameState';
import { Player, GameAction, UICallbacks } from '../models/player/Player';
import { HumanPlayer } from '../models/player/HumanPlayer';
import { AIPlayer, AIDifficulty, AIPersonality } from '../models/player/AIPlayer';
import { Tile } from '../models/game/Tile';
import GameBoardComponent from '../components/game/GameBoardComponent';
import GameControlsComponent from '../components/game/GameControlsComponent';
import GameSetupComponent, { GameConfig } from '../components/game/GameSetupComponent';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionService from '../services/SubscriptionService';
import { SubscriptionTier } from '../services/StripeService';

const GamePage: React.FC = () => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isGameInProgress, setIsGameInProgress] = useState<boolean>(false);
  const [availableActions, setAvailableActions] = useState<GameAction[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);

  const { style } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDeepSite = style === 'deepsite';

  // Get the current subscription tier
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      if (user) {
        const subscriptionService = SubscriptionService.getInstance();
        await subscriptionService.initialize(user.id);
        const tier = await subscriptionService.getSubscriptionTier();
        setSubscriptionTier(tier);
      }
    };

    fetchSubscriptionTier();
  }, [user]);

  // Create UI callbacks for the human player
  const createUICallbacks = (): UICallbacks => {
    return {
      onHandUpdated: (hand: Tile[]) => {
        // Update the UI with the new hand
        console.log('Hand updated:', hand);
      },
      onDiscardPileUpdated: (discardPile: Tile[]) => {
        // Update the UI with the new discard pile
        console.log('Discard pile updated:', discardPile);
      },
      onExposedSetsUpdated: (exposedSets: any[]) => {
        // Update the UI with the new exposed sets
        console.log('Exposed sets updated:', exposedSets);
      },
      requestDiscardDecision: (callback: (tile: Tile) => void) => {
        // Request a discard decision from the player
        // This would typically be handled by the UI
        // For now, we'll just log it
        console.log('Requesting discard decision');
      },
      requestActionDecision: (availableActions: GameAction[], discardedTile: Tile, callback: (decision: any) => void) => {
        // Request an action decision from the player
        // This would typically be handled by the UI
        // For now, we'll just log it
        console.log('Requesting action decision:', availableActions, discardedTile);
        setAvailableActions(availableActions);
      },
      onMessageSent: (message: string) => {
        // Handle a message sent by the player
        console.log('Message sent:', message);
      },
      onMessageReceived: (message: string, sender: Player) => {
        // Handle a message received from another player
        console.log('Message received from', sender.name, ':', message);
      }
    };
  };

  // Create a mock player connection
  const createMockPlayerConnection = () => {
    return {
      connect: async () => true,
      disconnect: () => {},
      isConnected: () => true,
      sendMessage: (message: string) => {
        console.log('Sending message:', message);
      },
      onMessageReceived: (callback: (message: string, senderId: string) => void) => {
        // Register a callback for received messages
      },
      sendGameAction: (action: GameAction, params: any) => {
        console.log('Sending game action:', action, params);
      },
      onGameActionReceived: (callback: (action: GameAction, params: any) => void) => {
        // Register a callback for received game actions
      }
    };
  };

  // Start a new game with the given configuration
  const startGame = (config: GameConfig) => {
    // Create players
    const newPlayers: Player[] = [];

    // Create the human player
    const humanPlayer = new HumanPlayer(
      'player-1',
      config.playerName,
      createMockPlayerConnection() as any,
      createUICallbacks()
    );
    newPlayers.push(humanPlayer);

    // Create AI players
    for (let i = 1; i < config.playerCount; i++) {
      const aiPlayer = new AIPlayer(
        `ai-${i}`,
        `AI Player ${i}`,
        config.aiDifficulty,
        config.aiPersonality
      );
      newPlayers.push(aiPlayer);
    }

    // Create the game manager
    const newGameManager = new GameManager(newPlayers, config.includeBonus);

    // Set up event listeners
    newGameManager.addEventListener('gameStarted', (data: any) => {
      console.log('Game started:', data);
      setGameState(newGameManager.getGameState());
      setIsGameInProgress(true);
    });

    newGameManager.addEventListener('turnStarted', (data: any) => {
      console.log('Turn started:', data);
      setGameState(newGameManager.getGameState());
      setCurrentPlayerIndex(newPlayers.indexOf(data.player));
    });

    newGameManager.addEventListener('turnEnded', (data: any) => {
      console.log('Turn ended:', data);
      setGameState(newGameManager.getGameState());
    });

    newGameManager.addEventListener('gameEnded', (data: any) => {
      console.log('Game ended:', data);
      setGameState(newGameManager.getGameState());
      setIsGameInProgress(false);
    });

    // Start the game
    newGameManager.startGame();

    // Update state
    setGameManager(newGameManager);
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
  };

  // Handle tile discard
  const handleTileDiscard = (tile: Tile) => {
    if (gameState && currentPlayerIndex === 0) {
      // Discard the tile
      gameState.discardTile(tile);

      // Update the game state
      setGameState(gameState);
    }
  };

  // Handle game action
  const handleGameAction = (action: GameAction) => {
    console.log('Game action:', action);

    // Handle the action based on the type
    switch (action) {
      case GameAction.MAHJONG:
        // Declare a win
        if (gameState) {
          gameState.declareWin();
          setGameState(gameState);
        }
        break;
      case GameAction.DRAW:
      case GameAction.DISCARD:
      case GameAction.CHOW:
      case GameAction.PUNG:
      case GameAction.KONG:
        // These actions would be handled by the game manager
        break;
    }

    // Clear available actions
    setAvailableActions([]);
  };

  // Restart the game
  const restartGame = () => {
    setGameManager(null);
    setGameState(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setIsGameInProgress(false);
    setAvailableActions([]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
        MahCheungg
      </h1>

      {!isGameInProgress && !gameManager ? (
        <GameSetupComponent
          onStartGame={startGame}
          currentSubscriptionTier={subscriptionTier}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Game Board */}
          <div className="flex-1">
            {gameState && (
              <GameBoardComponent
                gameState={gameState}
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                onTileDiscard={handleTileDiscard}
              />
            )}
          </div>

          {/* Game Controls */}
          <div className="w-full lg:w-64">
            <GameControlsComponent
              availableActions={availableActions}
              onAction={handleGameAction}
              isCurrentPlayer={currentPlayerIndex === 0}
              isGameInProgress={isGameInProgress}
              onRestartGame={restartGame}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
