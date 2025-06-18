import { TileSuit } from '../enums/TileSuit';

/**
 * Interface representing a mahjong tile
 */
export interface Tile {
  suit: TileSuit;
  value: number;
  id: string; // Unique identifier for the tile
}
