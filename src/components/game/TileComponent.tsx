import React from 'react';
import { Tile, TileSuit, WindDirection, DragonType, FlowerType, getTileDisplayName } from '../../models/game/Tile';
import { useTheme } from '../../contexts/ThemeContext';

interface TileComponentProps {
  tile: Tile;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: (tile: Tile) => void;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'upright' | 'sideways' | 'facedown';
}

const TileComponent: React.FC<TileComponentProps> = ({
  tile,
  isSelected = false,
  isSelectable = true,
  onClick,
  size = 'medium',
  orientation = 'upright'
}) => {
  const { style } = useTheme();
  const isDeepSite = style === 'deepsite';
  
  // Determine tile dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 30, height: 40 };
      case 'medium':
        return { width: 40, height: 60 };
      case 'large':
        return { width: 50, height: 70 };
      default:
        return { width: 40, height: 60 };
    }
  };
  
  const { width, height } = getDimensions();
  
  // Determine tile colors based on theme
  const getTileColors = () => {
    if (isDeepSite) {
      return {
        background: '#1e293b',
        border: '#334155',
        text: getTileTextColor(),
        selectedBorder: '#ffc107'
      };
    } else {
      return {
        background: '#f8f8f8',
        border: '#d1d5db',
        text: getTileTextColor(),
        selectedBorder: '#3b82f6'
      };
    }
  };
  
  // Determine text color based on tile suit
  const getTileTextColor = () => {
    if (isDeepSite) {
      switch (tile.suit) {
        case TileSuit.CHARACTERS:
          return '#ffc107'; // Gold
        case TileSuit.BAMBOO:
          return '#10b981'; // Green
        case TileSuit.CIRCLES:
          return '#f43f5e'; // Red
        case TileSuit.WINDS:
          return '#cbd5e1'; // Light gray
        case TileSuit.DRAGONS:
          return '#f97316'; // Orange
        case TileSuit.FLOWERS:
          return '#8b5cf6'; // Purple
        default:
          return '#ffffff';
      }
    } else {
      switch (tile.suit) {
        case TileSuit.CHARACTERS:
          return '#1e40af'; // Blue
        case TileSuit.BAMBOO:
          return '#047857'; // Green
        case TileSuit.CIRCLES:
          return '#b91c1c'; // Red
        case TileSuit.WINDS:
          return '#1f2937'; // Dark gray
        case TileSuit.DRAGONS:
          return '#c2410c'; // Orange
        case TileSuit.FLOWERS:
          return '#7e22ce'; // Purple
        default:
          return '#000000';
      }
    }
  };
  
  const colors = getTileColors();
  
  // Handle tile click
  const handleClick = () => {
    if (isSelectable && onClick) {
      onClick(tile);
    }
  };
  
  // Determine tile content based on orientation
  const renderTileContent = () => {
    if (orientation === 'facedown') {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-3/4 h-3/4 rounded-sm" style={{ backgroundColor: isDeepSite ? '#334155' : '#d1d5db' }}></div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-1">
        <div className="text-center font-bold" style={{ color: colors.text, fontSize: size === 'small' ? '0.8rem' : '1rem' }}>
          {getTileDisplayName(tile)}
        </div>
      </div>
    );
  };
  
  // Apply rotation for sideways orientation
  const getTransformStyle = () => {
    if (orientation === 'sideways') {
      return { transform: 'rotate(90deg)' };
    }
    return {};
  };
  
  return (
    <div
      className={`relative rounded-md shadow-md cursor-pointer transition-all duration-200 ${isSelectable ? 'hover:scale-105' : ''} ${isSelected ? 'scale-105' : ''}`}
      style={{
        width: orientation === 'sideways' ? height : width,
        height: orientation === 'sideways' ? width : height,
        backgroundColor: colors.background,
        border: `2px solid ${isSelected ? colors.selectedBorder : colors.border}`,
        ...getTransformStyle()
      }}
      onClick={handleClick}
    >
      {renderTileContent()}
    </div>
  );
};

export default TileComponent;
