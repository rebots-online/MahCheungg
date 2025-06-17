import { Tile } from './Tile';

/**
 * Represents the type of a tile set in Mahjong.
 */
export enum TileSetType {
  CHOW = 'CHOW',   // A sequence of three consecutive tiles of the same suit
  PUNG = 'PUNG',   // Three identical tiles
  KONG = 'KONG',   // Four identical tiles
  PAIR = 'PAIR'    // Two identical tiles
}

/**
 * Represents the position of a chow relative to the claimed tile.
 */
export enum ChowPosition {
  LOWER = 'LOWER', // The claimed tile is the highest in the sequence
  MIDDLE = 'MIDDLE', // The claimed tile is in the middle of the sequence
  UPPER = 'UPPER'  // The claimed tile is the lowest in the sequence
}

/**
 * Represents a set of tiles in Mahjong (Chow, Pung, Kong, or Pair).
 */
export class TileSet {
  private readonly _type: TileSetType;
  private readonly _tiles: Tile[];
  private readonly _concealed: boolean;

  /**
   * Creates a new TileSet instance.
   * 
   * @param type The type of the tile set (CHOW, PUNG, KONG, PAIR)
   * @param tiles The tiles in the set
   * @param concealed Whether the set is concealed (not visible to other players)
   */
  constructor(type: TileSetType, tiles: Tile[], concealed: boolean = false) {
    this._type = type;
    this._tiles = [...tiles];
    this._concealed = concealed;

    // Validate the tile set
    this.validate();
  }

  /**
   * Gets the type of this tile set.
   */
  get type(): TileSetType {
    return this._type;
  }

  /**
   * Gets the tiles in this set.
   */
  get tiles(): Tile[] {
    return [...this._tiles];
  }

  /**
   * Gets whether this set is concealed.
   */
  get concealed(): boolean {
    return this._concealed;
  }

  /**
   * Validates that the tile set is valid according to Mahjong rules.
   * Throws an error if the set is invalid.
   */
  private validate(): void {
    switch (this._type) {
      case TileSetType.CHOW:
        this.validateChow();
        break;
      case TileSetType.PUNG:
        this.validatePung();
        break;
      case TileSetType.KONG:
        this.validateKong();
        break;
      case TileSetType.PAIR:
        this.validatePair();
        break;
    }
  }

  /**
   * Validates a chow (sequence) set.
   * A chow must consist of exactly 3 consecutive tiles of the same suit.
   */
  private validateChow(): void {
    if (this._tiles.length !== 3) {
      throw new Error('A chow must consist of exactly 3 tiles');
    }

    // All tiles must be of the same suit
    const suitType = this._tiles[0].type;
    if (!this._tiles.every(tile => tile.type === suitType)) {
      throw new Error('All tiles in a chow must be of the same suit');
    }

    // All tiles must be suit tiles
    if (!this._tiles.every(tile => tile.isSuit())) {
      throw new Error('Chows can only be formed with suit tiles');
    }

    // Sort tiles by value
    const sortedTiles = [...this._tiles].sort((a, b) => 
      (a.value as number) - (b.value as number)
    );

    // Check if the values are consecutive
    for (let i = 0; i < sortedTiles.length - 1; i++) {
      if ((sortedTiles[i + 1].value as number) - (sortedTiles[i].value as number) !== 1) {
        throw new Error('Tiles in a chow must have consecutive values');
      }
    }
  }

  /**
   * Validates a pung (triplet) set.
   * A pung must consist of exactly 3 identical tiles.
   */
  private validatePung(): void {
    if (this._tiles.length !== 3) {
      throw new Error('A pung must consist of exactly 3 tiles');
    }

    // All tiles must be identical
    const firstTile = this._tiles[0];
    if (!this._tiles.every(tile => tile.equals(firstTile))) {
      throw new Error('All tiles in a pung must be identical');
    }
  }

