# Player Interface Design

This document details the design of the player interface system for MahCheungg, which allows both human and AI players to interact with the game using the same interfaces.

## Core Interface

The `Player` interface is the foundation of the system, defining all interactions that any player (human or AI) can have with the game:

```typescript
interface Player {
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
```

## Human Player Implementation

The `HumanPlayer` class implements the `Player` interface for human players:

```typescript
class HumanPlayer implements Player {
  id: string;
  name: string;
  isAI: boolean = false;
  
  hand: Tile[] = [];
  discardedTiles: Tile[] = [];
  exposedSets: TileSet[] = [];
  
  private connection: PlayerConnection;
  private uiCallbacks: UICallbacks;
  
  constructor(id: string, name: string, connection: PlayerConnection, uiCallbacks: UICallbacks) {
    this.id = id;
    this.name = name;
    this.connection = connection;
    this.uiCallbacks = uiCallbacks;
  }
  
  // Game state methods
  drawTile(tile: Tile): void {
    this.hand.push(tile);
    this.uiCallbacks.onHandUpdated(this.hand);
  }
  
  discardTile(tile: Tile): void {
    const index = this.hand.findIndex(t => t.equals(tile));
    if (index !== -1) {
      this.hand.splice(index, 1);
      this.discardedTiles.push(tile);
      this.uiCallbacks.onHandUpdated(this.hand);
      this.uiCallbacks.onDiscardPileUpdated(this.discardedTiles);
    }
  }
  
  // Action declarations
  declarePung(tile: Tile): boolean {
    // Implementation with UI interaction
  }
  
  declareKong(tile: Tile): boolean {
    // Implementation with UI interaction
  }
  
  declareChow(tile: Tile, position: ChowPosition): boolean {
    // Implementation with UI interaction
  }
  
  declareMahjong(): boolean {
    // Implementation with UI interaction
  }
  
  // Decision making - for human players, these prompt the UI
  async getDiscardDecision(): Promise<Tile> {
    return new Promise((resolve) => {
      this.uiCallbacks.requestDiscardDecision((tile) => {
        resolve(tile);
      });
    });
  }
  
  async getActionDecision(availableActions: GameAction[], discardedTile: Tile): Promise<GameAction | null> {
    return new Promise((resolve) => {
      this.uiCallbacks.requestActionDecision(availableActions, discardedTile, (action) => {
        resolve(action);
      });
    });
  }
  
  // Communication
  sendMessage(message: string): void {
    this.connection.sendMessage(message);
    this.uiCallbacks.onMessageSent(message);
  }
  
  receiveMessage(message: string, sender: Player): void {
    this.uiCallbacks.onMessageReceived(message, sender);
  }
  
  // Connection management
  async connect(): Promise<boolean> {
    return this.connection.connect();
  }
  
  disconnect(): void {
    this.connection.disconnect();
  }
  
  isConnected(): boolean {
    return this.connection.isConnected();
  }
}
```

## AI Player Implementation

The `AIPlayer` class implements the `Player` interface for AI-controlled players:

```typescript
enum AIDifficulty {
  EASY,
  MEDIUM,
  HARD,
  EXPERT
}

enum AIPersonality {
  AGGRESSIVE,
  DEFENSIVE,
  BALANCED,
  RISKY
}

class AIPlayer implements Player {
  id: string;
  name: string;
  isAI: boolean = true;
  
  hand: Tile[] = [];
  discardedTiles: Tile[] = [];
  exposedSets: TileSet[] = [];
  
  difficulty: AIDifficulty;
  personality: AIPersonality;
  
  private gameState: GameState;
  private connected: boolean = false;
  
  constructor(id: string, name: string, difficulty: AIDifficulty, personality: AIPersonality) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.personality = personality;
  }
  
  // Game state methods - similar to HumanPlayer but without UI callbacks
  drawTile(tile: Tile): void {
    this.hand.push(tile);
    // AI might analyze hand after drawing
    this.analyzeHand();
  }
  
  discardTile(tile: Tile): void {
    const index = this.hand.findIndex(t => t.equals(tile));
    if (index !== -1) {
      this.hand.splice(index, 1);
      this.discardedTiles.push(tile);
    }
  }
  
  // Action declarations - AI implements these with decision algorithms
  declarePung(tile: Tile): boolean {
    // AI implementation
  }
  
  declareKong(tile: Tile): boolean {
    // AI implementation
  }
  
  declareChow(tile: Tile, position: ChowPosition): boolean {
    // AI implementation
  }
  
  declareMahjong(): boolean {
    // AI implementation
  }
  
  // Decision making - AI implements these with algorithms
  async getDiscardDecision(): Promise<Tile> {
    // AI logic to choose a tile to discard
    // The complexity depends on the difficulty level
    
    if (this.difficulty === AIDifficulty.EASY) {
      return this.simpleDiscardStrategy();
    } else if (this.difficulty === AIDifficulty.MEDIUM) {
      return this.intermediateDiscardStrategy();
    } else {
      return this.advancedDiscardStrategy();
    }
  }
  
  async getActionDecision(availableActions: GameAction[], discardedTile: Tile): Promise<GameAction | null> {
    // AI logic to decide whether to perform an action
    // The decision depends on difficulty and personality
    
    if (this.difficulty === AIDifficulty.EASY) {
      return this.simpleActionStrategy(availableActions, discardedTile);
    } else if (this.difficulty === AIDifficulty.MEDIUM) {
      return this.intermediateActionStrategy(availableActions, discardedTile);
    } else {
      return this.advancedActionStrategy(availableActions, discardedTile);
    }
  }
  
  // Private AI strategy methods
  private simpleDiscardStrategy(): Tile {
    // Basic strategy: discard the tile that has the fewest matches
    // Implementation details...
  }
  
  private intermediateDiscardStrategy(): Tile {
    // More complex strategy considering sets and potential
    // Implementation details...
  }
  
  private advancedDiscardStrategy(): Tile {
    // Advanced strategy considering game state, other players' discards, etc.
    // Implementation details...
  }
  
  // Similar methods for action strategies
  
  // Communication - AI might use predefined messages or generated responses
  sendMessage(message: string): void {
    // AI doesn't actually send messages, but the game can send on its behalf
    console.log(`AI ${this.name} would send: ${message}`);
  }
  
  receiveMessage(message: string, sender: Player): void {
    // AI might "react" to messages based on personality
    console.log(`AI ${this.name} received message from ${sender.name}: ${message}`);
    
    // Potentially respond based on message content and AI personality
    if (this.shouldRespond(message)) {
      const response = this.generateResponse(message, sender);
      setTimeout(() => {
        this.sendMessage(response);
      }, this.calculateResponseDelay());
    }
  }
  
  // Connection management - simplified for AI
  async connect(): Promise<boolean> {
    // AI players are always "connected" once initialized
    this.connected = true;
    return true;
  }
  
  disconnect(): void {
    this.connected = false;
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  // AI-specific methods
  private analyzeHand(): void {
    // Analyze current hand and update internal state
  }
  
  private shouldRespond(message: string): boolean {
    // Determine if AI should respond to a message
  }
  
  private generateResponse(message: string, sender: Player): string {
    // Generate a response based on message, sender, and AI personality
  }
  
  private calculateResponseDelay(): number {
    // Calculate a realistic delay before responding
    // Makes AI feel more human-like
    return 1000 + Math.random() * 2000; // 1-3 seconds
  }
  
  // Method to update AI's knowledge of the game state
  updateGameState(gameState: GameState): void {
    this.gameState = gameState;
  }
}
```

