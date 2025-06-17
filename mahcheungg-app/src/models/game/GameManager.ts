import { Tile } from './Tile';
import { ChowPosition, TileSet, TileSetFactory } from './TileSet';
import { GameState, TurnPhase, Wind } from './GameState';
import { GameAction, GameDecision, Player } from '../player/Player';

/**
 * Manages the game flow and rules for a Mahjong game.
 */
export class GameManager {
  private gameState: GameState;
  private players: Player[] = [];
  private gameInProgress: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();
  
  /**
   * Creates a new GameManager instance.
   * 
   * @param players The players in the game
   * @param includeBonus Whether to include bonus tiles
   */
  constructor(players: Player[], includeBonus: boolean = true) {
    this.players = [...players];
    this.gameState = new GameState(this.players, includeBonus);
  }
  
  /**
   * Starts a new game.
   */
  async startGame(): Promise<void> {
    if (this.gameInProgress) {
      throw new Error('Game is already in progress');
    }
    
    // Initialize the game state
    this.gameState.initialize();
    this.gameInProgress = true;
    
    // Emit game started event
    this.emitEvent('gameStarted', this.gameState.getSnapshot());
    
    // Start the game loop
    await this.runGameLoop();
  }
  
  /**
   * Runs the main game loop.
   */
  private async runGameLoop(): Promise<void> {
    while (!this.gameState.isGameOver()) {
      // Get the current player
      const currentPlayer = this.gameState.getCurrentPlayer();
      
      // Emit turn started event
      this.emitEvent('turnStarted', {
        player: currentPlayer,
        turnNumber: this.gameState.getTurnNumber(),
        phase: this.gameState.getTurnPhase()
      });
      
      // Handle the current turn phase
      switch (this.gameState.getTurnPhase()) {
        case TurnPhase.DRAW:
          await this.handleDrawPhase(currentPlayer);
          break;
        case TurnPhase.DISCARD:
          await this.handleDiscardPhase(currentPlayer);
          break;
        case TurnPhase.CLAIM:
          await this.handleClaimPhase(currentPlayer);
          break;
        case TurnPhase.BONUS:
          await this.handleBonusPhase(currentPlayer);
          break;
        case TurnPhase.KONG_REPLACEMENT:
          await this.handleKongReplacementPhase(currentPlayer);
          break;
      }
      
      // Emit turn ended event
      this.emitEvent('turnEnded', {
        player: currentPlayer,
        turnNumber: this.gameState.getTurnNumber(),
        phase: this.gameState.getTurnPhase()
      });
      
      // Check if the game is over
      if (this.gameState.isGameOver()) {
        // Emit game ended event
        this.emitEvent('gameEnded', {
          winner: this.gameState.getWinner(),
          gameState: this.gameState.getSnapshot()
        });
        
        this.gameInProgress = false;
        break;
      }
    }
  }
  
  /**
   * Handles the draw phase of a turn.
   * 
   * @param player The current player
   */
  private async handleDrawPhase(player: Player): Promise<void> {
    // Draw a tile for the player
    const drawnTile = this.gameState.drawTile();
    
    // Emit tile drawn event
    this.emitEvent('tileDrawn', {
      player,
      tile: drawnTile
    });
    
    // Check if the player can declare a win with the drawn tile
    if (this.canDeclareWin(player)) {
      // Ask the player if they want to declare a win
      const decision = await player.getActionDecision([GameAction.MAHJONG], drawnTile!);
      
      if (decision && decision.action === GameAction.MAHJONG) {
        // Player declares a win
        this.gameState.declareWin();
        
        // Emit win declared event
        this.emitEvent('winDeclared', {
          player,
          tile: drawnTile
        });
        
        return;
      }
    }
    
    // Check if the player can declare a kong with the drawn tile
    if (this.canDeclareKong(player, drawnTile!)) {
      // Ask the player if they want to declare a kong
      const decision = await player.getActionDecision([GameAction.KONG], drawnTile!);
      
      if (decision && decision.action === GameAction.KONG) {
        // Player declares a kong
        // In a full implementation, we would handle the kong declaration here
        
        // Emit kong declared event
        this.emitEvent('kongDeclared', {
          player,
          tile: drawnTile
        });
        
        // Move to the kong replacement phase
        // this.gameState.setTurnPhase(TurnPhase.KONG_REPLACEMENT);
        return;
      }
    }
  }
  
  /**
   * Handles the discard phase of a turn.
   * 
   * @param player The current player
   */
  private async handleDiscardPhase(player: Player): Promise<void> {
    // Get the player's decision on which tile to discard
    const tileToDiscard = await player.getDiscardDecision();
    
    // Discard the tile
    this.gameState.discardTile(tileToDiscard);
    
    // Emit tile discarded event
    this.emitEvent('tileDiscarded', {
      player,
      tile: tileToDiscard
    });
  }
  
