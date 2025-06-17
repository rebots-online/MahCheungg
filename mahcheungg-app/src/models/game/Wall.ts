import { Tile, TileFactory } from './Tile';

/**
 * Represents the wall of tiles in a Mahjong game.
 * The wall is the source of tiles for players to draw from.
 */
export class Wall {
  private tiles: Tile[] = [];
  private deadWall: Tile[] = [];
  private diceRoll: number[] = [];
  
  /**
   * Creates a new Wall instance.
   * 
   * @param includeBonus Whether to include bonus tiles (flowers and seasons)
   */
  constructor(includeBonus: boolean = true) {
    this.initialize(includeBonus);
  }
  
  /**
   * Initializes the wall with a standard set of Mahjong tiles.
   * 
   * @param includeBonus Whether to include bonus tiles (flowers and seasons)
   */
  private initialize(includeBonus: boolean): void {
    // Create a standard Mahjong set
    this.tiles = TileFactory.createStandardMahjongSet();
    
    // Remove bonus tiles if not included
    if (!includeBonus) {
      this.tiles = this.tiles.filter(tile => !tile.isBonus());
    }
    
    // Shuffle the tiles
    this.shuffle();
    
    // Roll the dice to determine the starting position
    this.rollDice();
    
    // Set up the dead wall (14 tiles from the end)
    this.setupDeadWall();
  }
  
  /**
   * Shuffles the tiles in the wall.
   */
  private shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }
  
  /**
   * Rolls the dice to determine the starting position.
   * In Mahjong, typically two dice are rolled to determine where to break the wall.
   */
  private rollDice(): void {
    this.diceRoll = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
  }
  
  /**
   * Sets up the dead wall (dora indicators and replacement tiles).
   * The dead wall typically consists of 14 tiles from the end of the wall.
   */
  private setupDeadWall(): void {
    // Take 14 tiles from the end of the wall for the dead wall
    this.deadWall = this.tiles.splice(this.tiles.length - 14, 14);
  }
  
  /**
   * Gets the dice roll.
   * 
   * @returns The dice roll
   */
  getDiceRoll(): number[] {
    return [...this.diceRoll];
  }
  
  /**
   * Gets the dora indicator tile.
   * The dora indicator is typically the 5th tile from the right end of the dead wall.
   * 
   * @returns The dora indicator tile
   */
  getDoraIndicator(): Tile {
    return this.deadWall[4];
  }
  
  /**
   * Draws a tile from the wall.
   * 
   * @returns The drawn tile, or null if the wall is empty
   */
  drawTile(): Tile | null {
    if (this.tiles.length === 0) {
      return null;
    }
    
    return this.tiles.pop() || null;
  }
  
  /**
   * Draws a replacement tile for a declared kong.
   * In Mahjong, when a player declares a kong, they draw a replacement tile from the dead wall.
   * 
   * @returns The replacement tile, or null if the dead wall is empty
   */
  drawReplacementTile(): Tile | null {
    if (this.deadWall.length === 0) {
      return null;
    }
    
    return this.deadWall.pop() || null;
  }
  
  /**
   * Gets the number of tiles remaining in the wall.
   * 
   * @returns The number of tiles remaining
   */
  getTilesRemaining(): number {
    return this.tiles.length;
  }
  
  /**
   * Checks if the wall is empty.
   * 
   * @returns True if the wall is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.tiles.length === 0;
  }
  
  /**
   * Draws a specific number of tiles from the wall.
   * 
   * @param count The number of tiles to draw
   * @returns An array of drawn tiles
   */
  drawTiles(count: number): Tile[] {
    const drawnTiles: Tile[] = [];
    
    for (let i = 0; i < count; i++) {
      const tile = this.drawTile();
      if (tile) {
        drawnTiles.push(tile);
      } else {
        break;
      }
    }
    
    return drawnTiles;
  }
  
  /**
   * Deals initial hands to players.
   * In Mahjong, each player typically starts with 13 tiles, and the dealer gets an extra tile.
   * 
   * @param playerCount The number of players
   * @param dealerIndex The index of the dealer
   * @returns An array of arrays, where each inner array represents a player's hand
   */
  dealInitialHands(playerCount: number, dealerIndex: number): Tile[][] {
    const hands: Tile[][] = [];
    
    // Initialize empty hands for each player
    for (let i = 0; i < playerCount; i++) {
      hands.push([]);
    }
    
    // Deal 13 tiles to each player
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < playerCount; j++) {
        const tile = this.drawTile();
        if (tile) {
          hands[j].push(tile);
        }
      }
    }
    
    // Deal an extra tile to the dealer
    const extraTile = this.drawTile();
    if (extraTile) {
      hands[dealerIndex].push(extraTile);
    }
    
    return hands;
  }
}
