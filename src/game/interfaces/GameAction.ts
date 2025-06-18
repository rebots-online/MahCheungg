import { Tile } from './Tile';
import { TileSetType } from '../enums/TileSetType';
import { ChowPosition } from '../enums/ChowPosition';
import { VectorClock } from '../utils/VectorClock';

/**
 * Base interface for all game actions
 */
export interface GameAction {
  action: string;
  player: string;
  timestamp: number;
  vectorClock?: VectorClock;
}

/**
 * Interface for turn start action
 */
export interface TurnStartAction extends GameAction {
  action: 'turn_start';
}

/**
 * Interface for auto pass action
 */
export interface AutoPassAction extends GameAction {
  action: 'auto_pass';
  reason: 'timeout' | 'disconnection';
}

/**
 * Interface for emergency handoff action
 */
export interface EmergencyHandoffAction extends GameAction {
  action: 'emergency_handoff';
  reason: 'disconnection';
}

/**
 * Interface for game suspended action
 */
export interface GameSuspendedAction extends GameAction {
  action: 'game_suspended';
  reason: 'all_disconnected' | 'user_requested';
}

/**
 * Interface for draw tile action
 */
export interface DrawTileAction extends GameAction {
  action: 'draw';
  tile: Tile;
}

/**
 * Interface for discard tile action
 */
export interface DiscardTileAction extends GameAction {
  action: 'discard';
  tile: Tile;
}

/**
 * Interface for claim action (pung, kong, chow)
 */
export interface ClaimAction extends GameAction {
  action: 'claim';
  type: TileSetType;
  tile: Tile;
  position?: ChowPosition; // Only for chow claims
}

/**
 * Interface for mahjong declaration action
 */
export interface MahjongAction extends GameAction {
  action: 'mahjong';
  winningTile: Tile;
  fromPlayerId?: string; // ID of the player who discarded the winning tile (if claimed)
}
