import React, { useState, useEffect } from 'react';
import { Tile } from '../../models/game/Tile';
import { TileSet } from '../../models/game/TileSet';
import { GameState, Wind } from '../../models/game/GameState';
import { Player } from '../../models/player/Player';
import PlayerHand from './PlayerHand';
import DiscardPile from './DiscardPile';
import ActionButtons from './ActionButtons';
import ThemeSelector from '../ui/ThemeSelector';
import { useTheme } from '../../contexts/ThemeContext';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player;
  players: Player[];
  onAction: (action: string, tile?: Tile) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  players,
  onAction
}) => {
  const { style, mode, toggleMode } = useTheme();

  // Get player positions relative to the current player
  const getPlayerPosition = (index: number): 'bottom' | 'left' | 'top' | 'right' => {
    const currentPlayerIndex = players.indexOf(currentPlayer);
    const relativePosition = (index - currentPlayerIndex + players.length) % players.length;

    switch (relativePosition) {
      case 0:
        return 'bottom';
      case 1:
        return 'right';
      case 2:
        return 'top';
      case 3:
        return 'left';
      default:
        return 'bottom';
    }
  };

  // Get wind name
  const getWindName = (wind: Wind): string => {
    switch (wind) {
      case Wind.EAST:
        return 'East';
      case Wind.SOUTH:
        return 'South';
      case Wind.WEST:
        return 'West';
      case Wind.NORTH:
        return 'North';
      default:
        return '';
    }
  };

  // Add window resize handler for responsive design
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate game board size based on viewport
  const calculateBoardSize = () => {
    const minDimension = Math.min(windowSize.width * 0.9, windowSize.height * 0.8);
    return {
      width: minDimension,
      height: minDimension
    };
  };

  const boardSize = calculateBoardSize();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4"
         style={{ backgroundColor: 'var(--bg-color, #f3f4f6)' }}>
      {/* Game info bar */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center p-3 rounded-lg shadow"
           style={style === 'deepsite' ?
             { backgroundColor: 'var(--player-info-bg, #16213e)', borderLeft: '4px solid var(--accent-color, #ffc107)' } :
             { backgroundColor: 'var(--board-bg, #e5e7eb)' }}>
        <h1 className="text-xl font-bold"
            style={{ color: style === 'deepsite' ? 'var(--accent-color, #ffc107)' : 'var(--text-color, #1f2937)' }}>
          MahCheungg
        </h1>
        <div className="text-sm" style={{ color: style === 'deepsite' ? '#ffffff' : 'var(--text-color, #1f2937)' }}>
          <span className="mr-2">Wind: {getWindName(gameState.getRoundWind())}</span>
          <span className="mx-2">|</span>
          <span className="mx-2">Dealer: {gameState.getDealer().name}</span>
          <span className="mx-2">|</span>
          <span className="mr-2">Round: {gameState.getRoundNumber()}</span>
          <button
            onClick={toggleMode}
            className="ml-4 p-2 rounded"
            style={{
              backgroundColor: style === 'deepsite' ? '#1a1a2e' : 'var(--tile-bg, white)',
              color: style === 'deepsite' ? '#ffffff' : 'var(--text-color, #1f2937)',
              borderColor: style === 'deepsite' ? '#ffc107' : 'var(--tile-border, #d1d5db)',
              borderWidth: '1px'
            }}
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {mode === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Game board */}
      <div className="game-board relative border-4 rounded-lg shadow-lg p-8 flex flex-col justify-between items-center"
           style={{
             borderColor: 'var(--tile-border, #d1d5db)',
             backgroundColor: 'var(--board-bg, #e5e7eb)',
             width: `${boardSize.width}px`,
             height: `${boardSize.height}px`,
             maxWidth: '100%',
             maxHeight: '80vh'
           }}>
        {/* Game title for DeepSite theme */}
        {style === 'deepsite' && (
          <div className="absolute top-4 left-0 right-0 text-center z-10">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--accent-color, #ffc107)' }}>Mahcheungg</h1>
            <p className="text-sm" style={{ color: 'var(--text-color, #e6e6e6)' }}>The Ultimate Mahjong Experience</p>
          </div>
        )}
        {/* Opponent players */}
        {players.map((player, index) => {
          if (player === currentPlayer) return null;

          const position = getPlayerPosition(index);
          const isAI = player.isAI;

          return (
            <div
              key={player.id}
              className={`absolute ${
                position === 'top'
                  ? 'top-4 left-1/2 transform -translate-x-1/2'
                  : position === 'left'
                  ? 'left-4 top-1/2 transform -translate-y-1/2'
                  : position === 'right'
                  ? 'right-4 top-1/2 transform -translate-y-1/2'
                  : ''
              } flex ${
                position === 'left' || position === 'right'
                  ? 'flex-col items-center'
                  : 'flex-col items-center'
              }`}
            >
              {style === 'deepsite' ? (
                <div className="player-info mb-2 p-2 rounded" style={{ minWidth: '120px' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                         style={{ backgroundColor: 'var(--opponent-info-bg, #0f3460)' }}>
                      {position === 'top' ? 'N' : position === 'left' ? 'W' : 'E'}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">{player.name}</h3>
                      <p className="text-xs opacity-70">{isAI ? 'AI Player' : 'Human Player'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`text-sm mb-1 ${
                    position === 'left'
                      ? 'whitespace-nowrap transform -rotate-90'
                      : position === 'right'
                      ? 'whitespace-nowrap transform rotate-90'
                      : ''
                  }`}
                >
                  {player.name} {isAI ? '(AI)' : ''}
                </div>
              )}
              <div className="flex space-x-1">
                {/* Show hidden tiles for opponents */}
                {Array.from({ length: player.hand.length }).map((_, i) => (
                  <div key={i} className="mahjong-tile-hidden"></div>
                ))}
              </div>

              {/* Show exposed sets */}
              {player.exposedSets.length > 0 && (
                <div className="mt-2 flex flex-wrap">
                  {player.exposedSets.map((set, setIndex) => (
                    <div key={setIndex} className="flex space-x-1 mr-2 mb-1">
                      {set.tiles.map((tile, tileIndex) => (
                        <div
                          key={tileIndex}
                          className="mahjong-tile-discarded"
                        >
                          {tile.unicode}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Discard pile and wall */}
        <div className="absolute inset-0 flex items-center justify-center m-16">
          {style === 'deepsite' ? (
            <div className="relative w-64 h-64 rounded-lg flex flex-col items-center justify-center"
                 style={{ backgroundColor: 'var(--discard-bg, #2d152a)', boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)' }}>
              <div className="mb-2 text-sm" style={{ color: 'var(--accent-color, #ffc107)' }}>Discard Area</div>

              <DiscardPile tiles={gameState.getDiscardPile()} />

              <div className="mt-4 flex justify-between w-full px-4">
                <div className="text-xs">
                  <span style={{ color: 'var(--accent-color, #ffc107)' }}>Tiles Left:</span> {gameState.getTilesRemaining()}
                </div>
                <div
                  id="dice-roll"
                  className="p-1 rounded text-xs"
                  style={{ backgroundColor: 'var(--player-info-bg, #16213e)', color: 'var(--text-color, #e6e6e6)' }}
                >
                  🎲 {gameState.getDiceRoll().join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-56 h-56 border-2 border-dashed border-gray-500 dark:border-gray-400 rounded flex items-center justify-center">
              <div className="absolute -inset-2 border-2 border-green-700 dark:border-green-500 rounded"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Draw Wall Area
              </span>

              <DiscardPile tiles={gameState.getDiscardPile()} />

              <div
                id="dice-roll"
                className="absolute bottom-0 right-0 m-1 p-1 bg-white dark:bg-gray-800 rounded shadow text-xs"
              >
                🎲 {gameState.getDiceRoll().join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Current player's hand - fixed position at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full px-4 z-20">
          {style === 'deepsite' ? (
            <div className="w-full">
              <div className="player-info mb-2 p-2 rounded flex justify-between items-center"
                   style={{ backgroundColor: 'var(--player-info-bg, #16213e)', borderLeft: '4px solid var(--accent-color, #ffc107)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'var(--accent-color, #ffc107)', color: '#000' }}>
                    S
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#ffffff' }}>{currentPlayer.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--accent-color, #ffc107)' }}>Your Hand</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#ffffff' }}>Score: 25,000</p>
                </div>
              </div>
              <PlayerHand
                tiles={currentPlayer.hand}
                onTileSelect={(tile) => onAction('selectTile', tile)}
              />
            </div>
          ) : (
            <>
              <PlayerHand
                tiles={currentPlayer.hand}
                onTileSelect={(tile) => onAction('selectTile', tile)}
              />
              <div className="text-sm mb-2">Your Hand ({currentPlayer.name})</div>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        onAction={(action, targetPlayer) => onAction(action, targetPlayer ? { id: targetPlayer.id } as Tile : undefined)}
        disabledActions={['chow', 'pung', 'kong', 'mahjong']}
        opponents={players.filter(p => p !== currentPlayer)}
        currentPlayer={currentPlayer}
      />
    </div>
  );
};

export default GameBoard;
