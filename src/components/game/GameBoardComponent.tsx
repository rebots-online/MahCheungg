import React, { useState, useEffect } from 'react';
import { GameState, TurnPhase } from '../../models/game/GameState';
import { Player } from '../../models/player/Player';
import { Tile } from '../../models/game/Tile';
import PlayerHandComponent from './PlayerHandComponent';
import TileComponent from './TileComponent';
import { useTheme } from '../../contexts/ThemeContext';

interface GameBoardComponentProps {
  gameState: GameState;
  players: Player[];
  currentPlayerIndex: number;
  onTileDiscard?: (tile: Tile) => void;
  onAction?: (action: string, params: any) => void;
}

const GameBoardComponent: React.FC<GameBoardComponentProps> = ({
  gameState,
  players,
  currentPlayerIndex,
  onTileDiscard,
  onAction
}) => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [discardPile, setDiscardPile] = useState<Tile[]>([]);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  // Update the discard pile when the game state changes
  useEffect(() => {
    setDiscardPile(gameState.getDiscardPile());
  }, [gameState]);

  // Handle tile selection
  const handleTileSelect = (tile: Tile) => {
    setSelectedTile(tile);
  };

  // Handle tile discard
  const handleDiscard = () => {
    if (selectedTile && onTileDiscard) {
      onTileDiscard(selectedTile);
      setSelectedTile(null);
    }
  };

  // Determine player positions based on the number of players
  const getPlayerPositions = () => {
    const positions = ['bottom', 'top', 'left', 'right'];

    if (players.length === 2) {
      return ['bottom', 'top'];
    } else if (players.length === 3) {
      return ['bottom', 'left', 'right'];
    } else {
      return positions;
    }
  };

  const playerPositions = getPlayerPositions();

  // Render the game board
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Game Info */}
      <div className="mb-4 p-2 rounded-lg" style={{ backgroundColor: isDeepSite ? '#1e293b' : '#f3f4f6' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>Round:</span>
            <span style={{ color: isDeepSite ? '#cbd5e1' : '#4b5563' }}> {gameState.getRoundNumber()}</span>
          </div>
          <div className="mx-4">
            <span className="font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>Turn:</span>
            <span style={{ color: isDeepSite ? '#cbd5e1' : '#4b5563' }}> {gameState.getTurnNumber()}</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>Tiles Left:</span>
            <span style={{ color: isDeepSite ? '#cbd5e1' : '#4b5563' }}> {gameState.getTilesRemaining()}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-4xl aspect-square rounded-lg" style={{ backgroundColor: isDeepSite ? '#334155' : '#e5e7eb' }}>
        {/* Top Player */}
        {players.length >= 2 && (
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <div className="p-2">
              <div className="text-center mb-1 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
                {players[playerPositions.indexOf('top')].name}
                {currentPlayerIndex === playerPositions.indexOf('top') && (
                  <span className="ml-2 text-green-500">●</span>
                )}
              </div>
              <PlayerHandComponent
                tiles={players[playerPositions.indexOf('top')].hand}
                isCurrentPlayer={currentPlayerIndex === playerPositions.indexOf('top')}
                isDiscardPhase={gameState.getTurnPhase() === TurnPhase.DISCARD}
                orientation="top"
                showFaceDown={currentPlayerIndex !== playerPositions.indexOf('top')}
              />
            </div>
          </div>
        )}

        {/* Left Player */}
        {players.length >= 3 && playerPositions.includes('left') && (
          <div className="absolute top-0 bottom-0 left-0 flex items-center">
            <div className="p-2">
              <div className="text-center mb-1 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
                {players[playerPositions.indexOf('left')].name}
                {currentPlayerIndex === playerPositions.indexOf('left') && (
                  <span className="ml-2 text-green-500">●</span>
                )}
              </div>
              <PlayerHandComponent
                tiles={players[playerPositions.indexOf('left')].hand}
                isCurrentPlayer={currentPlayerIndex === playerPositions.indexOf('left')}
                isDiscardPhase={gameState.getTurnPhase() === TurnPhase.DISCARD}
                orientation="left"
                showFaceDown={currentPlayerIndex !== playerPositions.indexOf('left')}
              />
            </div>
          </div>
        )}

        {/* Right Player */}
        {players.length >= 3 && playerPositions.includes('right') && (
          <div className="absolute top-0 bottom-0 right-0 flex items-center">
            <div className="p-2">
              <div className="text-center mb-1 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
                {players[playerPositions.indexOf('right')].name}
                {currentPlayerIndex === playerPositions.indexOf('right') && (
                  <span className="ml-2 text-green-500">●</span>
                )}
              </div>
              <PlayerHandComponent
                tiles={players[playerPositions.indexOf('right')].hand}
                isCurrentPlayer={currentPlayerIndex === playerPositions.indexOf('right')}
                isDiscardPhase={gameState.getTurnPhase() === TurnPhase.DISCARD}
                orientation="right"
                showFaceDown={currentPlayerIndex !== playerPositions.indexOf('right')}
              />
            </div>
          </div>
        )}

        {/* Bottom Player (Current User) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="p-2">
            <div className="text-center mb-1 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
              {players[playerPositions.indexOf('bottom')].name}
              {currentPlayerIndex === playerPositions.indexOf('bottom') && (
                <span className="ml-2 text-green-500">●</span>
              )}
            </div>
            <PlayerHandComponent
              tiles={players[playerPositions.indexOf('bottom')].hand}
              isCurrentPlayer={currentPlayerIndex === playerPositions.indexOf('bottom')}
              isDiscardPhase={gameState.getTurnPhase() === TurnPhase.DISCARD}
              onTileSelect={handleTileSelect}
              orientation="bottom"
            />
          </div>
        </div>

        {/* Discard Pile */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="p-4 rounded-lg" style={{ backgroundColor: isDeepSite ? '#1e293b' : '#f8fafc' }}>
            <div className="text-center mb-2 font-bold" style={{ color: isDeepSite ? '#ffc107' : '#1f2937' }}>
              Discard Pile
            </div>
            <div className="grid grid-cols-5 gap-2 max-w-md">
              {discardPile.slice(-15).map((tile) => (
                <div key={tile.id} className="flex justify-center">
                  <TileComponent
                    tile={tile}
                    isSelectable={false}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center">
        {currentPlayerIndex === playerPositions.indexOf('bottom') && gameState.getTurnPhase() === TurnPhase.DISCARD && (
          <button
            onClick={handleDiscard}
            disabled={!selectedTile}
            className="px-4 py-2 rounded-lg font-bold"
            style={{
              backgroundColor: isDeepSite ? '#4a2545' : '#3b82f6',
              color: isDeepSite ? '#ffc107' : '#ffffff',
              opacity: !selectedTile ? 0.5 : 1
            }}
          >
            Discard Selected Tile
          </button>
        )}
      </div>
    </div>
  );
};

export default GameBoardComponent;
