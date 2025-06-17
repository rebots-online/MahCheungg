import { Tile } from './Tile';
import { TileSet } from './TileSet';
import { Wall } from './Wall';
import { Player } from '../player/Player';

/**
 * Represents the wind direction in Mahjong.
 */
export enum Wind {
  EAST = 'EAST',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  NORTH = 'NORTH'
}

/**
 * Represents the current phase of a turn.
 */
export enum TurnPhase {
  DRAW = 'DRAW',           // Player draws a tile
  DISCARD = 'DISCARD',     // Player discards a tile
  CLAIM = 'CLAIM',         // Other players can claim the discarded tile
  BONUS = 'BONUS',         // Player reveals a bonus tile and draws a replacement
  KONG_REPLACEMENT = 'KONG_REPLACEMENT' // Player draws a replacement tile after declaring a kong
}

/**
 * Represents the state of a Mahjong game.
 */
export class GameState {
  private players: Player[] = [];
  private wall: Wall;
  private discardPile: Tile[] = [];
  private currentPlayerIndex: number = 0;
  private dealerIndex: number = 0;
  private roundWind: Wind = Wind.EAST;
  private turnWind: Wind = Wind.EAST;
  private turnPhase: TurnPhase = TurnPhase.DRAW;
  private lastDiscardedTile: Tile | null = null;
  private roundNumber: number = 1;
  private turnNumber: number = 1;
  private gameOver: boolean = false;
  private winner: Player | null = null;
  
  /**
   * Creates a new GameState instance.
   * 
   * @param players The players in the game
   * @param includeBonus Whether to include bonus tiles
   */
  constructor(players: Player[], includeBonus: boolean = true) {
    if (players.length < 2 || players.length > 4) {
      throw new Error('Mahjong requires 2-4 players');
    }
    
    this.players = [...players];
    this.wall = new Wall(includeBonus);
    this.dealerIndex = 0; // East player starts as dealer
    this.currentPlayerIndex = this.dealerIndex;
  }
  
  /**
   * Initializes the game by dealing tiles to players.
   */
  initialize(): void {
    // Deal initial hands to players
    const hands = this.wall.dealInitialHands(this.players.length, this.dealerIndex);
    
    // Assign hands to players
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      const hand = hands[i];
      
      // Clear any existing tiles
      player.hand = [];
      
      // Add the dealt tiles
      for (const tile of hand) {
        player.drawTile(tile);
      }
    }
    
