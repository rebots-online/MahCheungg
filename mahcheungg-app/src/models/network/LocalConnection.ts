import { GameAction, GameActionParams, PlayerConnection } from '../player/Player';

/**
 * Implementation of the PlayerConnection interface for local play.
 * This connection is used when all players are on the same device.
 */
export class LocalConnection implements PlayerConnection {
  private connected: boolean = false;
  private id: string;
  private messageCallbacks: ((message: string, senderId: string) => void)[] = [];
  private gameActionCallbacks: ((action: GameAction, params: GameActionParams) => void)[] = [];
  private gameManager: any; // This would be a proper GameManager type in a full implementation
  
  /**
   * Creates a new LocalConnection instance.
   * 
   * @param id The unique identifier for this connection
   * @param gameManager The game manager
   */
  constructor(id: string, gameManager: any) {
    this.id = id;
    this.gameManager = gameManager;
  }
  
  /**
   * Connects to the game.
   * 
   * @returns A promise that resolves to true if the connection was successful, false otherwise
   */
  async connect(): Promise<boolean> {
    this.connected = true;
    return true;
  }
  
  /**
   * Disconnects from the game.
   */
  disconnect(): void {
    this.connected = false;
  }
  
  /**
   * Checks if the connection is active.
   * 
   * @returns True if the connection is active, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Sends a message to other players.
   * 
   * @param message The message to send
   */
  sendMessage(message: string): void {
    if (!this.connected) {
      throw new Error('Cannot send message: not connected');
    }
    
    // In a local connection, we just forward the message to the game manager
    // The game manager will then distribute it to other players
    this.gameManager.broadcastMessage(message, this.id);
  }
  
  /**
   * Registers a callback for when a message is received.
   * 
   * @param callback The callback function
   */
  onMessageReceived(callback: (message: string, senderId: string) => void): void {
    this.messageCallbacks.push(callback);
  }
  
  /**
   * Sends a game action to the game manager.
   * 
   * @param action The action to send
   * @param params The parameters for the action
   */
  sendGameAction(action: GameAction, params: GameActionParams): void {
    if (!this.connected) {
      throw new Error('Cannot send game action: not connected');
    }
    
    // In a local connection, we just forward the action to the game manager
    this.gameManager.handleGameAction(action, params, this.id);
  }
  
  /**
   * Registers a callback for when a game action is received.
   * 
   * @param callback The callback function
   */
  onGameActionReceived(callback: (action: GameAction, params: GameActionParams) => void): void {
    this.gameActionCallbacks.push(callback);
  }
  
  /**
   * Handles a received message.
   * 
   * @param message The message received
   * @param senderId The ID of the sender
   */
  handleMessage(message: string, senderId: string): void {
    for (const callback of this.messageCallbacks) {
      callback(message, senderId);
    }
  }
  
  /**
   * Handles a received game action.
   * 
   * @param action The action received
   * @param params The parameters for the action
   */
  handleGameAction(action: GameAction, params: GameActionParams): void {
    for (const callback of this.gameActionCallbacks) {
      callback(action, params);
    }
  }
}
