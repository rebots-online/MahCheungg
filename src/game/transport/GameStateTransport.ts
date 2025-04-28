import { GameAction } from '../interfaces/GameAction';
import { VectorClock } from '../utils/VectorClock';

/**
 * Handles the transport of game state between players
 * Uses Jami's multicast messaging for communication
 */
export class GameStateTransport {
  private playerId: string;
  private playerIds: string[] = [];
  private vectorClock: VectorClock;
  private messageHandlers: Map<string, ((action: GameAction) => void)[]> = new Map();
  
  /**
   * Creates a new GameStateTransport instance
   * @param playerId ID of the local player
   * @param playerIds Array of all player IDs in the game
   */
  constructor(playerId: string, playerIds: string[]) {
    this.playerId = playerId;
    this.playerIds = playerIds;
    this.vectorClock = new VectorClock(playerIds);
  }
  
  /**
   * Sends a game action to all players
   * @param action The game action to send
   */
  public sendGameAction(action: GameAction): void {
    // Increment vector clock for the local player
    this.vectorClock.increment(this.playerId);
    
    // Add vector clock to the action
    const actionWithClock = {
      ...action,
      vectorClock: this.vectorClock.clone()
    };
    
    // TODO: Implement actual sending via Jami
    console.log(`Sending game action: ${JSON.stringify(actionWithClock)}`);
    
    // For now, simulate local processing
    this.processGameAction(actionWithClock);
  }
  
  /**
   * Processes a received game action
   * @param action The game action to process
   */
  public processGameAction(action: GameAction): void {
    // Update vector clock if the action has one
    if (action.vectorClock) {
      this.vectorClock.merge(action.vectorClock);
    }
    
    // Notify handlers for this action type
    const handlers = this.messageHandlers.get(action.action) || [];
    handlers.forEach(handler => handler(action));
    
    // Notify handlers for all actions
    const allHandlers = this.messageHandlers.get('*') || [];
    allHandlers.forEach(handler => handler(action));
  }
  
  /**
   * Registers a handler for a specific action type
   * @param actionType The type of action to handle, or '*' for all actions
   * @param handler The handler function to call when an action is received
   */
  public onGameAction(actionType: string, handler: (action: GameAction) => void): void {
    const handlers = this.messageHandlers.get(actionType) || [];
    handlers.push(handler);
    this.messageHandlers.set(actionType, handlers);
  }
  
  /**
   * Removes a handler for a specific action type
   * @param actionType The type of action to remove the handler for
   * @param handler The handler function to remove
   */
  public offGameAction(actionType: string, handler: (action: GameAction) => void): void {
    const handlers = this.messageHandlers.get(actionType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.messageHandlers.set(actionType, handlers);
    }
  }
}
