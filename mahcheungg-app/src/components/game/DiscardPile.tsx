import React from 'react';
import { Tile } from '../../models/game/Tile';

interface DiscardPileProps {
  tiles: Tile[];
}

const DiscardPile: React.FC<DiscardPileProps> = ({ tiles }) => {
  return (
    <div className="discard-pile w-full h-full p-2 grid grid-cols-5 gap-1 overflow-auto rounded">
      {tiles.map((tile, index) => (
        <div
          key={`${tile.id}-${index}`}
          className="mahjong-tile-discarded"
          title={`${tile.type} ${tile.value}`}
        >
          {tile.unicode}
        </div>
      ))}
    </div>
  );
};

export default DiscardPile;
