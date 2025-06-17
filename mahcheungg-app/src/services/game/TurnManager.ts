/**
 * TurnManager
 * 
 * This service manages the turn-based authority model, handling timeouts,
 * disconnections, and turn transitions.
 */

import GameStateTransport from './GameStateTransport';
import { 
  GameAction, 
  TurnStartAction, 
  AutoPassAction, 
  EmergencyHandoffAction,
  GameSuspendedAction
} from '../../models/game/GameActions';

// Connection status
type ConnectionStatus = 'connected' | 'disconnected';

// Connection monitor for a player
interface ConnectionMonitor {
  playerId: string;
  status: ConnectionStatus;
  lastHeartbeat: number;
}

// Turn change handler
type TurnChangeHandler = (playerId: string) => void;

/**
 * TurnManager class
 */
class TurnManager {
  private gameTransport: GameStateTransport;
  private players: string[] = [];
  private currentPlayerIndex: number = 0;
  private turnTimeout: number = 30000; // 30 seconds default
  private timeoutTimer: NodeJS.Timeout | null = null;
  private connectionMonitors: Map<string, ConnectionMonitor> = new Map();
  private turnChangeHandlers: Set<TurnChangeHandler> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatCheckInterval: NodeJS.Timeout | null = null;
  private disposed: boolean = false;
  
  /**
   * Constructor
   * @param gameTransport The game state transport
   * @param players Array of player IDs
   * @param turnTimeout Turn timeout in milliseconds (default: 30000)
   */
  constructor(gameTransport: GameStateTransport, players: string[] = [], turnTimeout: number = 30000) {
    this.gameTransport = gameTransport;
    this.players = players;
    this.turnTimeout = turnTimeout;
    
    // Set up connection monitors for each player
    players.forEach(playerId => {
      this.connectionMonitors.set(playerId, {
        playerId,
        status: 'connected',
        lastHeartbeat: Date.now()
      });
    });
    
    // Listen for game actions
    this.gameTransport.onGameAction(this.handleGameAction);
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Start heartbeat check
    this.startHeartbeatCheck();
  }
  
  /**
   * Add a player
   * @param playerId The ID of the player to add
   */
  public addPlayer(playerId: string): void {
    if (!this.players.includes(playerId)) {
      this.players.push(playerId);
      
      // Set up connection monitor
      this.connectionMonitors.set(playerId, {
        playerId,
        status: 'connected',
        lastHeartbeat: Date.now()
      });
    }
  }
  
  /**
   * Remove a player
   * @param playerId The ID of the player to remove
   */
  public removePlayer(playerId: string): void {
    const index = this.players.indexOf(playerId);
    
    if (index !== -1) {
      this.players.splice(index, 1);
      
      // Remove connection monitor
      this.connectionMonitors.delete(playerId);
      
      // If this was the current player, move to the next player
      if (index === this.currentPlayerIndex) {
        this.advanceTurn();
      } else if (index < this.currentPlayerIndex) {
        // Adjust current player index
        this.currentPlayerIndex--;
      }
    }
  }
  
  /**
   * Start a new turn
   * @param playerIndex The index of the player whose turn it is
   */
  public startTurn(playerIndex: number): void {
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      console.error(`Invalid player index: ${playerIndex}`);
      return;
    }
    
    this.currentPlayerIndex = playerIndex;
    const currentPlayer = this.players[playerIndex];
    
    // Broadcast turn start
    const turnStartAction: Partial<TurnStartAction> = {
      action: 'turn_start'
    };
    
    this.gameTransport.sendGameAction(turnStartAction);
    
    // Start timeout timer
    this.startTimeoutTimer();
    
    // Notify turn change handlers
    this.notifyTurnChangeHandlers(currentPlayer);
    
