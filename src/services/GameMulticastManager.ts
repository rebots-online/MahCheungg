import MulticastService, { 
  ConnectionState, 
  MessageType, 
  MulticastEventType,
  Session
} from './MulticastService';
import { GameState, GameStatus } from '@/game/gameState';
import { PlayerSide } from '@/game/pieces';

// Game action types
export enum GameActionType {
  MOVE = 'move',
  UNDO = 'undo',
  CHAT = 'chat',
  RESIGN = 'resign',
  DRAW_OFFER = 'draw_offer',
  DRAW_ACCEPT = 'draw_accept',
  DRAW_DECLINE = 'draw_decline',
  REMATCH_OFFER = 'rematch_offer',
  REMATCH_ACCEPT = 'rematch_accept',
  REMATCH_DECLINE = 'rematch_decline'
}

// Game action interface
export interface GameAction {
  type: GameActionType;
  playerId: string;
  payload: any;
  timestamp: number;
}

// Game session information
export interface GameSession {
  sessionId: string;
  sessionCode: string;
  hostId: string;
  players: {
    id: string;
    name: string;
    side: PlayerSide;
    isConnected: boolean;
  }[];
  isHost: boolean;
  connectionState: ConnectionState;
}

// Event types for the game multicast manager
export enum GameMulticastEventType {
  SESSION_CREATED = 'session_created',
  SESSION_JOINED = 'session_joined',
  SESSION_LEFT = 'session_left',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STATE_UPDATED = 'game_state_updated',
  GAME_ACTION_RECEIVED = 'game_action_received',
  CHAT_MESSAGE_RECEIVED = 'chat_message_received',
  CONNECTION_STATE_CHANGED = 'connection_state_changed',
  ERROR = 'error'
}

// Configuration options
export interface GameMulticastConfig {
  playerName?: string;
  debug?: boolean;
}

// Event listener type
type EventListener = (data: any) => void;

/**
 * GameMulticastManager - Integrates the MulticastService with the game state
 * 
 * This class provides a higher-level API for multiplayer game functionality,
 * handling game state synchronization, player management, and game actions.
 */
