/**
 * Represents a Mahjong tile with its type, value, and display character.
 */
export enum TileType {
  BAMBOO = 'BAMBOO',   // 🀐 to 🀘
  CHARACTER = 'CHARACTER', // 🀙 to 🀡
  DOT = 'DOT',         // 🀀 to 🀈
  WIND = 'WIND',       // 🀀 to 🀃
  DRAGON = 'DRAGON',   // 🀄 to 🀆
  FLOWER = 'FLOWER',   // 🀢 to 🀥
  SEASON = 'SEASON'    // 🀦 to 🀩
}

export enum WindType {
  EAST = 'EAST',   // 🀀
  SOUTH = 'SOUTH', // 🀁
  WEST = 'WEST',   // 🀂
  NORTH = 'NORTH'  // 🀃
}

export enum DragonType {
  RED = 'RED',     // 🀄
  GREEN = 'GREEN', // 🀅
  WHITE = 'WHITE'  // 🀆
}

export class Tile {
  private readonly _id: string;
  private readonly _type: TileType;
  private readonly _value: number | WindType | DragonType;
  private readonly _unicode: string;

  /**
   * Creates a new Tile instance.
   * 
   * @param type The type of the tile (BAMBOO, CHARACTER, DOT, WIND, DRAGON, FLOWER, SEASON)
   * @param value The value of the tile (1-9 for suits, WindType for winds, DragonType for dragons)
   */
  constructor(type: TileType, value: number | WindType | DragonType) {
    this._type = type;
    this._value = value;
    this._id = `${type}_${value}`;
    this._unicode = this.getUnicodeCharacter();
  }

  /**
   * Gets the unique identifier for this tile.
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the type of this tile.
   */
  get type(): TileType {
    return this._type;
  }

  /**
   * Gets the value of this tile.
   */
  get value(): number | WindType | DragonType {
    return this._value;
  }

  /**
   * Gets the Unicode character representation of this tile.
   */
  get unicode(): string {
    return this._unicode;
  }

  /**
   * Determines if this tile is a suit tile (BAMBOO, CHARACTER, DOT).
   */
  isSuit(): boolean {
    return this._type === TileType.BAMBOO || 
           this._type === TileType.CHARACTER || 
           this._type === TileType.DOT;
  }

  /**
   * Determines if this tile is an honor tile (WIND, DRAGON).
   */
  isHonor(): boolean {
    return this._type === TileType.WIND || this._type === TileType.DRAGON;
  }

  /**
   * Determines if this tile is a bonus tile (FLOWER, SEASON).
   */
  isBonus(): boolean {
    return this._type === TileType.FLOWER || this._type === TileType.SEASON;
  }

  /**
   * Determines if this tile can form a sequence (chow).
   * Only suit tiles can form sequences.
   */
  canFormSequence(): boolean {
    return this.isSuit();
  }

  /**
   * Determines if this tile equals another tile.
   * Two tiles are equal if they have the same type and value.
   * 
   * @param other The other tile to compare with
   */
  equals(other: Tile): boolean {
    return this._type === other._type && this._value === other._value;
  }

  /**
   * Gets the Unicode character for this tile.
   */
  private getUnicodeCharacter(): string {
    switch (this._type) {
      case TileType.BAMBOO:
        return String.fromCodePoint(0x1F010 + (this._value as number) - 1);
      case TileType.CHARACTER:
        return String.fromCodePoint(0x1F019 + (this._value as number) - 1);
      case TileType.DOT:
        return String.fromCodePoint(0x1F007 + (this._value as number) - 1);
      case TileType.WIND:
        switch (this._value) {
          case WindType.EAST: return '🀀';
          case WindType.SOUTH: return '🀁';
          case WindType.WEST: return '🀂';
          case WindType.NORTH: return '🀃';
          default: return '';
        }
      case TileType.DRAGON:
        switch (this._value) {
          case DragonType.RED: return '🀄';
          case DragonType.GREEN: return '🀅';
          case DragonType.WHITE: return '🀆';
          default: return '';
        }
      case TileType.FLOWER:
        return String.fromCodePoint(0x1F022 + (this._value as number) - 1);
      case TileType.SEASON:
        return String.fromCodePoint(0x1F026 + (this._value as number) - 1);
      default:
        return '';
    }
  }

  /**
   * Returns a string representation of this tile.
   */
  toString(): string {
    return `${this._unicode} (${this._type} ${this._value})`;
  }
}

/**
 * Factory class for creating tiles.
 */
export class TileFactory {
  /**
   * Creates a bamboo tile with the specified value.
   * 
   * @param value The value of the bamboo tile (1-9)
   */
  static createBamboo(value: number): Tile {
    if (value < 1 || value > 9) {
      throw new Error('Bamboo value must be between 1 and 9');
    }
    return new Tile(TileType.BAMBOO, value);
  }

  /**
   * Creates a character tile with the specified value.
   * 
   * @param value The value of the character tile (1-9)
   */
  static createCharacter(value: number): Tile {
    if (value < 1 || value > 9) {
      throw new Error('Character value must be between 1 and 9');
    }
    return new Tile(TileType.CHARACTER, value);
  }