  /**
   * Handles the claim phase of a turn.
   * 
   * @param player The current player
   */
  private async handleClaimPhase(player: Player): Promise<void> {
    const discardedTile = this.gameState.getLastDiscardedTile()!;
    
    // Check if any player can claim the discarded tile
    const claimingPlayers = await this.getClaimingPlayers(discardedTile);
    
    if (claimingPlayers.length > 0) {
      // Handle the claims in priority order
      // In a full implementation, we would need to resolve conflicts
      // For now, we'll just take the first claim
      const claim = claimingPlayers[0];
      
      // Handle the claim
      switch (claim.decision.action) {
        case GameAction.MAHJONG:
          // Player declares a win
          this.gameState.declareWin();
          
          // Emit win declared event
          this.emitEvent('winDeclared', {
            player: claim.player,
            tile: discardedTile
          });
          break;
        case GameAction.KONG:
          // Player declares a kong
          // In a full implementation, we would handle the kong declaration here
          
          // Emit kong declared event
          this.emitEvent('kongDeclared', {
            player: claim.player,
            tile: discardedTile
          });
          
          // Move to the kong replacement phase
          // this.gameState.setTurnPhase(TurnPhase.KONG_REPLACEMENT);
          break;
        case GameAction.PUNG:
          // Player declares a pung
          // In a full implementation, we would handle the pung declaration here
          
          // Emit pung declared event
          this.emitEvent('pungDeclared', {
            player: claim.player,
            tile: discardedTile
          });
          
          // Set the current player to the claiming player
          // this.gameState.setCurrentPlayer(this.players.indexOf(claim.player));
          // this.gameState.setTurnPhase(TurnPhase.DISCARD);
          break;
        case GameAction.CHOW:
          // Player declares a chow
          // In a full implementation, we would handle the chow declaration here
          
          // Emit chow declared event
          this.emitEvent('chowDeclared', {
            player: claim.player,
            tile: discardedTile
          });
          
          // Set the current player to the claiming player
          // this.gameState.setCurrentPlayer(this.players.indexOf(claim.player));
          // this.gameState.setTurnPhase(TurnPhase.DISCARD);
          break;
      }
    } else {
      // No claims, move to the next player's turn
      this.gameState.nextTurn();
    }
  }
  
  /**
   * Handles the bonus phase of a turn.
   * 
   * @param player The current player
   */
  private async handleBonusPhase(player: Player): Promise<void> {
    // In a full implementation, we would handle bonus tiles here
    // For now, we'll just move to the discard phase
    // this.gameState.setTurnPhase(TurnPhase.DISCARD);
  }
  
  /**
   * Handles the kong replacement phase of a turn.
   * 
   * @param player The current player
   */
  private async handleKongReplacementPhase(player: Player): Promise<void> {
    // In a full implementation, we would handle kong replacement here
    // For now, we'll just move to the discard phase
    // this.gameState.setTurnPhase(TurnPhase.DISCARD);
  }
  
  /**
   * Gets the players who want to claim a discarded tile.
   * 
   * @param discardedTile The discarded tile
   * @returns An array of players and their decisions
   */
  private async getClaimingPlayers(discardedTile: Tile): Promise<{ player: Player, decision: GameDecision }[]> {
    const claimingPlayers: { player: Player, decision: GameDecision }[] = [];
    
    // Check each player except the current player
    for (const player of this.players) {
      if (player === this.gameState.getCurrentPlayer()) {
        continue;
      }
      
      // Determine which actions the player can take
      const availableActions = this.getAvailableActions(player, discardedTile);
      
      if (availableActions.length > 0) {
        // Ask the player for their decision
        const decision = await player.getActionDecision(availableActions, discardedTile);
        
        if (decision) {
          claimingPlayers.push({ player, decision });
        }
      }
    }
    
    return claimingPlayers;
  }
  
  /**
   * Gets the available actions for a player in response to a discarded tile.
   * 
   * @param player The player
   * @param discardedTile The discarded tile
   * @returns An array of available actions
   */
  private getAvailableActions(player: Player, discardedTile: Tile): GameAction[] {
    const availableActions: GameAction[] = [];
    
    // Check if the player can declare a win
    if (this.canDeclareWin(player, discardedTile)) {
      availableActions.push(GameAction.MAHJONG);
    }
    
    // Check if the player can declare a kong
    if (this.canDeclareKong(player, discardedTile)) {
      availableActions.push(GameAction.KONG);
    }
    
    // Check if the player can declare a pung
    if (this.canDeclarePung(player, discardedTile)) {
      availableActions.push(GameAction.PUNG);
    }
    
    // Check if the player can declare a chow
    if (this.canDeclareChow(player, discardedTile)) {
      availableActions.push(GameAction.CHOW);
    }
    
    return availableActions;
  }
  