    console.log(`Turn started for player ${currentPlayer}`);
  }
  
  /**
   * Start the timeout timer
   */
  private startTimeoutTimer(): void {
    // Clear any existing timer
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    
    // Set new timer
    this.timeoutTimer = setTimeout(() => {
      this.handleTurnTimeout();
    }, this.turnTimeout);
  }
  
  /**
   * Handle turn timeout
   */
  private handleTurnTimeout(): void {
    if (this.disposed) return;
    
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    console.log(`Turn timeout for player ${currentPlayer}`);
    
    // Auto-pass or auto-discard based on game rules
    const autoPassAction: Partial<AutoPassAction> = {
      action: 'auto_pass',
      reason: 'timeout'
    };
    
    this.gameTransport.sendGameAction(autoPassAction);
    
    // Move to next player
    this.advanceTurn();
  }
  
  /**
   * Handle player disconnection
   * @param playerId The ID of the disconnected player
   */
  private handlePlayerDisconnect(playerId: string): void {
    if (this.disposed) return;
    
    console.log(`Player disconnected: ${playerId}`);
    
    // Update connection monitor
    const monitor = this.connectionMonitors.get(playerId);
    if (monitor) {
      monitor.status = 'disconnected';
    }
    
    // Check if it's the current player who disconnected
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer === playerId) {
      // Emergency handoff needed
      
      // First, check if player reconnects quickly (5 second grace period)
      setTimeout(() => {
        if (this.disposed) return;
        
        const monitor = this.connectionMonitors.get(playerId);
        if (monitor && monitor.status === 'disconnected') {
          // Player still disconnected, perform emergency handoff
          this.performEmergencyHandoff(playerId);
        }
      }, 5000);
    }
    
    // Check if all players are disconnected
    if (this.areAllPlayersDisconnected()) {
      this.handleAllPlayersDisconnected();
    }
  }
  
  /**
   * Handle player reconnection
   * @param playerId The ID of the reconnected player
   */
  private handlePlayerReconnect(playerId: string): void {
    if (this.disposed) return;
    
    console.log(`Player reconnected: ${playerId}`);
    
    // Update connection monitor
    const monitor = this.connectionMonitors.get(playerId);
    if (monitor) {
      monitor.status = 'connected';
    }
  }
  
  /**
   * Perform emergency handoff
   * @param playerId The ID of the disconnected player
   */
  private performEmergencyHandoff(playerId: string): void {
    if (this.disposed) return;
    
    console.log(`Performing emergency handoff for player ${playerId}`);
    
    // Find next connected player
    const nextPlayerIndex = this.findNextConnectedPlayerIndex();
    
    if (nextPlayerIndex === -1) {
      // No connected players, suspend the game
      this.handleAllPlayersDisconnected();
      return;
    }
    
    const nextPlayer = this.players[nextPlayerIndex];
    
    // Broadcast emergency handoff
    const emergencyHandoffAction: Partial<EmergencyHandoffAction> = {
      action: 'emergency_handoff',
      reason: 'disconnection',
      nextPlayer
    };
    
    this.gameTransport.sendGameAction(emergencyHandoffAction);
    
    // Move to next player
    this.startTurn(nextPlayerIndex);
  }
  
  /**
   * Handle all players disconnected
   */
  private handleAllPlayersDisconnected(): void {
    if (this.disposed) return;
    
    console.log('All players disconnected, suspending game');
    
    // Clear timeout timer
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    // Broadcast game suspended
    const gameSuspendedAction: Partial<GameSuspendedAction> = {
      action: 'game_suspended',
      reason: 'all_disconnected'
    };
    
    this.gameTransport.sendGameAction(gameSuspendedAction);
  }
  
  /**
   * Advance to the next turn
   */
  public advanceTurn(): void {
    if (this.disposed) return;
    
    // Find next connected player
    const nextPlayerIndex = this.findNextConnectedPlayerIndex();
    
    if (nextPlayerIndex === -1) {
      // No connected players, suspend the game
      this.handleAllPlayersDisconnected();
      return;
    }
    
    // Start turn for next player
    this.startTurn(nextPlayerIndex);
  }
  
  /**
   * Find the index of the next connected player
   * @returns The index of the next connected player, or -1 if none found
   */
  private findNextConnectedPlayerIndex(): number {
    if (this.players.length === 0) {
      return -1;
    }
    
    let nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    let attempts = 0;
    
    while (attempts < this.players.length) {
      const nextPlayer = this.players[nextPlayerIndex];
      const monitor = this.connectionMonitors.get(nextPlayer);
      
      if (monitor && monitor.status === 'connected') {
        // Found a connected player
        return nextPlayerIndex;
      }
      
      // Try next player
      nextPlayerIndex = (nextPlayerIndex + 1) % this.players.length;
      attempts++;
    }
    
    // No connected players found
    return -1;
  }
  
  /**
   * Check if all players are disconnected
   * @returns True if all players are disconnected
   */
  private areAllPlayersDisconnected(): boolean {
    for (const playerId of this.players) {
      const monitor = this.connectionMonitors.get(playerId);
      if (monitor && monitor.status === 'connected') {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Start the heartbeat
   */
  private startHeartbeat(): void {
    // Send heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.disposed) return;
      
      // Update heartbeat for current player
      const currentPlayerId = this.gameTransport.getPlayerId();
      const monitor = this.connectionMonitors.get(currentPlayerId);
      
      if (monitor) {
        monitor.lastHeartbeat = Date.now();
        monitor.status = 'connected';
      }
      
      // In a real implementation, this would send a heartbeat message to other players
      // For now, we'll simulate it by updating the heartbeat for all players
      for (const playerId of this.players) {
        if (playerId !== currentPlayerId && Math.random() > 0.1) { // 10% chance of "missing" a heartbeat
          const monitor = this.connectionMonitors.get(playerId);
          if (monitor) {
            monitor.lastHeartbeat = Date.now();
            
            if (monitor.status === 'disconnected') {
              monitor.status = 'connected';
              this.handlePlayerReconnect(playerId);
            }
          }
        }
      }
    }, 5000);
  }
  
  /**
   * Start the heartbeat check
   */
  private startHeartbeatCheck(): void {
    // Check heartbeats every 10 seconds
    this.heartbeatCheckInterval = setInterval(() => {
      if (this.disposed) return;
      
      const now = Date.now();
      
      // Check each player's heartbeat
      for (const [playerId, monitor] of this.connectionMonitors.entries()) {
        if (now - monitor.lastHeartbeat > 15000) { // 15 seconds without heartbeat
          if (monitor.status === 'connected') {
            monitor.status = 'disconnected';
            this.handlePlayerDisconnect(playerId);
          }
        }
      }
    }, 10000);
  }
  
  /**
   * Handle a game action
   * @param action The game action
   */
  private handleGameAction = (action: GameAction): void => {
    if (this.disposed) return;
    
    // Update heartbeat for the player who sent the action
    const monitor = this.connectionMonitors.get(action.player);
    if (monitor) {
      monitor.lastHeartbeat = Date.now();
      
      if (monitor.status === 'disconnected') {
        monitor.status = 'connected';
        this.handlePlayerReconnect(action.player);
      }
    }
    
    // Handle specific actions
    switch (action.action) {
      case 'turn_start':
        // Find the player index
        const playerIndex = this.players.indexOf(action.player);
        if (playerIndex !== -1) {
          this.currentPlayerIndex = playerIndex;
          
          // Start timeout timer
          this.startTimeoutTimer();
          
          // Notify turn change handlers
          this.notifyTurnChangeHandlers(action.player);
        }
        break;
        
      case 'auto_pass':
        // If this is for the current player, advance the turn
        if (action.player === this.players[this.currentPlayerIndex]) {
          this.advanceTurn();
        }
        break;
        
      case 'emergency_handoff':
        // If this is for the current player, advance the turn
        if (action.player === this.players[this.currentPlayerIndex]) {
          // Find the next player index
          const nextPlayerIndex = this.players.indexOf(action.nextPlayer);
          if (nextPlayerIndex !== -1) {
            this.startTurn(nextPlayerIndex);
          } else {
            this.advanceTurn();
          }
        }
        break;
        
      case 'game_suspended':
        // Clear timeout timer
        if (this.timeoutTimer) {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = null;
        }
        break;
        
      case 'game_resumed':
        // Restart the turn
        this.startTurn(this.currentPlayerIndex);
        break;
    }
  };
  
  /**
   * Register a handler for turn changes
   * @param handler The handler function
   */
  public onTurnChange(handler: TurnChangeHandler): void {
    this.turnChangeHandlers.add(handler);
  }
  
  /**
   * Unregister a handler for turn changes
   * @param handler The handler function to remove
   */
  public offTurnChange(handler: TurnChangeHandler): void {
    this.turnChangeHandlers.delete(handler);
  }
  
  /**
   * Notify all turn change handlers
   * @param playerId The ID of the player whose turn it is
   */
  private notifyTurnChangeHandlers(playerId: string): void {
    for (const handler of this.turnChangeHandlers) {
      try {
        handler(playerId);
      } catch (error) {
        console.error('Error in turn change handler:', error);
      }
    }
  }
  
  /**
   * Get the current player ID
   * @returns The ID of the current player
   */
  public getCurrentPlayerId(): string {
    return this.players[this.currentPlayerIndex];
  }
  
  /**
   * Get the current player index
   * @returns The index of the current player
   */
  public getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
  
  /**
   * Get the players
   * @returns Array of player IDs
   */
  public getPlayers(): string[] {
    return [...this.players];
  }
  
  /**
   * Get the connection status of a player
   * @param playerId The ID of the player
   * @returns The connection status, or undefined if the player is not found
   */
  public getPlayerConnectionStatus(playerId: string): ConnectionStatus | undefined {
    const monitor = this.connectionMonitors.get(playerId);
    return monitor?.status;
  }
  
  /**
   * Check if it's a player's turn
   * @param playerId The ID of the player
   * @returns True if it's the player's turn
   */
  public isPlayerTurn(playerId: string): boolean {
    return this.players[this.currentPlayerIndex] === playerId;
  }
  
  /**
   * Set the turn timeout
   * @param timeout The timeout in milliseconds
   */
  public setTurnTimeout(timeout: number): void {
    this.turnTimeout = timeout;
  }
  
  /**
   * Dispose of the turn manager
   */
  public dispose(): void {
    this.disposed = true;
    
    // Clear timers
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatCheckInterval) {
      clearInterval(this.heartbeatCheckInterval);
      this.heartbeatCheckInterval = null;
    }
    
    // Clear handlers
    this.turnChangeHandlers.clear();
    
    // Unsubscribe from game actions
    this.gameTransport.offGameAction(this.handleGameAction);
  }
}

export default TurnManager;
export type { ConnectionStatus, ConnectionMonitor, TurnChangeHandler };
