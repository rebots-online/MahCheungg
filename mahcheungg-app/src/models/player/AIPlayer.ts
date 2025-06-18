import { Tile } from '../game/Tile';
import { ChowPosition, TileSet, TileSetFactory } from '../game/TileSet';
import {
  GameAction,
  GameDecision,
  Player,
  PlayerConnection
} from './Player';

/**
 * Represents the difficulty level of an AI player.
 */
export enum AIDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

/**
 * Represents the personality traits of an AI player.
 */
export enum AIPersonality {
  AGGRESSIVE = 'AGGRESSIVE', // Prefers offensive play, more likely to go for high-risk, high-reward hands
  DEFENSIVE = 'DEFENSIVE',   // Prefers defensive play, more likely to discard safe tiles
  BALANCED = 'BALANCED',     // Balanced approach between offense and defense
  RISKY = 'RISKY'            // Takes more risks, more likely to go for big hands
}

/**
 * Implementation of the Player interface for AI-controlled players.
 */
export class AIPlayer implements Player {
  id: string;
  name: string;
  isAI: boolean = true;

  hand: Tile[] = [];
  discardedTiles: Tile[] = [];
  exposedSets: TileSet[] = [];

  difficulty: AIDifficulty;
  personality: AIPersonality;

  private gameState: any; // This would be a proper GameState type in a full implementation
  private connected: boolean = false;
  private connection: PlayerConnection | null = null;