  /**
   * Checks if a player can declare a win.
   * 
   * @param player The player
   * @param discardedTile Optional discarded tile (for claiming a win)
   * @returns True if the player can declare a win, false otherwise
   */
  private canDeclareWin(player: Player, discardedTile?: Tile): boolean {
    // In a full implementation, we would check if the player's hand forms a valid winning hand
    // For now, we'll just return false
    return false;
  }
  
  /**
   * Checks if a player can declare a kong.
   * 
   * @param player The player
   * @param discardedTile Optional discarded tile (for claiming a kong)
   * @returns True if the player can declare a kong, false otherwise
   */
  private canDeclareKong(player: Player, discardedTile?: Tile): boolean {
    if (discardedTile) {
      // Check if the player has three matching tiles in their hand
      const matchingTiles = player.hand.filter(tile => tile.equals(discardedTile));
      return matchingTiles.length === 3;
    } else {
      // Check if the player has four matching tiles in their hand
      const tileCounts = new Map<string, number>();
      
      for (const tile of player.hand) {
        const key = `${tile.type}_${tile.value}`;
        tileCounts.set(key, (tileCounts.get(key) || 0) + 1);
      }
      
      return Array.from(tileCounts.values()).some(count => count === 4);
    }
  }
  
  /**
   * Checks if a player can declare a pung.
   * 
   * @param player The player
   * @param discardedTile The discarded tile
   * @returns True if the player can declare a pung, false otherwise
   */
  private canDeclarePung(player: Player, discardedTile: Tile): boolean {
    // Check if the player has two matching tiles in their hand
    const matchingTiles = player.hand.filter(tile => tile.equals(discardedTile));
    return matchingTiles.length >= 2;
  }
  
  /**
   * Checks if a player can declare a chow.
   * 
   * @param player The player
   * @param discardedTile The discarded tile
   * @returns True if the player can declare a chow, false otherwise
   */
  private canDeclareChow(player: Player, discardedTile: Tile): boolean {
    // Chow can only be formed with suit tiles
    if (!discardedTile.canFormSequence()) {
      return false;
    }
    
    // Chow can only be claimed from the player to the left
    const currentPlayerIndex = this.players.indexOf(this.gameState.getCurrentPlayer());
    const playerIndex = this.players.indexOf(player);
    
    if ((currentPlayerIndex + 1) % this.players.length !== playerIndex) {
      return false;
    }
    
    // Check if the player has the necessary tiles to form a chow
    const value = discardedTile.value as number;
    const type = discardedTile.type;
    
    // Check for lower position (discarded tile is the highest)
    if (value >= 3) {
      const hasLower1 = player.hand.some(tile => 
        tile.type === type && tile.value === value - 1
      );
      const hasLower2 = player.hand.some(tile => 
        tile.type === type && tile.value === value - 2
      );
      
      if (hasLower1 && hasLower2) {
        return true;
      }
    }
    
    // Check for middle position (discarded tile is in the middle)
    if (value >= 2 && value <= 8) {
      const hasLower = player.hand.some(tile => 
        tile.type === type && tile.value === value - 1
      );
      const hasHigher = player.hand.some(tile => 
        tile.type === type && tile.value === value + 1
      );
      
      if (hasLower && hasHigher) {
        return true;
      }
    }
    
    // Check for upper position (discarded tile is the lowest)
    if (value <= 7) {
      const hasHigher1 = player.hand.some(tile => 
        tile.type === type && tile.value === value + 1
      );
      const hasHigher2 = player.hand.some(tile => 
        tile.type === type && tile.value === value + 2
      );
      
      if (hasHigher1 && hasHigher2) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Adds an event listener.
   * 
   * @param event The event to listen for
   * @param callback The callback function
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(callback);
  }
  
  /**
   * Removes an event listener.
   * 
   * @param event The event to remove the listener from
   * @param callback The callback function to remove
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Emits an event.
   * 
   * @param event The event to emit
   * @param data The data to pass to the listeners
   */
  private emitEvent(event: string, data: any): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event)!;
    
    for (const listener of listeners) {
      listener(data);
    }
  }
  
  /**
   * Gets the current game state.
   * 
   * @returns The current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }
  
  /**
   * Checks if a game is in progress.
   * 
   * @returns True if a game is in progress, false otherwise
   */
  isGameInProgress(): boolean {
    return this.gameInProgress;
  }
}
