import { Tile } from './Tile';
import { TileSet } from './TileSet';
import { GameAction } from './GameAction';
import { ChowPosition } from '../enums/ChowPosition';

/**
 * Interface for a player in the game
 * Both human and AI players implement this interface
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
  declarePung(tile: Tile): boolean;
  declareKong(tile: Tile): boolean;
  declareChow(tile: Tile, position: ChowPosition): boolean;
  declareMahjong(): boolean;

  // Decision making
  getDiscardDecision(): Promise<Tile>;
  getActionDecision(availableActions: GameAction[], discardedTile: Tile): Promise<GameAction | null>;

  // Communication
  sendMessage(message: string): void;
  receiveMessage(message: string, sender: Player): void;

  // Connection management
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
}
