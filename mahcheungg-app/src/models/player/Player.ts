import { Tile } from '../game/Tile';
import { ChowPosition, TileSet } from '../game/TileSet';

/**
 * Represents the possible actions a player can take during the game.
 */
export enum GameAction {
  DRAW = 'DRAW',           // Draw a tile from the wall
  DISCARD = 'DISCARD',     // Discard a tile
  CHOW = 'CHOW',           // Claim a discarded tile to form a chow
  PUNG = 'PUNG',           // Claim a discarded tile to form a pung
  KONG = 'KONG',           // Claim a discarded tile to form a kong or declare a kong from hand
  MAHJONG = 'MAHJONG'      // Declare a winning hand
}

/**
 * Parameters for a chow action.
 */
export interface ChowActionParams {
  tile: Tile;              // The discarded tile to claim
  position: ChowPosition;  // The position of the claimed tile in the chow
  handTiles: Tile[];       // The tiles from the player's hand to form the chow
}

/**
 * Parameters for a pung action.
 */
export interface PungActionParams {
  tile: Tile;              // The discarded tile to claim
  handTiles: Tile[];       // The tiles from the player's hand to form the pung
}

/**
 * Parameters for a kong action.
 */
export interface KongActionParams {
  tile: Tile;              // The discarded tile to claim or the tile to declare a kong from hand
  handTiles: Tile[];       // The tiles from the player's hand to form the kong
  fromHand: boolean;       // Whether the kong is declared from hand
}

/**
 * Parameters for a discard action.
 */
export interface DiscardActionParams {
  tile: Tile;              // The tile to discard
}

/**
 * Union type for all action parameters.
 */
export type GameActionParams = 
  | ChowActionParams
  | PungActionParams
  | KongActionParams
  | DiscardActionParams
  | null;

/**
 * Represents a decision made by a player.
 */
export interface GameDecision {
  action: GameAction;      // The action to take
  params: GameActionParams; // The parameters for the action
}

/**
 * Interface for player connections.
 */
export interface PlayerConnection {
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(message: string): void;
  onMessageReceived(callback: (message: string, senderId: string) => void): void;
  sendGameAction(action: GameAction, params: GameActionParams): void;
  onGameActionReceived(callback: (action: GameAction, params: GameActionParams) => void): void;
}

/**
 * Interface for UI callbacks used by human players.
 */
export interface UICallbacks {
  onHandUpdated(hand: Tile[]): void;
  onDiscardPileUpdated(discardPile: Tile[]): void;
  onExposedSetsUpdated(exposedSets: TileSet[]): void;
  requestDiscardDecision(callback: (tile: Tile) => void): void;
  requestActionDecision(
    availableActions: GameAction[],
    discardedTile: Tile,
    callback: (decision: GameDecision | null) => void
  ): void;
  onMessageSent(message: string): void;
  onMessageReceived(message: string, sender: Player): void;
}

/**
 * Interface for a player in the game.
 * This interface is implemented by both human and AI players.
 */
export interface Player {
  // Basic properties
  id: string;
  name: string;
  isAI: boolean;
  
  // Game state
  hand: Tile[];
  discardedTiles: Tile[];
  exposedSets: TileSet[];
  
  // Actions
  drawTile(tile: Tile): void;
  discardTile(tile: Tile): void;
  declarePung(tile: Tile, handTiles: Tile[]): boolean;
  declareKong(tile: Tile, handTiles: Tile[], fromHand: boolean): boolean;
  declareChow(tile: Tile, handTiles: Tile[], position: ChowPosition): boolean;
  declareMahjong(): boolean;
  
  // Decision making
  getDiscardDecision(): Promise<Tile>;
  getActionDecision(
    availableActions: GameAction[], 
    discardedTile: Tile
  ): Promise<GameDecision | null>;
  
  // Communication
  sendMessage(message: string): void;
  receiveMessage(message: string, sender: Player): void;
  
  // Connection management
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
}
