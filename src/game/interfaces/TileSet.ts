import { Tile } from './Tile';
import { TileSetType } from '../enums/TileSetType';

/**
 * Interface representing a set of tiles (chow, pung, kong)
 */
export interface TileSet {
  type: TileSetType;
  tiles: Tile[];
  fromPlayerId?: string; // ID of the player who discarded the tile (if claimed)
}
