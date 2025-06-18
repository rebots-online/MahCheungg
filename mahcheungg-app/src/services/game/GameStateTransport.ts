/**
 * GameStateTransport
 *
 * This service manages the transmission and reception of game state updates,
 * using Jami's group chat as a multicast mechanism.
 */

import JamiTransportController from '../jami/JamiTransportController';
import VectorClock from '../../utils/VectorClock';
import { GameAction } from '../../models/game/GameActions';
import MessageDisplayController from '../../components/chat/MessageDisplayController';

// Game action handler type
type GameActionHandler = (action: GameAction) => void;

// Chat message handler type
type ChatMessageHandler = (message: string, sender: string) => void;

/**
 * GameStateTransport class
 */
class GameStateTransport {
  private jamiTransport: JamiTransportController;
  private messageDisplay: MessageDisplayController;
  private gameSessionId: string;
  private vectorClock: VectorClock;
  private playerId: string;
  private gameActionHandlers: Set<GameActionHandler> = new Set();
  private chatMessageHandlers: Set<ChatMessageHandler> = new Set();
  private actionLog: GameAction[] = [];

  /**
   * Constructor
   * @param gameSessionId The ID of the game session (Jami group chat)
   * @param playerId The ID of the current player
   * @param messageDisplay The message display controller
   */
  constructor(gameSessionId: string, playerId: string, messageDisplay: MessageDisplayController) {
    this.jamiTransport = JamiTransportController.getInstance();
    this.gameSessionId = gameSessionId;
    this.playerId = playerId;
    this.messageDisplay = messageDisplay;
    this.vectorClock = new VectorClock([playerId]);

    // Subscribe to messages from the game session
    this.jamiTransport.subscribeToGroup(gameSessionId, this.handleMessage);
  }

  /**
   * Handle a message from Jami
   * @param message The message content
   * @param sender The sender ID
   */
  private handleMessage = (message: string, sender: string): void => {
    // Check if this is a chat message
    if (message.startsWith('[CHAT]')) {
      // Extract chat content
      const chatContent = message.substring(7).trim();

      // Display in UI
      this.messageDisplay.addMessage(chatContent, sender, false);

      // Notify chat message handlers
      this.notifyChatMessageHandlers(chatContent, sender);

      return;
    }

    // Try to parse as game state message
    try {
      const gameAction = JSON.parse(message) as GameAction;

      // Add sender to vector clock if not already present
      this.vectorClock.addPlayer(sender);

      // Display in UI (will be hidden unless debug mode is on)
      this.messageDisplay.addMessage(message, sender, true);

      // Process the action
      this.processGameAction(gameAction, sender);
    } catch (error) {
      console.error('Failed to parse game message:', error);

      // If parsing fails, treat as unmarked chat message
      this.messageDisplay.addMessage(message, sender, false);

      // Notify chat message handlers
      this.notifyChatMessageHandlers(message, sender);
    }
  };

  /**
   * Process a game action
   * @param action The game action
   * @param sender The sender ID
   */
  private processGameAction(action: GameAction, sender: string): void {
    // Deserialize vector clock from action
    const actionClock = VectorClock.deserialize(action.vectorClock);

    // Compare with local clock
    const comparison = this.vectorClock.compare(actionClock);

    if (comparison === 'before' || comparison === 'concurrent') {
      // This is a new or concurrent action

      // Merge clocks
      this.vectorClock.merge(actionClock);

      // Add to action log (with proper ordering)
      this.insertActionInLog(action);

      // Notify game action handlers
      this.notifyGameActionHandlers(action);
    }
    // If 'after', we already have this action or a newer one
  }

