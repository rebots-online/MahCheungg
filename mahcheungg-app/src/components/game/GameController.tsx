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
  
  // Initialize the game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        
        // Create a temporary game manager to pass to connections
        const tempGameManager = {} as any;
        
        // Create players
        const newPlayers: Player[] = [];
        
        // Create human player
        const humanConnection = new LocalConnection('player-0', tempGameManager);
        const humanPlayer = new HumanPlayer(
          'player-0',
          playerName,
          humanConnection,
          {
            onHandUpdated: (hand) => {
              // Update UI
              console.log('Hand updated:', hand);
            },
            onDiscardPileUpdated: (discardPile) => {
              // Update UI
              console.log('Discard pile updated:', discardPile);
            },
            onExposedSetsUpdated: (exposedSets) => {
              // Update UI
              console.log('Exposed sets updated:', exposedSets);
            },
            requestDiscardDecision: (callback) => {
              // Show UI for selecting a tile to discard
              console.log('Requesting discard decision');
              // For now, we'll just discard the first tile
              if (humanPlayer.hand.length > 0) {
                callback(humanPlayer.hand[0]);
              }
            },
            requestActionDecision: (availableActions, discardedTile, callback) => {
              // Show UI for selecting an action
              console.log('Requesting action decision:', availableActions);
              // For now, we'll just return null (no action)
              callback(null);
            },
            onMessageSent: (message) => {
              // Update UI
              console.log('Message sent:', message);
            },
            onMessageReceived: (message, sender) => {
              // Update UI
              console.log('Message received:', message, 'from:', sender.name);
            }
          }
        );
        
        newPlayers.push(humanPlayer);
        
        // Create AI players
        for (let i = 1; i < playerCount; i++) {
          const aiConnection = new LocalConnection(`player-${i}`, tempGameManager);
          const aiPlayer = new AIPlayer(
            `player-${i}`,
            `AI Player ${i}`,
            aiDifficulty,
            AIPersonality.BALANCED,
            aiConnection
          );
          
          newPlayers.push(aiPlayer);
        }
        
        // Create the real game manager
        const newGameManager = new GameManager(newPlayers, true);
        
        // Update the temporary game manager with the real one
        Object.assign(tempGameManager, newGameManager);
        
        // Set state
        setPlayers(newPlayers);
        setCurrentPlayer(humanPlayer);
        setGameManager(newGameManager);
        
        // Start the game
        await newGameManager.startGame();
        
        // Set game state
        setGameState(newGameManager.getGameState());
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing game:', err);
        setError('Failed to initialize game. Please try again.');
        setIsLoading(false);
      }
    };
    
    initializeGame();
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
  const createSampleGameState = () => {
    if (!currentPlayer) return null;
    
    // Create sample players
    const samplePlayers: Player[] = [
      currentPlayer,
      new AIPlayer('ai-1', 'AI Player 1', AIDifficulty.MEDIUM),
      new AIPlayer('ai-2', 'AI Player 2', AIDifficulty.MEDIUM),
      new AIPlayer('ai-3', 'AI Player 3', AIDifficulty.MEDIUM)
    ];
    
    // Assign sample tiles to players
    samplePlayers.forEach(player => {
      player.hand = createSampleTiles();
    });
    
    return {
      getCurrentPlayer: () => samplePlayers[0],
      getDealer: () => samplePlayers[0],
      getRoundWind: () => 'EAST',
      getTurnWind: () => 'EAST',
      getRoundNumber: () => 1,
      getTurnNumber: () => 1,
      getDiscardPile: () => [
        TileFactory.createBamboo(5),
        TileFactory.createCharacter(7),
        TileFactory.createDot(3)
      ],
      getDiceRoll: () => [3, 5],
      getDoraIndicator: () => TileFactory.createDragon(DragonType.RED)
    } as unknown as GameState;
  };
  
  if (isLoading) {
    return <div className="text-center p-4">Loading game...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }
  
  // Use sample data for testing if real game state is not available
  const displayGameState = gameState || createSampleGameState();
  const displayPlayers = players.length > 0 ? players : [
    currentPlayer!,
    new AIPlayer('ai-1', 'AI Player 1', AIDifficulty.MEDIUM),
    new AIPlayer('ai-2', 'AI Player 2', AIDifficulty.MEDIUM),
    new AIPlayer('ai-3', 'AI Player 3', AIDifficulty.MEDIUM)
  ];
  
  if (!displayGameState || !currentPlayer) {
    return <div className="text-center p-4">Failed to initialize game.</div>;
  }
  
  return (
    <GameBoard
      gameState={displayGameState}
      currentPlayer={currentPlayer}
      players={displayPlayers}
      onAction={handleAction}
    />
  );
};

export default GameController;
