import React, { useState } from 'react';
import { Tile } from '../../models/game/Tile';

interface PlayerHandProps {
  tiles: Tile[];
  onTileSelect: (tile: Tile) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onTileSelect }) => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  
  // Sort tiles for better display
  const sortedTiles = [...tiles].sort((a, b) => {
    // Sort by type first
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    
    // Then sort by value
    if (typeof a.value === 'number' && typeof b.value === 'number') {
      return a.value - b.value;
    }
    
    // For non-numeric values, convert to string and compare
    return String(a.value).localeCompare(String(b.value));
  });
  
  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
    onTileSelect(tile);
  };
  
  return (
    <div className="flex justify-center space-x-1 mb-2 flex-wrap">
      {sortedTiles.map((tile, index) => (
        <div
          key={`${tile.id}-${index}`}
          className={`mahjong-tile ${
            selectedTile === tile
              ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
              : ''
          }`}
          onClick={() => handleTileClick(tile)}
          data-tile={tile.id}
        >
          {tile.unicode}
        </div>
      ))}
    </div>
  );
};

export default PlayerHand;
