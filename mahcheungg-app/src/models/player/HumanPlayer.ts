import { Tile } from '../game/Tile';
import { ChowPosition, TileSet, TileSetFactory } from '../game/TileSet';
import { 
  GameAction, 
  GameDecision, 
  Player, 
  PlayerConnection, 
  UICallbacks 
} from './Player';

/**
 * Implementation of the Player interface for human players.
 */
export class HumanPlayer implements Player {
  id: string;
  name: string;
  isAI: boolean = false;
  
  hand: Tile[] = [];
  discardedTiles: Tile[] = [];
  exposedSets: TileSet[] = [];
  
  private connection: PlayerConnection;
  private uiCallbacks: UICallbacks;
  
  /**
   * Creates a new HumanPlayer instance.
   * 
   * @param id The unique identifier for this player
   * @param name The display name for this player
   * @param connection The connection for this player
   * @param uiCallbacks The UI callbacks for this player
   */
  constructor(
    id: string, 
    name: string, 
    connection: PlayerConnection, 
    uiCallbacks: UICallbacks
  ) {
    this.id = id;
    this.name = name;
    this.connection = connection;
    this.uiCallbacks = uiCallbacks;
  }
  
  /**
   * Adds a tile to the player's hand.
   * 
   * @param tile The tile to add to the hand
   */
  drawTile(tile: Tile): void {
    this.hand.push(tile);
    this.uiCallbacks.onHandUpdated(this.hand);
  }
  
  /**
   * Removes a tile from the player's hand and adds it to the discard pile.
   * 
   * @param tile The tile to discard
   */
  discardTile(tile: Tile): void {
    const index = this.findTileIndex(tile);
    if (index !== -1) {
      this.hand.splice(index, 1);
      this.discardedTiles.push(tile);
      this.uiCallbacks.onHandUpdated(this.hand);
      this.uiCallbacks.onDiscardPileUpdated(this.discardedTiles);
    }
  }
  
  /**
   * Declares a pung (triplet) with a discarded tile and two matching tiles from the hand.
   * 
   * @param tile The discarded tile to claim
   * @param handTiles The tiles from the player's hand to form the pung
   * @returns True if the pung was successfully declared, false otherwise
   */
  declarePung(tile: Tile, handTiles: Tile[]): boolean {
    try {
      // Verify that the hand tiles are in the player's hand
      if (!this.verifyTilesInHand(handTiles)) {
        return false;
      }
      
      // Create the pung
      const pung = TileSetFactory.createPungFromClaim(tile, handTiles);
      
      // Remove the tiles from the hand
      this.removeTilesFromHand(handTiles);
      
      // Add the pung to the exposed sets
      this.exposedSets.push(pung);
      
      // Update the UI
      this.uiCallbacks.onHandUpdated(this.hand);
      this.uiCallbacks.onExposedSetsUpdated(this.exposedSets);
      
      return true;
    } catch (error) {
      console.error('Failed to declare pung:', error);
      return false;
    }
  }
  
  /**
   * Declares a kong (quadruplet) with a discarded tile or from the hand.
   * 
   * @param tile The discarded tile to claim or the tile to declare a kong from hand
   * @param handTiles The tiles from the player's hand to form the kong
   * @param fromHand Whether the kong is declared from hand
   * @returns True if the kong was successfully declared, false otherwise
   */
  declareKong(tile: Tile, handTiles: Tile[], fromHand: boolean): boolean {
    try {
      // Verify that the hand tiles are in the player's hand
      if (!this.verifyTilesInHand(handTiles)) {
        return false;
      }
      
      let kong: TileSet;
      
      if (fromHand) {
        // Create a concealed kong from hand
        kong = TileSetFactory.createConcealedKong([tile, ...handTiles]);
      } else {
        // Create a kong from a claimed tile
        kong = TileSetFactory.createKongFromClaim(tile, handTiles);
      }
      
      // Remove the tiles from the hand
      this.removeTilesFromHand(handTiles);
      
      // Add the kong to the exposed sets
      this.exposedSets.push(kong);
      
      // Update the UI
      this.uiCallbacks.onHandUpdated(this.hand);
      this.uiCallbacks.onExposedSetsUpdated(this.exposedSets);
      
      return true;
    } catch (error) {
      console.error('Failed to declare kong:', error);
      return false;
    }
  }
  