    // Set the initial turn phase
    this.turnPhase = TurnPhase.DISCARD;
  }
  
  /**
   * Gets the current player.
   * 
   * @returns The current player
   */
  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }
  
  /**
   * Gets the dealer.
   * 
   * @returns The dealer
   */
  getDealer(): Player {
    return this.players[this.dealerIndex];
  }
  
  /**
   * Gets the current round wind.
   * 
   * @returns The current round wind
   */
  getRoundWind(): Wind {
    return this.roundWind;
  }
  
  /**
   * Gets the current turn wind.
   * 
   * @returns The current turn wind
   */
  getTurnWind(): Wind {
    return this.turnWind;
  }
  
  /**
   * Gets the current turn phase.
   * 
   * @returns The current turn phase
   */
  getTurnPhase(): TurnPhase {
    return this.turnPhase;
  }
  
  /**
   * Gets the last discarded tile.
   * 
   * @returns The last discarded tile, or null if no tile has been discarded
   */
  getLastDiscardedTile(): Tile | null {
    return this.lastDiscardedTile;
  }
  
  /**
   * Gets the discard pile.
   * 
   * @returns The discard pile
   */
  getDiscardPile(): Tile[] {
    return [...this.discardPile];
  }
  
  /**
   * Gets the round number.
   * 
   * @returns The round number
   */
  getRoundNumber(): number {
    return this.roundNumber;
  }
  
  /**
   * Gets the turn number.
   * 
   * @returns The turn number
   */
  getTurnNumber(): number {
    return this.turnNumber;
  }
  
  /**
   * Checks if the game is over.
   * 
   * @returns True if the game is over, false otherwise
   */
  isGameOver(): boolean {
    return this.gameOver;
  }
  
  /**
   * Gets the winner of the game.
   * 
   * @returns The winner, or null if the game is not over or ended in a draw
   */
  getWinner(): Player | null {
    return this.winner;
  }
  
  /**
   * Gets the dice roll.
   * 
   * @returns The dice roll
   */
  getDiceRoll(): number[] {
    return this.wall.getDiceRoll();
  }
  
  /**
   * Gets the dora indicator tile.
   * 
   * @returns The dora indicator tile
   */
  getDoraIndicator(): Tile {
    return this.wall.getDoraIndicator();
  }
  
  /**
   * Gets the number of tiles remaining in the wall.
   * 
   * @returns The number of tiles remaining
   */
  getTilesRemaining(): number {
    return this.wall.getTilesRemaining();
  }
  
  /**
   * Draws a tile for the current player.
   * 
   * @returns The drawn tile, or null if the wall is empty
   */
  drawTile(): Tile | null {
    if (this.turnPhase !== TurnPhase.DRAW) {
      throw new Error('Cannot draw a tile in the current phase');
    }
    
    const tile = this.wall.drawTile();
    if (tile) {
      const currentPlayer = this.getCurrentPlayer();
      currentPlayer.drawTile(tile);
      this.turnPhase = TurnPhase.DISCARD;
    } else {
      // Wall is empty, end the game in a draw
      this.gameOver = true;
    }
    
    return tile;
  }
  
  /**
   * Discards a tile for the current player.
   * 
   * @param tile The tile to discard
   */
  discardTile(tile: Tile): void {
    if (this.turnPhase !== TurnPhase.DISCARD) {
      throw new Error('Cannot discard a tile in the current phase');
    }
    
    const currentPlayer = this.getCurrentPlayer();
    currentPlayer.discardTile(tile);
    
    this.lastDiscardedTile = tile;
    this.discardPile.push(tile);
    this.turnPhase = TurnPhase.CLAIM;
  }
  
  /**
   * Moves to the next player's turn.
   */
  nextTurn(): void {
    if (this.turnPhase !== TurnPhase.CLAIM) {
      throw new Error('Cannot move to the next turn in the current phase');
    }
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.turnPhase = TurnPhase.DRAW;
    this.turnNumber++;
    
    // Update the turn wind if we've gone around the table
    if (this.currentPlayerIndex === this.dealerIndex) {
      this.updateTurnWind();
    }
  }
  
  /**
   * Updates the turn wind.
   * In Mahjong, the turn wind changes after each round (when the dealer has had their turn).
   */
  private updateTurnWind(): void {
    switch (this.turnWind) {
      case Wind.EAST:
        this.turnWind = Wind.SOUTH;
        break;
      case Wind.SOUTH:
        this.turnWind = Wind.WEST;
        break;
      case Wind.WEST:
        this.turnWind = Wind.NORTH;
        break;
      case Wind.NORTH:
        this.turnWind = Wind.EAST;
        this.updateRoundWind();
        break;
    }
  }
  
  /**
   * Updates the round wind.
   * In Mahjong, the round wind changes after all players have been the dealer with each wind.
   */
  private updateRoundWind(): void {
    switch (this.roundWind) {
      case Wind.EAST:
        this.roundWind = Wind.SOUTH;
        break;
      case Wind.SOUTH:
        this.roundWind = Wind.WEST;
        break;
      case Wind.WEST:
        this.roundWind = Wind.NORTH;
        break;
      case Wind.NORTH:
        this.roundWind = Wind.EAST;
        this.roundNumber++;
        break;
    }
  }
  
  /**
   * Declares a win for the current player.
   * 
   * @returns True if the win is valid, false otherwise
   */
  declareWin(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    
    // In a full implementation, we would validate the hand here
    // For now, we'll just accept the declaration
    
    this.gameOver = true;
    this.winner = currentPlayer;
    
    return true;
  }
  
  /**
   * Gets a snapshot of the current game state.
   * This can be used for saving the game or sending the state to clients.
   * 
   * @returns A snapshot of the game state
   */
  getSnapshot(): any {
    return {
      players: this.players.map(player => ({
        id: player.id,
        name: player.name,
        isAI: player.isAI,
        hand: player.hand.map(tile => tile.id),
        exposedSets: player.exposedSets.map(set => ({
          type: set.type,
          tiles: set.tiles.map(tile => tile.id),
          concealed: set.concealed
        }))
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      dealerIndex: this.dealerIndex,
      roundWind: this.roundWind,
      turnWind: this.turnWind,
      turnPhase: this.turnPhase,
      lastDiscardedTile: this.lastDiscardedTile ? this.lastDiscardedTile.id : null,
      discardPile: this.discardPile.map(tile => tile.id),
      roundNumber: this.roundNumber,
      turnNumber: this.turnNumber,
      gameOver: this.gameOver,
      winner: this.winner ? this.winner.id : null,
      diceRoll: this.getDiceRoll(),
      doraIndicator: this.getDoraIndicator().id,
      tilesRemaining: this.getTilesRemaining()
    };
  }
}