## Connection Interfaces

To handle different connection types (local, LAN, online), we use a connection interface:

```typescript
interface PlayerConnection {
  connect(): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(message: string): void;
  onMessageReceived(callback: (message: string, senderId: string) => void): void;
  sendGameAction(action: GameAction): void;
  onGameActionReceived(callback: (action: GameAction) => void): void;
}

// Implementations for different connection types
class LocalConnection implements PlayerConnection {
  // Implementation for local play (same device)
}

class LANConnection implements PlayerConnection {
  // Implementation for LAN play using WebRTC or similar
}

class OnlineConnection implements PlayerConnection {
  // Implementation for online play via server
}
```

## UI Callback Interface

For human players, we need UI callbacks to interact with the game:

```typescript
interface UICallbacks {
  onHandUpdated(hand: Tile[]): void;
  onDiscardPileUpdated(discardPile: Tile[]): void;
  onExposedSetsUpdated(exposedSets: TileSet[]): void;
  requestDiscardDecision(callback: (tile: Tile) => void): void;
  requestActionDecision(
    availableActions: GameAction[],
    discardedTile: Tile,
    callback: (action: GameAction | null) => void
  ): void;
  onMessageSent(message: string): void;
  onMessageReceived(message: string, sender: Player): void;
}
```

## Integration with Game Logic

The game logic interacts with players through the `Player` interface without needing to know the specific implementation:

```typescript
class GameManager {
  private players: Player[] = [];
  private currentPlayerIndex: number = 0;
  
  // Add a player (human or AI)
  addPlayer(player: Player): void {
    this.players.push(player);
  }
  
  // Start a new game
  async startGame(): Promise<void> {
    // Initialize game
    // Deal tiles to players
    await this.runGameLoop();
  }
  
  // Main game loop
  private async runGameLoop(): Promise<void> {
    while (!this.isGameOver()) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      
      // Player draws a tile
      const tile = this.drawTileFromWall();
      currentPlayer.drawTile(tile);
      
      // Player decides which tile to discard
      const discardedTile = await currentPlayer.getDiscardDecision();
      currentPlayer.discardTile(discardedTile);
      
      // Check if other players want to claim the discarded tile
      await this.handleDiscardedTile(discardedTile, currentPlayer);
      
      // Move to next player
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    
    // Game over, calculate scores
    this.calculateScores();
  }
  
  // Handle a discarded tile (check for claims)
  private async handleDiscardedTile(tile: Tile, discardingPlayer: Player): Promise<void> {
    for (let i = 0; i < this.players.length; i++) {
      if (i === this.currentPlayerIndex) continue; // Skip current player
      
      const player = this.players[i];
      const availableActions = this.getAvailableActions(player, tile);
      
      if (availableActions.length > 0) {
        const action = await player.getActionDecision(availableActions, tile);
        if (action) {
          // Handle the action (pung, kong, chow, mahjong)
          this.executeAction(player, action, tile);
          break; // Only one player can claim a tile
        }
      }
    }
  }
  
  // Other game logic methods...
}
```

This design ensures that the game logic can work with any player implementation as long as it adheres to the `Player` interface, making the system flexible and extensible.
