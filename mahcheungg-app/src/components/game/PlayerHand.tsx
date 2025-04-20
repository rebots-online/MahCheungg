import React, { useState, useRef, useEffect } from 'react';
import { Tile } from '../../models/game/Tile';
import { useTheme } from '../../contexts/ThemeContext';

interface PlayerHandProps {
  tiles: Tile[];
  onTileSelect: (tile: Tile) => void;
  onReorder?: (reorderedTiles: Tile[]) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ tiles, onTileSelect, onReorder }) => {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [draggedTile, setDraggedTile] = useState<Tile | null>(null);
  const [playerTiles, setPlayerTiles] = useState<Tile[]>([]);
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';

  // Initialize with sorted tiles
  useEffect(() => {
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

    setPlayerTiles(sortedTiles);
  }, [tiles]);

  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
    onTileSelect(tile);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tile: Tile, index: number) => {
    setDraggedTile(tile);
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a visual effect for the dragged tile
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.4';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTile(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) return;

    // Create a new array with the reordered tiles
    const newTiles = [...playerTiles];
    const [draggedTile] = newTiles.splice(dragIndex, 1);
    newTiles.splice(dropIndex, 0, draggedTile);

    setPlayerTiles(newTiles);

    // Notify parent component about the reordering
    if (onReorder) {
      onReorder(newTiles);
    }
  };

  // Flick animation for discarding
  const handleTileFlick = (e: React.MouseEvent, tile: Tile) => {
    if (e.buttons !== 1) return; // Only respond to left mouse button

    const tileElement = e.currentTarget as HTMLElement;
    const rect = tileElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate flick direction and force
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const force = Math.min(distance / 50, 1); // Normalize force

    // Apply flick animation
    tileElement.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    tileElement.style.transform = `translate(${deltaX * 2}px, ${deltaY * 2}px) rotate(${deltaX * force}deg)`;
    tileElement.style.opacity = '0';

    // After animation, select the tile for discard
    setTimeout(() => {
      setSelectedTile(tile);
      onTileSelect(tile);
      tileElement.style.transition = '';
      tileElement.style.transform = '';
      tileElement.style.opacity = '1';
    }, 500);
  };

  return (
    <div className="flex justify-center space-x-1 mb-2 flex-wrap">
      {playerTiles.map((tile, index) => (
        <div
          key={`${tile.id}-${index}`}
          className={`mahjong-tile ${
            selectedTile === tile
              ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
              : ''
          }`}
          onClick={() => handleTileClick(tile)}
          onMouseMove={(e) => handleTileFlick(e, tile)}
          draggable
          onDragStart={(e) => handleDragStart(e, tile, index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          data-tile={tile.id}
          style={{
            backgroundColor: isDeepSite ? 'var(--tile-bg, #f0f0f0)' : '#f0f0f0',
            borderColor: isDeepSite ? 'var(--accent-color, #ffc107)' : '#d1d5db',
            color: '#000', // Force black for visibility
            cursor: 'grab',
            userSelect: 'none',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${(index % 3 - 1) * 0.5}deg)`, // Slight random rotation
            transition: 'transform 0.3s ease'
          }}
        >
          {tile.unicode || '🀄'}
        </div>
      ))}
    </div>
  );
};

export default PlayerHand;
