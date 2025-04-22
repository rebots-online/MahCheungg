import React, { useState } from 'react';
import { Tile } from '../../models/game/Tile';
import TileComponent from './TileComponent';
import { useTheme } from '../../contexts/ThemeContext';

interface PlayerHandComponentProps {
  tiles: Tile[];
  isCurrentPlayer: boolean;
  isDiscardPhase: boolean;
  onTileSelect?: (tile: Tile) => void;
  orientation?: 'bottom' | 'top' | 'left' | 'right';
  showFaceDown?: boolean;
}

const PlayerHandComponent: React.FC<PlayerHandComponentProps> = ({
  tiles,
  isCurrentPlayer,
  isDiscardPhase,
  onTileSelect,
  orientation = 'bottom',
  showFaceDown = false
}) => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';
  
  // Handle tile click
  const handleTileClick = (tile: Tile) => {
    if (!isCurrentPlayer || !isDiscardPhase) return;
    
    if (selectedTile && selectedTile.id === tile.id) {
      // Deselect the tile
      setSelectedTile(null);
      if (onTileSelect) {
        onTileSelect(tile);
      }
    } else {
      // Select the tile
      setSelectedTile(tile);
      if (onTileSelect) {
        onTileSelect(tile);
      }
    }
  };
  
  // Determine the layout based on orientation
  const getContainerStyle = () => {
    switch (orientation) {
      case 'bottom':
        return 'flex flex-row justify-center';
      case 'top':
        return 'flex flex-row justify-center';
      case 'left':
        return 'flex flex-col justify-center';
      case 'right':
        return 'flex flex-col justify-center';
      default:
        return 'flex flex-row justify-center';
    }
  };
  
  // Determine the tile orientation
  const getTileOrientation = () => {
    switch (orientation) {
      case 'bottom':
      case 'top':
        return 'upright';
      case 'left':
      case 'right':
        return 'sideways';
      default:
        return 'upright';
    }
  };
  
  // Sort tiles for display
  const sortedTiles = [...tiles].sort((a, b) => {
    // Sort by suit first
    if (a.suit !== b.suit) {
      return a.suit.localeCompare(b.suit);
    }
    
    // Then sort by value
    if (typeof a.value === 'number' && typeof b.value === 'number') {
      return a.value - b.value;
    }
    
    // Convert non-number values to strings for comparison
    return String(a.value).localeCompare(String(b.value));
  });
  
  return (
    <div className={`p-2 rounded-lg ${isCurrentPlayer ? (isDeepSite ? 'bg-gray-800' : 'bg-blue-50') : ''}`}>
      <div className={getContainerStyle()}>
        {sortedTiles.map((tile) => (
          <div key={tile.id} className="m-1">
            <TileComponent
              tile={tile}
              isSelected={selectedTile?.id === tile.id}
              isSelectable={isCurrentPlayer && isDiscardPhase}
              onClick={handleTileClick}
              orientation={showFaceDown ? 'facedown' : getTileOrientation() as any}
              size="medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHandComponent;
