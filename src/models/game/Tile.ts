// Tile suits
export enum TileSuit {
  CHARACTERS = 'characters', // 筒子
  BAMBOO = 'bamboo',         // 索子
  CIRCLES = 'circles',       // 萬子
  WINDS = 'winds',           // 風牌
  DRAGONS = 'dragons',       // 箭牌
  FLOWERS = 'flowers'        // 花牌
}

// Wind directions
export enum WindDirection {
  EAST = 'east',   // 東
  SOUTH = 'south', // 南
  WEST = 'west',   // 西
  NORTH = 'north'  // 北
}

// Dragon types
export enum DragonType {
  RED = 'red',     // 紅中
  GREEN = 'green', // 發財
  WHITE = 'white'  // 白板
}

// Flower types
export enum FlowerType {
  PLUM = 'plum',         // 梅
  ORCHID = 'orchid',     // 蘭
  CHRYSANTHEMUM = 'chrysanthemum', // 菊
  BAMBOO = 'bamboo',     // 竹
  SPRING = 'spring',     // 春
  SUMMER = 'summer',     // 夏
  AUTUMN = 'autumn',     // 秋
  WINTER = 'winter'      // 冬
}

// Tile interface
export interface Tile {
  id: string;
  suit: TileSuit;
  value: number | WindDirection | DragonType | FlowerType;
  isConcealed: boolean;
  isSelected?: boolean;
  isDiscarded?: boolean;
  isInSet?: boolean;
  discardedBy?: string;
}

// Create a new tile
export const createTile = (
  suit: TileSuit,
  value: number | WindDirection | DragonType | FlowerType,
  id?: string
): Tile => {
  return {
    id: id || `${suit}-${value}-${Math.random().toString(36).substring(2, 9)}`,
    suit,
    value,
    isConcealed: true
  };
};

// Check if two tiles match (same suit and value)
export const tilesMatch = (tile1: Tile, tile2: Tile): boolean => {
  return tile1.suit === tile2.suit && tile1.value === tile2.value;
};

// Check if a tile is a number tile
export const isNumberTile = (tile: Tile): boolean => {
  return (
    (tile.suit === TileSuit.CHARACTERS ||
      tile.suit === TileSuit.BAMBOO ||
      tile.suit === TileSuit.CIRCLES) &&
    typeof tile.value === 'number'
  );
};

// Check if a tile is a honor tile (winds or dragons)
export const isHonorTile = (tile: Tile): boolean => {
  return tile.suit === TileSuit.WINDS || tile.suit === TileSuit.DRAGONS;
};

// Check if a tile is a flower tile
export const isFlowerTile = (tile: Tile): boolean => {
  return tile.suit === TileSuit.FLOWERS;
};

// Check if tiles form a sequence (chow/sreung)
export const isSequence = (tiles: Tile[]): boolean => {
  if (tiles.length !== 3) return false;

  // All tiles must be from the same suit and be number tiles
  const suit = tiles[0].suit;
  if (
    !tiles.every(tile => tile.suit === suit) ||
    !tiles.every(tile => isNumberTile(tile))
  ) {
    return false;
  }

  // Sort tiles by value
  const sortedTiles = [...tiles].sort((a, b) =>
    (a.value as number) - (b.value as number)
  );

  // Check if they form a sequence
  return (
    (sortedTiles[1].value as number) === (sortedTiles[0].value as number) + 1 &&
    (sortedTiles[2].value as number) === (sortedTiles[1].value as number) + 1
  );
};

// Check if tiles form a triplet (pung)
export const isTriplet = (tiles: Tile[]): boolean => {
  if (tiles.length !== 3) return false;

  // All tiles must have the same suit and value
  const firstTile = tiles[0];
  return tiles.every(tile => tilesMatch(tile, firstTile));
};

// Check if tiles form a quadruplet (kong)
export const isQuadruplet = (tiles: Tile[]): boolean => {
  if (tiles.length !== 4) return false;

  // All tiles must have the same suit and value
  const firstTile = tiles[0];
  return tiles.every(tile => tilesMatch(tile, firstTile));
};

// Check if tiles form a pair
export const isPair = (tiles: Tile[]): boolean => {
  if (tiles.length !== 2) return false;

  // Both tiles must have the same suit and value
  return tilesMatch(tiles[0], tiles[1]);
};

// Get the display name for a tile
export const getTileDisplayName = (tile: Tile): string => {
  switch (tile.suit) {
    case TileSuit.CHARACTERS:
      return `${tile.value}筒`;
    case TileSuit.BAMBOO:
      return `${tile.value}索`;
    case TileSuit.CIRCLES:
      return `${tile.value}萬`;
    case TileSuit.WINDS:
      switch (tile.value) {
        case WindDirection.EAST:
          return '東';
        case WindDirection.SOUTH:
          return '南';
        case WindDirection.WEST:
          return '西';
        case WindDirection.NORTH:
          return '北';
        default:
          return 'Unknown Wind';
      }
    case TileSuit.DRAGONS:
      switch (tile.value) {
        case DragonType.RED:
          return '紅中';
        case DragonType.GREEN:
          return '發財';
        case DragonType.WHITE:
          return '白板';
        default:
          return 'Unknown Dragon';
      }
    case TileSuit.FLOWERS:
      switch (tile.value) {
        case FlowerType.PLUM:
          return '梅';
        case FlowerType.ORCHID:
          return '蘭';
        case FlowerType.CHRYSANTHEMUM:
          return '菊';
        case FlowerType.BAMBOO:
          return '竹';
        case FlowerType.SPRING:
          return '春';
        case FlowerType.SUMMER:
          return '夏';
        case FlowerType.AUTUMN:
          return '秋';
        case FlowerType.WINTER:
          return '冬';
        default:
          return 'Unknown Flower';
      }
    default:
      return 'Unknown Tile';
  }
};
