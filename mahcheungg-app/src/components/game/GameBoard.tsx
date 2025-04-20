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
  const { mode, toggleMode } = useTheme();

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Game info bar */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mahjong Game</h1>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span>Wind: {getWindName(gameState.getRoundWind())}</span> |
          <span>Dealer: {players[gameState.getDealer().id].name}</span> |
          <span>Round: {gameState.getRoundNumber()}</span>
          <button
            onClick={toggleMode}
            className="ml-4 p-1 rounded bg-gray-300 dark:bg-gray-600"
          >
            {mode === 'light' ? '🌙' : '💡'}
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Game board */}
      <div className="game-board relative w-full max-w-4xl aspect-square border-4 rounded-lg shadow-lg p-8 flex flex-col justify-between items-center" style={{ borderColor: 'var(--tile-border, #d1d5db)', backgroundColor: 'var(--board-bg, #e5e7eb)' }}>
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
        </div>

        {/* Current player's hand */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full px-4">
          <PlayerHand
            tiles={currentPlayer.hand}
            onTileSelect={(tile) => onAction('selectTile', tile)}
          />
          <div className="text-sm mb-2">Your Hand ({currentPlayer.name})</div>
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        onAction={(action) => onAction(action)}
        disabledActions={['chow', 'pung', 'kong', 'mahjong']}
      />
    </div>
  );
};

export default GameBoard;
