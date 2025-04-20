import React, { useState, useEffect } from 'react';
import { Tile, TileFactory, TileType, WindType, DragonType } from '../../models/game/Tile';
import { GameManager } from '../../models/game/GameManager';
import { GameState } from '../../models/game/GameState';
import { Player } from '../../models/player/Player';
import { HumanPlayer } from '../../models/player/HumanPlayer';
import { AIPlayer, AIDifficulty, AIPersonality } from '../../models/player/AIPlayer';
import { LocalConnection } from '../../models/network/LocalConnection';
import GameBoard from './GameBoard';

interface GameControllerProps {
  playerName: string;
  playerCount: number;
  aiDifficulty: AIDifficulty;
}

const GameController: React.FC<GameControllerProps> = ({
  playerName,
  playerCount,
  aiDifficulty
}) => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the game with sample data for now
  useEffect(() => {
    const initializeWithSampleData = () => {
      try {
        setIsLoading(true);
        console.log('Initializing game with sample data...');

        // Create UI callbacks for human player
        const uiCallbacks = {
          onHandUpdated: (hand: Tile[]) => {
            console.log('Hand updated:', hand);
          },
          onDiscardPileUpdated: (discardPile: Tile[]) => {
            console.log('Discard pile updated:', discardPile);
          },
          onExposedSetsUpdated: (exposedSets: any[]) => {
            console.log('Exposed sets updated:', exposedSets);
          },
          requestDiscardDecision: (callback: (tile: Tile) => void) => {
            console.log('Requesting discard decision');
            // For demo purposes, we'll just use the first tile
            setTimeout(() => {
              if (currentPlayer && currentPlayer.hand.length > 0) {
                callback(currentPlayer.hand[0]);
              }
            }, 500);
          },
          requestActionDecision: (availableActions: any[], discardedTile: Tile, callback: (decision: any) => void) => {
            console.log('Requesting action decision:', availableActions);
            // For demo purposes, we'll just decline all actions
            setTimeout(() => callback(null), 500);
          },
          onMessageSent: (message: string) => {
            console.log('Message sent:', message);
          },
          onMessageReceived: (message: string, sender: Player) => {
            console.log('Message received:', message, 'from:', sender.name);
          }
        };

        // Create human player
        const humanPlayer = new HumanPlayer(
          'player-0',
          playerName || 'Player 1', // Use default name if empty
          null as any,
          uiCallbacks
        );

        // Create AI players
        const aiPlayers: AIPlayer[] = [];
        for (let i = 1; i < playerCount; i++) {
          const aiPlayer = new AIPlayer(
            `player-${i}`,
            `AI Player ${i}`,
            aiDifficulty,
            AIPersonality.BALANCED
          );
          aiPlayers.push(aiPlayer);
        }

        // Assign sample tiles to all players
        const allPlayers = [humanPlayer, ...aiPlayers];
        allPlayers.forEach(player => {
          player.hand = createSampleTiles();
        });

        // Set state
        setPlayers(allPlayers);
        setCurrentPlayer(humanPlayer);

        // Create sample game state after setting current player
        const sampleGameState = createSampleGameState(humanPlayer, aiPlayers);
        setGameState(sampleGameState as GameState);

        console.log('Game initialized with sample data');
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing game:', err);
        setError('Failed to initialize game. Please try again.');
        setIsLoading(false);
      }
    };

    // Use sample data instead of real game initialization for now
    initializeWithSampleData();
  }, [playerName, playerCount, aiDifficulty]);

  // Handle player actions
  const handleAction = (action: string, tile?: Tile) => {
    if (!gameManager || !gameState || !currentPlayer) return;

    console.log('Action:', action, 'Tile:', tile);

    // Handle different actions
    switch (action) {
      case 'selectTile':
        // Update UI to show selected tile
        break;
      case 'discard':
        // Discard the selected tile
        break;
      case 'chow':
        // Declare a chow
        break;
      case 'pung':
        // Declare a pung
        break;
      case 'kong':
        // Declare a kong
        break;
      case 'mahjong':
        // Declare a win
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  // For testing purposes, create some sample tiles
  const createSampleTiles = (): Tile[] => {
    return [
      TileFactory.createBamboo(1),
      TileFactory.createBamboo(2),
      TileFactory.createBamboo(3),
      TileFactory.createCharacter(4),
      TileFactory.createCharacter(5),
      TileFactory.createCharacter(6),
      TileFactory.createDot(7),
      TileFactory.createDot(8),
      TileFactory.createDot(9),
      TileFactory.createWind(WindType.EAST),
      TileFactory.createWind(WindType.SOUTH),
      TileFactory.createDragon(DragonType.RED),
      TileFactory.createDragon(DragonType.GREEN)
    ];
  };

  // For testing purposes, create a sample game state
  const createSampleGameState = (humanPlayer: Player, aiPlayers: Player[]) => {
    // Combine all players
    const allPlayers = [humanPlayer, ...aiPlayers];

    // Create a sample discard pile
    const discardPile = [
      TileFactory.createBamboo(5),
      TileFactory.createCharacter(7),
      TileFactory.createDot(3)
    ];

    // Create a mock game state object
    return {
      getCurrentPlayer: () => humanPlayer,
      getDealer: () => humanPlayer,
      getRoundWind: () => 'EAST',
      getTurnWind: () => 'EAST',
      getRoundNumber: () => 1,
      getTurnNumber: () => 1,
      getDiscardPile: () => discardPile,
      getDiceRoll: () => [3, 5],
      getDoraIndicator: () => TileFactory.createDragon(DragonType.RED),
      isGameOver: () => false,
      getWinner: () => null,
      getTilesRemaining: () => 84,
      getTurnPhase: () => 'DISCARD'
    } as unknown as GameState;
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading game...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!gameState || !currentPlayer || players.length === 0) {
    return <div className="text-center p-4">Failed to initialize game. Please refresh and try again.</div>;
  }

  return (
    <GameBoard
      gameState={gameState}
      currentPlayer={currentPlayer}
      players={players}
      onAction={handleAction}
    />
  );
};

export default GameController;