  /**
   * Validates a kong (quadruplet) set.
   * A kong must consist of exactly 4 identical tiles.
   */
  private validateKong(): void {
    if (this._tiles.length !== 4) {
      throw new Error('A kong must consist of exactly 4 tiles');
    }

    // All tiles must be identical
    const firstTile = this._tiles[0];
    if (!this._tiles.every(tile => tile.equals(firstTile))) {
      throw new Error('All tiles in a kong must be identical');
    }
  }

  /**
   * Validates a pair set.
   * A pair must consist of exactly 2 identical tiles.
   */
  private validatePair(): void {
    if (this._tiles.length !== 2) {
      throw new Error('A pair must consist of exactly 2 tiles');
    }

    // Both tiles must be identical
    if (!this._tiles[0].equals(this._tiles[1])) {
      throw new Error('Both tiles in a pair must be identical');
    }
  }

  /**
   * Determines if this tile set contains a specific tile.
   * 
   * @param tile The tile to check for
   */
  containsTile(tile: Tile): boolean {
    return this._tiles.some(t => t.equals(tile));
  }

  /**
   * Gets the position of a tile in a chow.
   * 
   * @param tile The tile to get the position of
   * @returns The position of the tile in the chow, or null if the tile is not in the chow
   */
  getChowPosition(tile: Tile): ChowPosition | null {
    if (this._type !== TileSetType.CHOW || !this.containsTile(tile)) {
      return null;
    }

    // Sort tiles by value
    const sortedTiles = [...this._tiles].sort((a, b) => 
      (a.value as number) - (b.value as number)
    );

    // Find the position of the tile
    if (tile.equals(sortedTiles[0])) {
      return ChowPosition.UPPER;
    } else if (tile.equals(sortedTiles[1])) {
      return ChowPosition.MIDDLE;
    } else {
      return ChowPosition.LOWER;
    }
  }

  /**
   * Returns a string representation of this tile set.
   */
  toString(): string {
    const tilesStr = this._tiles.map(tile => tile.unicode).join(' ');
    return `${this._type}${this._concealed ? ' (Concealed)' : ''}: ${tilesStr}`;
  }
}

/**
 * Factory class for creating tile sets.
 */
export class TileSetFactory {
  /**
   * Creates a chow (sequence) from three consecutive tiles of the same suit.
   * 
   * @param tiles The three consecutive tiles of the same suit
   * @param concealed Whether the chow is concealed
   */
  static createChow(tiles: Tile[], concealed: boolean = false): TileSet {
    return new TileSet(TileSetType.CHOW, tiles, concealed);
  }

  /**
   * Creates a pung (triplet) from three identical tiles.
   * 
   * @param tiles The three identical tiles
   * @param concealed Whether the pung is concealed
   */
  static createPung(tiles: Tile[], concealed: boolean = false): TileSet {
    return new TileSet(TileSetType.PUNG, tiles, concealed);
  }

  /**
   * Creates a kong (quadruplet) from four identical tiles.
   * 
   * @param tiles The four identical tiles
   * @param concealed Whether the kong is concealed
   */
  static createKong(tiles: Tile[], concealed: boolean = false): TileSet {
    return new TileSet(TileSetType.KONG, tiles, concealed);
  }

  /**
   * Creates a pair from two identical tiles.
   * 
   * @param tiles The two identical tiles
   * @param concealed Whether the pair is concealed
   */
  static createPair(tiles: Tile[], concealed: boolean = false): TileSet {
    return new TileSet(TileSetType.PAIR, tiles, concealed);
  }