  /**
   * Creates a new AIPlayer instance.
   *
   * @param id The unique identifier for this player
   * @param name The display name for this player
   * @param difficulty The difficulty level of this AI player
   * @param personality The personality traits of this AI player
   * @param connection Optional connection for networked play
   */
  constructor(
    id: string,
    name: string,
    difficulty: AIDifficulty = AIDifficulty.MEDIUM,
    personality: AIPersonality = AIPersonality.BALANCED,
    connection: PlayerConnection | null = null
  ) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.personality = personality;
    this.connection = connection;
  }

  /**
   * Adds a tile to the player's hand.
   *
   * @param tile The tile to add to the hand
   */
  drawTile(tile: Tile): void {
    this.hand.push(tile);
    // AI might analyze hand after drawing
    this.analyzeHand();
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
   * Gets the AI's decision on which tile to discard.
   *
   * @returns A promise that resolves to the tile to discard
   */
  async getDiscardDecision(): Promise<Tile> {
    // Add a realistic delay based on difficulty
    await this.simulateThinking();

    // Choose a tile to discard based on difficulty
    if (this.difficulty === AIDifficulty.EASY) {
      return this.simpleDiscardStrategy();
    } else if (this.difficulty === AIDifficulty.MEDIUM) {
      return this.intermediateDiscardStrategy();
    } else {
      return this.advancedDiscardStrategy();
    }
  }

  /**
   * Gets the AI's decision on which action to take in response to a discarded tile.
   *
   * @param availableActions The actions available to the player
   * @param discardedTile The tile that was discarded
   * @returns A promise that resolves to the player's decision, or null if no action is taken
   */
  async getActionDecision(
    availableActions: GameAction[],
    discardedTile: Tile
  ): Promise<GameDecision | null> {
    // Add a realistic delay based on difficulty
    await this.simulateThinking();

    // Choose an action based on difficulty and personality
    if (this.difficulty === AIDifficulty.EASY) {
      return this.simpleActionStrategy(availableActions, discardedTile);
    } else if (this.difficulty === AIDifficulty.MEDIUM) {
      return this.intermediateActionStrategy(availableActions, discardedTile);
    } else {
      return this.advancedActionStrategy(availableActions, discardedTile);
    }
  }

  /**
   * Sends a message to other players.
   *
   * @param message The message to send
   */
  sendMessage(message: string): void {
    if (this.connection) {
      this.connection.sendMessage(message);
    }
    console.log(`AI ${this.name} would send: ${message}`);
  }

  /**
   * Receives a message from another player.
   *
   * @param message The message received
   * @param sender The player who sent the message
   */
  receiveMessage(message: string, sender: Player): void {
    console.log(`AI ${this.name} received message from ${sender.name}: ${message}`);

    // Potentially respond based on message content and AI personality
    if (this.shouldRespond(message)) {
      const response = this.generateResponse(message, sender);
      setTimeout(() => {
        this.sendMessage(response);
      }, this.calculateResponseDelay());
    }
  }

  /**
   * Connects the player to the game.
   *
   * @returns A promise that resolves to true if the connection was successful, false otherwise
   */
  async connect(): Promise<boolean> {
    // AI players are always "connected" once initialized
    this.connected = true;

    // If there's a real connection, use it
    if (this.connection) {
      return this.connection.connect();
    }

    return true;
  }

  /**
   * Disconnects the player from the game.
   */
  disconnect(): void {
    this.connected = false;

    if (this.connection) {
      this.connection.disconnect();
    }
  }

  /**
   * Checks if the player is connected to the game.
   *
   * @returns True if the player is connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Updates the AI's knowledge of the game state.
   *
   * @param gameState The current game state
   */
  updateGameState(gameState: any): void {
    this.gameState = gameState;
  }

  /**
   * Analyzes the current hand to update internal state.
   */
  private analyzeHand(): void {
    // This would involve analyzing the hand for patterns, potential sets, etc.
    // For now, we'll just log the hand
    console.log(`AI ${this.name} analyzing hand:`, this.hand.map(t => t.unicode).join(' '));
  }

  /**
   * Simulates the AI thinking to add realistic delays.
   */
  private async simulateThinking(): Promise<void> {
    let delay = 0;

    // Adjust delay based on difficulty
    switch (this.difficulty) {
      case AIDifficulty.EASY:
        delay = 500 + Math.random() * 500; // 0.5-1s
        break;
      case AIDifficulty.MEDIUM:
        delay = 1000 + Math.random() * 1000; // 1-2s
        break;
      case AIDifficulty.HARD:
        delay = 1500 + Math.random() * 1500; // 1.5-3s
        break;
      case AIDifficulty.EXPERT:
        delay = 2000 + Math.random() * 2000; // 2-4s
        break;
    }

    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simple strategy for choosing a tile to discard.
   * Used by EASY difficulty AI.
   *
   * @returns The tile to discard
   */
  private simpleDiscardStrategy(): Tile {
    // Simple strategy: just discard a random tile
    const index = Math.floor(Math.random() * this.hand.length);
    return this.hand[index];
  }

  /**
   * Intermediate strategy for choosing a tile to discard.
   * Used by MEDIUM difficulty AI.
   *
   * @returns The tile to discard
   */
  private intermediateDiscardStrategy(): Tile {
    // Intermediate strategy: try to keep pairs and potential sets

    // Count occurrences of each tile type
    const tileCounts = new Map<string, number>();
    for (const tile of this.hand) {
      const key = `${tile.type}_${tile.value}`;
      tileCounts.set(key, (tileCounts.get(key) || 0) + 1);
    }

    // Find tiles that don't form pairs
    const singleTiles = this.hand.filter(tile => {
      const key = `${tile.type}_${tile.value}`;
      return tileCounts.get(key) === 1;
    });

    if (singleTiles.length > 0) {
      // Discard a random single tile
      const index = Math.floor(Math.random() * singleTiles.length);
      return singleTiles[index];
    }

    // If all tiles form pairs or sets, discard a random tile
    return this.simpleDiscardStrategy();
  }

  /**
   * Advanced strategy for choosing a tile to discard.
   * Used by HARD and EXPERT difficulty AI.
   *
   * @returns The tile to discard
   */
  private advancedDiscardStrategy(): Tile {
    // Advanced strategy would involve evaluating the hand for potential winning patterns,
    // considering the discarded tiles, and making a strategic decision

    // For now, we'll use a slightly enhanced version of the intermediate strategy

    // If the personality is DEFENSIVE, prioritize safe discards
    if (this.personality === AIPersonality.DEFENSIVE) {
      // Find tiles that are less likely to help opponents
      // This would involve checking the discard pile and exposed sets
      // For now, just use the intermediate strategy
      return this.intermediateDiscardStrategy();
    }

    // If the personality is AGGRESSIVE or RISKY, prioritize building a high-value hand
    if (this.personality === AIPersonality.AGGRESSIVE || this.personality === AIPersonality.RISKY) {
      // This would involve evaluating potential high-value patterns
      // For now, just use the intermediate strategy
      return this.intermediateDiscardStrategy();
    }

    // Default to intermediate strategy for BALANCED personality
    return this.intermediateDiscardStrategy();
  }

  /**
   * Simple strategy for choosing an action in response to a discarded tile.
   * Used by EASY difficulty AI.
   *
   * @param availableActions The actions available to the player
   * @param discardedTile The tile that was discarded
   * @returns The player's decision, or null if no action is taken
   */
  private simpleActionStrategy(
    availableActions: GameAction[],
    discardedTile: Tile
  ): GameDecision | null {
    // Simple strategy: randomly decide whether to take an action
    if (availableActions.length === 0) {
      return null;
    }

    // 50% chance to take an action
    if (Math.random() < 0.5) {
      return null;
    }

    // Choose a random action
    const actionIndex = Math.floor(Math.random() * availableActions.length);
    const action = availableActions[actionIndex];

    // For now, we'll just return a basic decision without proper params
    // In a full implementation, we would need to determine the appropriate params
    return {
      action,
      params: null
    };
  }

  /**
   * Intermediate strategy for choosing an action in response to a discarded tile.
   * Used by MEDIUM difficulty AI.
   *
   * @param availableActions The actions available to the player
   * @param discardedTile The tile that was discarded
   * @returns The player's decision, or null if no action is taken
   */
  private intermediateActionStrategy(
    availableActions: GameAction[],
    discardedTile: Tile
  ): GameDecision | null {
    // Intermediate strategy: prioritize certain actions
    if (availableActions.length === 0) {
      return null;
    }

    // Prioritize Mahjong > Kong > Pung > Chow
    if (availableActions.includes(GameAction.MAHJONG)) {
      return {
        action: GameAction.MAHJONG,
        params: null
      };
    }

    if (availableActions.includes(GameAction.KONG)) {
      // In a full implementation, we would need to determine the appropriate params
      return {
        action: GameAction.KONG,
        params: null
      };
    }

    if (availableActions.includes(GameAction.PUNG)) {
      // In a full implementation, we would need to determine the appropriate params
      return {
        action: GameAction.PUNG,
        params: null
      };
    }

    if (availableActions.includes(GameAction.CHOW)) {
      // In a full implementation, we would need to determine the appropriate params
      return {
        action: GameAction.CHOW,
        params: null
      };
    }

    return null;
  }

  /**
   * Advanced strategy for choosing an action in response to a discarded tile.
   * Used by HARD and EXPERT difficulty AI.
   *
   * @param availableActions The actions available to the player
   * @param discardedTile The tile that was discarded
   * @returns The player's decision, or null if no action is taken
   */
  private advancedActionStrategy(
    availableActions: GameAction[],
    discardedTile: Tile
  ): GameDecision | null {
    // Advanced strategy would involve evaluating the potential benefit of each action,
    // considering the current hand, the game state, and the AI's personality

    // For now, we'll use a slightly enhanced version of the intermediate strategy

    // If the personality is DEFENSIVE, be more conservative with actions
    if (this.personality === AIPersonality.DEFENSIVE) {
      // Only take actions that are clearly beneficial
      if (availableActions.includes(GameAction.MAHJONG)) {
        return {
          action: GameAction.MAHJONG,
          params: null
        };
      }

      // For other actions, be more selective
      // For now, just use the intermediate strategy
      return this.intermediateActionStrategy(availableActions, discardedTile);
    }

    // If the personality is AGGRESSIVE or RISKY, be more aggressive with actions
    if (this.personality === AIPersonality.AGGRESSIVE || this.personality === AIPersonality.RISKY) {
      // More likely to take actions
      // For now, just use the intermediate strategy
      return this.intermediateActionStrategy(availableActions, discardedTile);
    }

    // Default to intermediate strategy for BALANCED personality
    return this.intermediateActionStrategy(availableActions, discardedTile);
  }

  /**
   * Determines if the AI should respond to a message.
   *
   * @param message The message received
   * @returns True if the AI should respond, false otherwise
   */
  private shouldRespond(message: string): boolean {
    // Simple implementation: respond to messages that contain the AI's name
    // or are direct questions
    return message.includes(this.name) || message.includes('?');
  }

  /**
   * Generates a response to a message.
   *
   * @param message The message received
   * @param sender The player who sent the message
   * @returns The response message
   */
  private generateResponse(message: string, sender: Player): string {
    // Simple implementation: generate a basic response based on personality
    switch (this.personality) {
      case AIPersonality.AGGRESSIVE:
        return `I'm going to win this game, ${sender.name}!`;
      case AIPersonality.DEFENSIVE:
        return `Let's play carefully, ${sender.name}.`;
      case AIPersonality.RISKY:
        return `Taking risks is part of the game, ${sender.name}!`;
      case AIPersonality.BALANCED:
      default:
        return `Good luck, ${sender.name}!`;
    }
  }

  /**
   * Calculates a realistic delay before responding to a message.
   *
   * @returns The delay in milliseconds
   */
  private calculateResponseDelay(): number {
    // Calculate a realistic delay based on message length and typing speed
    // For now, just use a simple random delay
    return 1000 + Math.random() * 2000; // 1-3 seconds
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
