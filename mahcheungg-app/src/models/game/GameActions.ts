/**
 * GameActions
 * 
 * This file defines the types for all game actions in MahCheungg.
 * These actions are sent as messages through the Jami transport layer.
 */

import { TileInfo } from './Tile';

/**
 * Base interface for all game actions
 */
interface BaseGameAction {
  action: string;
  player: string;
  timestamp: number;
  vectorClock: string; // Serialized vector clock
}

/**
 * Game setup actions
 */

/**
 * Game start action
 */
export interface GameStartAction extends BaseGameAction {
  action: 'game_start';
  players: string[];  // Player IDs in seating order
  options?: {
    includeBonus: boolean;
    timeLimit?: number;  // Time limit per turn in seconds
    rules?: string;      // Rule variation identifier
  };
}

/**
 * Deal action
 */
export interface DealAction extends BaseGameAction {
  action: 'deal';
  tiles: {
    [playerId: string]: TileInfo[];  // Initial tiles for each player
  };
  remainingTiles: number;  // Number of tiles remaining in wall
}

/**
 * Core gameplay actions
 */

/**
 * Draw action
 */
export interface DrawAction extends BaseGameAction {
  action: 'draw';
  tile?: TileInfo;  // Only visible to the drawing player
  remainingTiles: number;
}

/**
 * Discard action
 */
export interface DiscardAction extends BaseGameAction {
  action: 'discard';
  tile: TileInfo;
}

/**
 * Claim action
 */
export interface ClaimAction extends BaseGameAction {
  action: 'claim';
  type: 'chow' | 'pung' | 'kong' | 'win';
  tile: TileInfo;
  set?: TileInfo[];  // For chow/pung/kong, the tiles used from hand
}

/**
 * Pass action
 */
export interface PassAction extends BaseGameAction {
  action: 'pass';
  claimType?: 'chow' | 'pung' | 'kong' | 'win';  // What claim opportunity was passed
}

/**
 * Special actions
 */

/**
 * Kong reveal action
 */
export interface KongRevealAction extends BaseGameAction {
  action: 'kong_reveal';
  tile: TileInfo;
}

/**
 * Bonus tile action
 */
export interface BonusTileAction extends BaseGameAction {
  action: 'bonus_tile';
  tile: TileInfo;
  replacementTile?: TileInfo;  // Only visible to the player
}

/**
 * Game end action
 */
export interface GameEndAction extends BaseGameAction {
  action: 'game_end';
  winner?: string;
  winType?: string;  // Type of win (e.g., 'self_draw', 'discard')
  points?: number;
  hands?: {
    [playerId: string]: {
      tiles: TileInfo[];
      sets: TileInfo[][];
      score: number;
    }
  };
}

/**
 * Turn management actions
 */

/**
 * Turn start action
 */
export interface TurnStartAction extends BaseGameAction {
  action: 'turn_start';
}

/**
 * Auto pass action
 */
export interface AutoPassAction extends BaseGameAction {
  action: 'auto_pass';
  reason: 'timeout' | 'disconnection';
}

/**
 * Emergency handoff action
 */
export interface EmergencyHandoffAction extends BaseGameAction {
  action: 'emergency_handoff';
  reason: 'disconnection' | 'timeout';
  nextPlayer: string;
}

/**
 * Game suspended action
 */
export interface GameSuspendedAction extends BaseGameAction {
  action: 'game_suspended';
  reason: 'all_disconnected' | 'admin_request';
  gameState?: any;  // Serialized game state for resumption
}

/**
 * Game resumed action
 */
export interface GameResumedAction extends BaseGameAction {
  action: 'game_resumed';
}

/**
 * Union type for all game actions
 */
export type GameAction =
  | GameStartAction
  | DealAction
  | DrawAction
  | DiscardAction
  | ClaimAction
  | PassAction
  | KongRevealAction
  | BonusTileAction
  | GameEndAction
  | TurnStartAction
  | AutoPassAction
  | EmergencyHandoffAction
  | GameSuspendedAction
  | GameResumedAction;

/**
 * Type guard functions
 */

/**
 * Check if an action is a GameStartAction
 */
export function isGameStartAction(action: GameAction): action is GameStartAction {
  return action.action === 'game_start';
}

/**
 * Check if an action is a DealAction
 */
export function isDealAction(action: GameAction): action is DealAction {
  return action.action === 'deal';
}

/**
 * Check if an action is a DrawAction
 */
export function isDrawAction(action: GameAction): action is DrawAction {
  return action.action === 'draw';
}

/**
 * Check if an action is a DiscardAction
 */
export function isDiscardAction(action: GameAction): action is DiscardAction {
  return action.action === 'discard';
}

/**
 * Check if an action is a ClaimAction
 */
export function isClaimAction(action: GameAction): action is ClaimAction {
  return action.action === 'claim';
}

/**
 * Check if an action is a PassAction
 */
export function isPassAction(action: GameAction): action is PassAction {
  return action.action === 'pass';
}

/**
 * Check if an action is a KongRevealAction
 */
export function isKongRevealAction(action: GameAction): action is KongRevealAction {
  return action.action === 'kong_reveal';
}

/**
 * Check if an action is a BonusTileAction
 */
export function isBonusTileAction(action: GameAction): action is BonusTileAction {
  return action.action === 'bonus_tile';
}

/**
 * Check if an action is a GameEndAction
 */
export function isGameEndAction(action: GameAction): action is GameEndAction {
  return action.action === 'game_end';
}

/**
 * Check if an action is a TurnStartAction
 */
export function isTurnStartAction(action: GameAction): action is TurnStartAction {
  return action.action === 'turn_start';
}

/**
 * Check if an action is an AutoPassAction
 */
export function isAutoPassAction(action: GameAction): action is AutoPassAction {
  return action.action === 'auto_pass';
}

/**
 * Check if an action is an EmergencyHandoffAction
 */
export function isEmergencyHandoffAction(action: GameAction): action is EmergencyHandoffAction {
  return action.action === 'emergency_handoff';
}

/**
 * Check if an action is a GameSuspendedAction
 */
export function isGameSuspendedAction(action: GameAction): action is GameSuspendedAction {
  return action.action === 'game_suspended';
}

/**
 * Check if an action is a GameResumedAction
 */
export function isGameResumedAction(action: GameAction): action is GameResumedAction {
  return action.action === 'game_resumed';
}