  /**
   * Declares a chow (sequence) with a discarded tile and two tiles from the hand.
   * 
   * @param tile The discarded tile to claim
   * @param handTiles The tiles from the player's hand to form the chow
   * @param position The position of the claimed tile in the chow
   * @returns True if the chow was successfully declared, false otherwise
   */
  declareChow(tile: Tile, handTiles: Tile[], position: ChowPosition): boolean {
    try {
      // Verify that the hand tiles are in the player's hand
      if (!this.verifyTilesInHand(handTiles)) {
        return false;
      }
      
      // Create the chow
      const chow = TileSetFactory.createChowFromClaim(tile, handTiles, position);
      
      // Remove the tiles from the hand
      this.removeTilesFromHand(handTiles);
      
      // Add the chow to the exposed sets
      this.exposedSets.push(chow);
      
      // Update the UI
      this.uiCallbacks.onHandUpdated(this.hand);
      this.uiCallbacks.onExposedSetsUpdated(this.exposedSets);
      
      return true;
    } catch (error) {
      console.error('Failed to declare chow:', error);
      return false;
    }
  }
  
  /**
   * Declares a winning hand (mahjong).
   * 
   * @returns True if the hand is a valid winning hand, false otherwise
   */
  declareMahjong(): boolean {
    // This would typically involve validating the hand
    // For now, we'll just return true
    return true;
  }
  
  /**
   * Gets the player's decision on which tile to discard.
   * 
   * @returns A promise that resolves to the tile to discard
   */
  async getDiscardDecision(): Promise<Tile> {
    return new Promise((resolve) => {
      this.uiCallbacks.requestDiscardDecision((tile) => {
        resolve(tile);
      });
    });
  }
  
  /**
   * Gets the player's decision on which action to take in response to a discarded tile.
   * 
   * @param availableActions The actions available to the player
   * @param discardedTile The tile that was discarded
   * @returns A promise that resolves to the player's decision, or null if no action is taken
   */
  async getActionDecision(
    availableActions: GameAction[], 
    discardedTile: Tile
  ): Promise<GameDecision | null> {
    return new Promise((resolve) => {
      this.uiCallbacks.requestActionDecision(
        availableActions, 
        discardedTile, 
        (decision) => {
          resolve(decision);
        }
      );
    });
  }
  
  /**
   * Sends a message to other players.
   * 
   * @param message The message to send
   */
  sendMessage(message: string): void {
    this.connection.sendMessage(message);
    this.uiCallbacks.onMessageSent(message);
  }
  
  /**
   * Receives a message from another player.
   * 
   * @param message The message received
   * @param sender The player who sent the message
   */
  receiveMessage(message: string, sender: Player): void {
    this.uiCallbacks.onMessageReceived(message, sender);
  }
  
  /**
   * Connects the player to the game.
   * 
   * @returns A promise that resolves to true if the connection was successful, false otherwise
   */
  async connect(): Promise<boolean> {
    return this.connection.connect();
  }
  
  /**
   * Disconnects the player from the game.
   */
  disconnect(): void {
    this.connection.disconnect();
  }
  
  /**
   * Checks if the player is connected to the game.
   * 
   * @returns True if the player is connected, false otherwise
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }
  
  /**
   * Finds the index of a tile in the player's hand.
   * 
   * @param tile The tile to find
   * @returns The index of the tile, or -1 if not found
   */
  private findTileIndex(tile: Tile): number {
    return this.hand.findIndex(t => t.equals(tile));
  }
  
  /**
   * Verifies that all the specified tiles are in the player's hand.
   * 
   * @param tiles The tiles to verify
   * @returns True if all tiles are in the hand, false otherwise
   */
  private verifyTilesInHand(tiles: Tile[]): boolean {
    // Create a copy of the hand to work with
    const handCopy = [...this.hand];
    
    for (const tile of tiles) {
      const index = handCopy.findIndex(t => t.equals(tile));
      if (index === -1) {
        return false;
      }
      
      // Remove the tile from the copy to handle duplicates correctly
      handCopy.splice(index, 1);
    }
    
    return true;
  }
  
  /**
   * Removes the specified tiles from the player's hand.
   * 
   * @param tiles The tiles to remove
   */
  private removeTilesFromHand(tiles: Tile[]): void {
    // Create a copy of the hand to work with
    const handCopy = [...this.hand];
    
    for (const tile of tiles) {
      const index = handCopy.findIndex(t => t.equals(tile));
      if (index !== -1) {
        handCopy.splice(index, 1);
      }
    }
    
    this.hand = handCopy;
  }
}