  /**
   * Insert an action in the log at the correct position
   * @param action The game action to insert
   */
  private insertActionInLog(action: GameAction): void {
    // Find the correct position based on vector clock
    const actionClock = VectorClock.deserialize(action.vectorClock);

    let insertIndex = this.actionLog.length;

    for (let i = 0; i < this.actionLog.length; i++) {
      const existingClock = VectorClock.deserialize(this.actionLog[i].vectorClock);
      const comparison = actionClock.compare(existingClock);

      if (comparison === 'before') {
        insertIndex = i;
        break;
      }
    }

    // Insert at the correct position
    this.actionLog.splice(insertIndex, 0, action);

    // Limit log size
    if (this.actionLog.length > 1000) {
      this.actionLog.shift();
    }
  }

  /**
   * Send a game action
   * @param action The game action to send
   */
  public sendGameAction(action: Partial<GameAction>): void {
    // Increment vector clock for this player
    this.vectorClock.increment(this.playerId);

    // Create complete action
    const completeAction: GameAction = {
      ...action as any,
      player: this.playerId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.serialize()
    };

    // Send action
    this.jamiTransport.sendGroupMessage(this.gameSessionId, JSON.stringify(completeAction));

    // Add to local action log
    this.actionLog.push(completeAction);

    // Display in UI (will be hidden unless debug mode is on)
    this.messageDisplay.addMessage(JSON.stringify(completeAction), this.playerId, true);

    // Notify game action handlers
    this.notifyGameActionHandlers(completeAction);
  }

  /**
   * Send a chat message
   * @param content The chat message content
   */
  public sendChatMessage(content: string): void {
    // Send message with [CHAT] prefix
    this.jamiTransport.sendGroupMessage(this.gameSessionId, `[CHAT] ${content}`);

    // Display in UI
    this.messageDisplay.addMessage(content, this.playerId, false);

    // Notify chat message handlers
    this.notifyChatMessageHandlers(content, this.playerId);
  }

  /**
   * Register a handler for game actions
   * @param handler The handler function
   */
  public onGameAction(handler: GameActionHandler): void {
    this.gameActionHandlers.add(handler);
  }

  /**
   * Unregister a handler for game actions
   * @param handler The handler function to remove
   */
  public offGameAction(handler: GameActionHandler): void {
    this.gameActionHandlers.delete(handler);
  }

  /**
   * Register a handler for chat messages
   * @param handler The handler function
   */
  public onChatMessage(handler: ChatMessageHandler): void {
    this.chatMessageHandlers.add(handler);
  }

  /**
   * Unregister a handler for chat messages
   * @param handler The handler function to remove
   */
  public offChatMessage(handler: ChatMessageHandler): void {
    this.chatMessageHandlers.delete(handler);
  }

  /**
   * Notify all game action handlers
   * @param action The game action
   */
  private notifyGameActionHandlers(action: GameAction): void {
    for (const handler of this.gameActionHandlers) {
      try {
        handler(action);
      } catch (error) {
        console.error('Error in game action handler:', error);
      }
    }
  }

  /**
   * Notify all chat message handlers
   * @param message The chat message
   * @param sender The sender ID
   */
  private notifyChatMessageHandlers(message: string, sender: string): void {
    for (const handler of this.chatMessageHandlers) {
      try {
        handler(message, sender);
      } catch (error) {
        console.error('Error in chat message handler:', error);
      }
    }
  }

  /**
   * Get the action log
   * @returns The action log
   */
  public getActionLog(): GameAction[] {
    return [...this.actionLog];
  }

  /**
   * Get the vector clock
   * @returns The vector clock
   */
  public getVectorClock(): VectorClock {
    return this.vectorClock.clone();
  }

  /**
   * Get the player ID
   * @returns The player ID
   */
  public getPlayerId(): string {
    return this.playerId;
  }

  /**
   * Get the game session ID
   * @returns The game session ID
   */
  public getGameSessionId(): string {
    return this.gameSessionId;
  }

  /**
   * Dispose of the transport
   */
  public dispose(): void {
    // Unsubscribe from messages
    this.jamiTransport.unsubscribeFromGroup(this.gameSessionId, this.handleMessage);

    // Clear handlers
    this.gameActionHandlers.clear();
    this.chatMessageHandlers.clear();
  }
}

export default GameStateTransport;