  /**
   * Attempts to create a chow from a claimed tile and two tiles from the player's hand.
   * 
   * @param claimedTile The tile claimed from another player's discard
   * @param handTiles The tiles from the player's hand to form the chow
   * @param position The position of the claimed tile in the chow
   */
  static createChowFromClaim(
    claimedTile: Tile,
    handTiles: Tile[],
    position: ChowPosition
  ): TileSet {
    if (handTiles.length !== 2) {
      throw new Error('Two tiles from hand are required to form a chow');
    }

    if (!claimedTile.canFormSequence()) {
      throw new Error('Only suit tiles can form a chow');
    }

    const allTiles = [claimedTile, ...handTiles];
    
    // Ensure all tiles are of the same suit
    const suitType = claimedTile.type;
    if (!allTiles.every(tile => tile.type === suitType)) {
      throw new Error('All tiles in a chow must be of the same suit');
    }

    // Calculate the expected values based on the position
    const claimedValue = claimedTile.value as number;
    let expectedValues: number[] = [];
    
    switch (position) {
      case ChowPosition.LOWER:
        expectedValues = [claimedValue - 2, claimedValue - 1, claimedValue];
        break;
      case ChowPosition.MIDDLE:
        expectedValues = [claimedValue - 1, claimedValue, claimedValue + 1];
        break;
      case ChowPosition.UPPER:
        expectedValues = [claimedValue, claimedValue + 1, claimedValue + 2];
        break;
    }

    // Validate the values
    const sortedTiles = [...allTiles].sort((a, b) => 
      (a.value as number) - (b.value as number)
    );
    
    for (let i = 0; i < sortedTiles.length; i++) {
      if ((sortedTiles[i].value as number) !== expectedValues[i]) {
        throw new Error('Tiles do not form a valid chow');
      }
    }

    return new TileSet(TileSetType.CHOW, allTiles, false);
  }

  /**
   * Attempts to create a pung from a claimed tile and two tiles from the player's hand.
   * 
   * @param claimedTile The tile claimed from another player's discard
   * @param handTiles The tiles from the player's hand to form the pung
   */
  static createPungFromClaim(claimedTile: Tile, handTiles: Tile[]): TileSet {
    if (handTiles.length !== 2) {
      throw new Error('Two tiles from hand are required to form a pung');
    }

    // Ensure all tiles are identical
    if (!handTiles.every(tile => tile.equals(claimedTile))) {
      throw new Error('All tiles in a pung must be identical');
    }

    return new TileSet(TileSetType.PUNG, [claimedTile, ...handTiles], false);
  }

  /**
   * Attempts to create a kong from a claimed tile and three tiles from the player's hand.
   * 
   * @param claimedTile The tile claimed from another player's discard
   * @param handTiles The tiles from the player's hand to form the kong
   */
  static createKongFromClaim(claimedTile: Tile, handTiles: Tile[]): TileSet {
    if (handTiles.length !== 3) {
      throw new Error('Three tiles from hand are required to form a kong');
    }

    // Ensure all tiles are identical
    if (!handTiles.every(tile => tile.equals(claimedTile))) {
      throw new Error('All tiles in a kong must be identical');
    }

    return new TileSet(TileSetType.KONG, [claimedTile, ...handTiles], false);
  }

  /**
   * Attempts to create a concealed kong from four identical tiles from the player's hand.
   * 
   * @param tiles The four identical tiles from the player's hand
   */
  static createConcealedKong(tiles: Tile[]): TileSet {
    if (tiles.length !== 4) {
      throw new Error('Four tiles are required to form a kong');
    }

    // Ensure all tiles are identical
    const firstTile = tiles[0];
    if (!tiles.every(tile => tile.equals(firstTile))) {
      throw new Error('All tiles in a kong must be identical');
    }

    return new TileSet(TileSetType.KONG, tiles, true);
  }

  /**
   * Attempts to create a kong by adding a fourth tile to an existing pung.
   * 
   * @param pung The existing pung
   * @param fourthTile The fourth tile to add to the pung
   */
  static createKongFromPung(pung: TileSet, fourthTile: Tile): TileSet {
    if (pung.type !== TileSetType.PUNG) {
      throw new Error('A pung is required to create a kong from pung');
    }

    const pungTiles = pung.tiles;
    if (!fourthTile.equals(pungTiles[0])) {
      throw new Error('The fourth tile must be identical to the pung tiles');
    }

    return new TileSet(
      TileSetType.KONG, 
      [...pungTiles, fourthTile], 
      pung.concealed
    );
  }
}