class GameMulticastManager {
  private static instance: GameMulticastManager;
  private multicastService: MulticastService;
  private eventListeners: Map<string, EventListener[]> = new Map();
  private gameState: GameState | null = null;
  private playerName: string;
  private playerSide: PlayerSide | null = null;
  private initialized: boolean = false;
  private debug: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.multicastService = MulticastService.getInstance();
    this.playerName = `Player_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Get the singleton instance of the GameMulticastManager
   * @returns The GameMulticastManager instance
   */
  public static getInstance(): GameMulticastManager {
    if (!GameMulticastManager.instance) {
      GameMulticastManager.instance = new GameMulticastManager();
    }
    return GameMulticastManager.instance;
  }

  /**
   * Initialize the game multicast manager
   * @param config Configuration options
   */
  public async initialize(config: GameMulticastConfig = {}): Promise<void> {
    if (this.initialized) {
      this.log('GameMulticastManager already initialized');
      return;
    }

    this.log('Initializing GameMulticastManager');
    
    // Set player name if provided
    if (config.playerName) {
      this.playerName = config.playerName;
    }
    
    // Set debug mode
    this.debug = config.debug || false;
    
    // Initialize the multicast service
    await this.multicastService.initialize({
      peerName: this.playerName,
      debug: this.debug
    });
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.initialized = true;
  }

  /**
   * Create a new game session
   * @param initialGameState The initial game state
   * @param playerSide The side the host will play as
   * @returns The created game session
   */
  public createGameSession(initialGameState: GameState, playerSide: PlayerSide): GameSession {
    if (!this.initialized) {
      throw new Error('GameMulticastManager not initialized');
    }

    this.log('Creating game session', { playerSide });
    
    // Create a session in the multicast service
    const session = this.multicastService.createSession(`Game_${Date.now()}`);
    
    // Set the game state
    this.gameState = initialGameState;
    
    // Set the player side
    this.playerSide = playerSide;
    
    // Create and return the game session
    const gameSession: GameSession = {
      sessionId: session.id,
      sessionCode: this.multicastService.getSessionCode(),
      hostId: this.multicastService.getPeerId(),
      players: [
        {
          id: this.multicastService.getPeerId(),
          name: this.playerName,
          side: playerSide,
          isConnected: true
        }
      ],
      isHost: true,
      connectionState: ConnectionState.CONNECTED
    };
    
    // Emit session created event
    this.emit(GameMulticastEventType.SESSION_CREATED, { gameSession });
    
    return gameSession;
  }

  /**
   * Join an existing game session
   * @param sessionCode The session code to join
   * @returns Promise that resolves when joined
   */
  public async joinGameSession(sessionCode: string): Promise<GameSession> {
    if (!this.initialized) {
      throw new Error('GameMulticastManager not initialized');
    }

    this.log('Joining game session', { sessionCode });
    
    // TODO: Implement session code to connection info conversion
    // This is a placeholder for the actual implementation
    const hostConnectionInfo = { sessionCode };
    
    // Join the session in the multicast service
    // For now, we'll use the session code as the session ID
    // In a real implementation, this would be converted to the actual session ID
    await this.multicastService.joinSession(sessionCode, hostConnectionInfo);
    
    // The game state and player side will be set when we receive the initial state from the host
    
    // Create a temporary game session
    const gameSession: GameSession = {
      sessionId: sessionCode,
      sessionCode: sessionCode,
      hostId: 'unknown', // Will be updated when we receive session info
      players: [
        {
          id: this.multicastService.getPeerId(),
          name: this.playerName,
          side: PlayerSide.BLACK, // Placeholder, will be updated
          isConnected: true
        }
      ],
      isHost: false,
      connectionState: ConnectionState.CONNECTING
    };
    
    // Emit session joined event
    this.emit(GameMulticastEventType.SESSION_JOINED, { gameSession });
    
    return gameSession;
  }

  /**
   * Leave the current game session
   */
  public leaveGameSession(): void {
    if (!this.initialized || !this.multicastService.getSession()) {
      return;
    }

    this.log('Leaving game session');
    
    // Leave the session in the multicast service
    this.multicastService.leaveSession();
    
    // Reset state
    this.gameState = null;
    this.playerSide = null;
    
    // Emit session left event
    this.emit(GameMulticastEventType.SESSION_LEFT, {});
  }

  /**
   * Send a game action to all players
   * @param actionType The type of action
   * @param payload The action payload
   */
  public sendGameAction(actionType: GameActionType, payload: any): void {
    if (!this.initialized || !this.multicastService.getSession()) {
      throw new Error('Not in a game session');
    }

    this.log('Sending game action', { actionType, payload });
    
    const action: GameAction = {
      type: actionType,
      playerId: this.multicastService.getPeerId(),
      payload,
      timestamp: Date.now()
    };
    
    // Send the action via the multicast service
    this.multicastService.sendGameAction(action);
  }

  /**
   * Send a move action
   * @param fromRow From row
   * @param fromCol From column
   * @param toRow To row
   * @param toCol To column
   */
  public sendMove(fromRow: number, fromCol: number, toRow: number, toCol: number): void {
    this.sendGameAction(GameActionType.MOVE, {
      fromRow,
      fromCol,
      toRow,
      toCol
    });
  }

  /**
   * Send an undo request
   */
  public sendUndoRequest(): void {
    this.sendGameAction(GameActionType.UNDO, {});
  }

  /**
   * Send a chat message
   * @param message The chat message
   */
  public sendChatMessage(message: string): void {
    if (!this.initialized || !this.multicastService.getSession()) {
      throw new Error('Not in a game session');
    }

    this.log('Sending chat message', { message });
    
    // Send the chat message via the multicast service
    this.multicastService.sendChatMessage(message);
  }

  /**
   * Send the current game state to all players
   * @param gameState The current game state
   */
  public sendGameState(gameState: GameState): void {
    if (!this.initialized || !this.multicastService.getSession()) {
      throw new Error('Not in a game session');
    }

    this.log('Sending game state');
    
    // Update local game state
    this.gameState = gameState;
    
    // Send the game state via the multicast service
    this.multicastService.sendGameState(gameState);
  }

  /**
   * Get the current game session
   * @returns The current game session or null if not in a session
   */
  public getGameSession(): GameSession | null {
    if (!this.initialized || !this.multicastService.getSession()) {
      return null;
    }
    
    const session = this.multicastService.getSession()!;
    
    // Convert multicast session to game session
    return {
      sessionId: session.id,
      sessionCode: this.multicastService.getSessionCode(),
      hostId: session.hostId,
      players: session.peers.map(peer => {
        // Find player side based on peer ID
        // This is a placeholder - in a real implementation, we would track this information
        const side = peer.id === session.hostId ? 
          (this.playerSide === PlayerSide.RED ? PlayerSide.RED : PlayerSide.BLACK) : 
          (this.playerSide === PlayerSide.RED ? PlayerSide.BLACK : PlayerSide.RED);
        
        return {
          id: peer.id,
          name: peer.name || `Player_${peer.id.substring(0, 6)}`,
          side,
          isConnected: peer.connectionState === ConnectionState.CONNECTED
        };
      }),
      isHost: this.multicastService.isHost(),
      connectionState: this.multicastService.getConnectionState()
    };
  }

  /**
   * Get the player's side in the current game
   * @returns The player's side or null if not in a game
   */
  public getPlayerSide(): PlayerSide | null {
    return this.playerSide;
  }

  /**
   * Set the player's name
   * @param name The new player name
   */
  public setPlayerName(name: string): void {
    this.playerName = name;
    
    if (this.initialized) {
      this.multicastService.setPeerName(name);
    }
  }

  /**
   * Get the player's name
   * @returns The player's name
   */
  public getPlayerName(): string {
    return this.playerName;
  }

  /**
   * Add an event listener
   * @param event The event type
   * @param listener The event listener function
   */
  public on(event: GameMulticastEventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove an event listener
   * @param event The event type
   * @param listener The event listener function to remove
   */
  public off(event: GameMulticastEventType, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get debug information
   * @returns Debug information
   */
  public getDebugInfo(): any {
    return {
      initialized: this.initialized,
      playerName: this.playerName,
      playerSide: this.playerSide,
      multicastService: this.multicastService.getDebugInfo(),
      gameState: this.gameState ? {
        gameStatus: this.gameState.gameStatus,
        currentTurn: this.gameState.currentTurn,
        moveHistoryLength: this.gameState.moveHistory.length
      } : null
    };
  }

  // Private methods

  /**
   * Set up event listeners for the multicast service
   */
  private setupEventListeners(): void {
    // Listen for state updates
    this.multicastService.on(MulticastEventType.STATE_UPDATED, (data) => {
      this.handleStateUpdate(data);
    });
    
    // Listen for messages
    this.multicastService.on(MulticastEventType.MESSAGE_RECEIVED, (data) => {
      this.handleMessageReceived(data);
    });
    
    // Listen for peer connections
    this.multicastService.on(MulticastEventType.PEER_CONNECTED, (data) => {
      this.handlePeerConnected(data);
    });
    
    // Listen for peer disconnections
    this.multicastService.on(MulticastEventType.PEER_DISCONNECTED, (data) => {
      this.handlePeerDisconnected(data);
    });
    
    // Listen for connection state changes
    this.multicastService.on(MulticastEventType.CONNECTION_LOST, (data) => {
      this.handleConnectionLost(data);
    });
    
    this.multicastService.on(MulticastEventType.CONNECTION_RESTORED, (data) => {
      this.handleConnectionRestored(data);
    });
    
    // Listen for errors
    this.multicastService.on(MulticastEventType.ERROR, (data) => {
      this.handleError(data);
    });
  }

  /**
   * Handle a state update from the multicast service
   * @param data The state update data
   */
  private handleStateUpdate(data: any): void {
    this.log('Handling state update', data);
    
    // Update the game state
    this.gameState = data.state;
    
    // Emit game state updated event
    this.emit(GameMulticastEventType.GAME_STATE_UPDATED, { gameState: this.gameState });
  }

  /**
   * Handle a message received from the multicast service
   * @param data The message data
   */
  private handleMessageReceived(data: any): void {
    this.log('Handling message received', data);
    
    const { message } = data;
    
    switch (message.type) {
      case MessageType.ACTION:
        this.handleGameAction(message.payload, message.senderId);
        break;
      case MessageType.CHAT:
        this.handleChatMessage(message.payload, message.senderId);
        break;
      case MessageType.STATE_UPDATE:
        this.handleGameStateUpdate(message.payload);
        break;
    }
  }

  /**
   * Handle a game action from another player
   * @param action The game action
   * @param senderId The sender ID
   */
  private handleGameAction(action: GameAction, senderId: string): void {
    this.log('Handling game action', { action, senderId });
    
    // Emit game action received event
    this.emit(GameMulticastEventType.GAME_ACTION_RECEIVED, { action, senderId });
  }

  /**
   * Handle a chat message from another player
   * @param chatMessage The chat message
   * @param senderId The sender ID
   */
  private handleChatMessage(chatMessage: any, senderId: string): void {
    this.log('Handling chat message', { chatMessage, senderId });
    
    // Emit chat message received event
    this.emit(GameMulticastEventType.CHAT_MESSAGE_RECEIVED, { 
      message: chatMessage.text, 
      senderId,
      timestamp: Date.now()
    });
  }

  /**
   * Handle a game state update from another player
   * @param gameState The game state
   */
  private handleGameStateUpdate(gameState: GameState): void {
    this.log('Handling game state update');
    
    // Update the game state
    this.gameState = gameState;
    
    // Emit game state updated event
    this.emit(GameMulticastEventType.GAME_STATE_UPDATED, { gameState });
  }

  /**
   * Handle a peer connection
   * @param data The peer connection data
   */
  private handlePeerConnected(data: any): void {
    this.log('Handling peer connected', data);
    
    const { peerId, peerName } = data;
    
    // Emit player joined event
    this.emit(GameMulticastEventType.PLAYER_JOINED, { 
      playerId: peerId, 
      playerName: peerName 
    });
    
    // If we're the host, send the current game state to the new player
    if (this.multicastService.isHost() && this.gameState) {
      this.sendGameState(this.gameState);
    }
  }

  /**
   * Handle a peer disconnection
   * @param data The peer disconnection data
   */
  private handlePeerDisconnected(data: any): void {
    this.log('Handling peer disconnected', data);
    
    const { peerId } = data;
    
    // Emit player left event
    this.emit(GameMulticastEventType.PLAYER_LEFT, { playerId: peerId });
  }

  /**
   * Handle a connection loss
   * @param data The connection loss data
   */
  private handleConnectionLost(data: any): void {
    this.log('Handling connection lost', data);
    
    // Emit connection state changed event
    this.emit(GameMulticastEventType.CONNECTION_STATE_CHANGED, { 
      connectionState: ConnectionState.DISCONNECTED 
    });
  }

  /**
   * Handle a connection restoration
   * @param data The connection restoration data
   */
  private handleConnectionRestored(data: any): void {
    this.log('Handling connection restored', data);
    
    // Emit connection state changed event
    this.emit(GameMulticastEventType.CONNECTION_STATE_CHANGED, { 
      connectionState: ConnectionState.CONNECTED 
    });
  }

  /**
   * Handle an error from the multicast service
   * @param data The error data
   */
  private handleError(data: any): void {
    this.log('Handling error', data);
    
    // Emit error event
    this.emit(GameMulticastEventType.ERROR, data);
  }

  /**
   * Emit an event to all registered listeners
   * @param event The event type
   * @param data The event data
   */
  private emit(event: GameMulticastEventType, data: any): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event)!;
    
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in event listener', error);
      }
    }
  }

  /**
   * Log a message if debug is enabled
   * @param message The message to log
   * @param data Additional data to log
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[GameMulticastManager] ${message}`, data);
    }
  }
}

export default GameMulticastManager;