  /**
   * Creates a dot tile with the specified value.
   * 
   * @param value The value of the dot tile (1-9)
   */
  static createDot(value: number): Tile {
    if (value < 1 || value > 9) {
      throw new Error('Dot value must be between 1 and 9');
    }
    return new Tile(TileType.DOT, value);
  }

  /**
   * Creates a wind tile with the specified type.
   * 
   * @param windType The type of the wind tile (EAST, SOUTH, WEST, NORTH)
   */
  static createWind(windType: WindType): Tile {
    return new Tile(TileType.WIND, windType);
  }

  /**
   * Creates a dragon tile with the specified type.
   * 
   * @param dragonType The type of the dragon tile (RED, GREEN, WHITE)
   */
  static createDragon(dragonType: DragonType): Tile {
    return new Tile(TileType.DRAGON, dragonType);
  }

  /**
   * Creates a flower tile with the specified value.
   * 
   * @param value The value of the flower tile (1-4)
   */
  static createFlower(value: number): Tile {
    if (value < 1 || value > 4) {
      throw new Error('Flower value must be between 1 and 4');
    }
    return new Tile(TileType.FLOWER, value);
  }

  /**
   * Creates a season tile with the specified value.
   * 
   * @param value The value of the season tile (1-4)
   */
  static createSeason(value: number): Tile {
    if (value < 1 || value > 4) {
      throw new Error('Season value must be between 1 and 4');
    }
    return new Tile(TileType.SEASON, value);
  }

  /**
   * Creates a complete set of Mahjong tiles (without duplicates).
   * This includes:
   * - 9 bamboo tiles (1-9)
   * - 9 character tiles (1-9)
   * - 9 dot tiles (1-9)
   * - 4 wind tiles (EAST, SOUTH, WEST, NORTH)
   * - 3 dragon tiles (RED, GREEN, WHITE)
   * - 4 flower tiles (1-4)
   * - 4 season tiles (1-4)
   */
  static createCompleteTileSet(): Tile[] {
    const tiles: Tile[] = [];

    // Add bamboo tiles
    for (let i = 1; i <= 9; i++) {
      tiles.push(this.createBamboo(i));
    }

    // Add character tiles
    for (let i = 1; i <= 9; i++) {
      tiles.push(this.createCharacter(i));
    }

    // Add dot tiles
    for (let i = 1; i <= 9; i++) {
      tiles.push(this.createDot(i));
    }

    // Add wind tiles
    tiles.push(this.createWind(WindType.EAST));
    tiles.push(this.createWind(WindType.SOUTH));
    tiles.push(this.createWind(WindType.WEST));
    tiles.push(this.createWind(WindType.NORTH));

    // Add dragon tiles
    tiles.push(this.createDragon(DragonType.RED));
    tiles.push(this.createDragon(DragonType.GREEN));
    tiles.push(this.createDragon(DragonType.WHITE));

    // Add flower tiles
    for (let i = 1; i <= 4; i++) {
      tiles.push(this.createFlower(i));
    }

    // Add season tiles
    for (let i = 1; i <= 4; i++) {
      tiles.push(this.createSeason(i));
    }

    return tiles;
  }

  /**
   * Creates a standard Mahjong set with the correct number of duplicates.
   * This includes:
   * - 4 of each bamboo tile (1-9)
   * - 4 of each character tile (1-9)
   * - 4 of each dot tile (1-9)
   * - 4 of each wind tile (EAST, SOUTH, WEST, NORTH)
   * - 4 of each dragon tile (RED, GREEN, WHITE)
   * - 1 of each flower tile (1-4)
   * - 1 of each season tile (1-4)
   */
  static createStandardMahjongSet(): Tile[] {
    const tiles: Tile[] = [];

    // Add 4 of each bamboo tile
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        tiles.push(this.createBamboo(i));
      }
    }

    // Add 4 of each character tile
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        tiles.push(this.createCharacter(i));
      }
    }

    // Add 4 of each dot tile
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 4; j++) {
        tiles.push(this.createDot(i));
      }
    }

    // Add 4 of each wind tile
    const windTypes = [WindType.EAST, WindType.SOUTH, WindType.WEST, WindType.NORTH];
    for (const windType of windTypes) {
      for (let j = 0; j < 4; j++) {
        tiles.push(this.createWind(windType));
      }
    }

    // Add 4 of each dragon tile
    const dragonTypes = [DragonType.RED, DragonType.GREEN, DragonType.WHITE];
    for (const dragonType of dragonTypes) {
      for (let j = 0; j < 4; j++) {
        tiles.push(this.createDragon(dragonType));
      }
    }

    // Add 1 of each flower tile
    for (let i = 1; i <= 4; i++) {
      tiles.push(this.createFlower(i));
    }

    // Add 1 of each season tile
    for (let i = 1; i <= 4; i++) {
      tiles.push(this.createSeason(i));
    }

    return tiles;
  }
}
