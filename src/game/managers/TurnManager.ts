import { Player } from '../interfaces/Player';
import { GameStateTransport } from '../transport/GameStateTransport';
import { ConnectionMonitor } from '../network/ConnectionMonitor';

/**
 * Manages the turn-based gameplay, handling player transitions,
 * timeouts, and disconnections.
 */
export class TurnManager {
  private currentPlayerIndex: number = 0;
  private players: Player[] = [];
  private turnTimeout: number = 30000; // 30 seconds default
  private timeoutTimer: NodeJS.Timeout | null = null;
  private connectionMonitors: Map<string, ConnectionMonitor> = new Map();
  private gameTransport: GameStateTransport;
  
  /**
   * Creates a new TurnManager instance
   * @param players Array of players in the game
   * @param gameTransport Transport layer for game state updates
   */
  constructor(players: Player[], gameTransport: GameStateTransport) {
    this.players = players;
    this.gameTransport = gameTransport;
    
    // Set up connection monitors for each player
    players.forEach(player => {
      const monitor = new ConnectionMonitor(player.id);
      this.connectionMonitors.set(player.id, monitor);
      
      // Listen for disconnection events
      monitor.onDisconnect(() => this.handlePlayerDisconnect(player.id));
    });
  }
  
  /**
   * Starts a new turn for the specified player
   * @param playerIndex Index of the player in the players array
   */
  public startTurn(playerIndex: number): void {
    this.currentPlayerIndex = playerIndex;
    const currentPlayer = this.players[playerIndex];
    
    // Broadcast turn start
    this.gameTransport.sendGameAction({
      action: 'turn_start',
      player: currentPlayer.id,
      timestamp: Date.now()
    });
    
    // Start timeout timer
    this.startTimeoutTimer();
  }
  
  /**
   * Starts or restarts the timeout timer for the current turn
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
   * Handles a turn timeout by automatically passing or discarding
   */
  private handleTurnTimeout(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    // Auto-pass or auto-discard based on game rules
    this.gameTransport.sendGameAction({
      action: 'auto_pass',
      player: currentPlayer.id,
      reason: 'timeout',
      timestamp: Date.now()
    });
    
    // Move to next player
    this.advanceTurn();
  }
  
  /**
   * Handles a player disconnection event
   * @param playerId ID of the disconnected player
   */
  private handlePlayerDisconnect(playerId: string): void {
    // Check if it's the current player who disconnected
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id === playerId) {
      // Emergency handoff needed
      
      // First, check if player reconnects quickly (5 second grace period)
      setTimeout(() => {
        const monitor = this.connectionMonitors.get(playerId);
        if (monitor && !monitor.isConnected()) {
          // Player still disconnected, perform emergency handoff
          this.performEmergencyHandoff();
        }
      }, 5000);
    }
  }
  
  /**
   * Performs an emergency handoff when the current player disconnects
   */
  private performEmergencyHandoff(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    // Broadcast emergency handoff
    this.gameTransport.sendGameAction({
      action: 'emergency_handoff',
      player: currentPlayer.id,
      reason: 'disconnection',
      timestamp: Date.now()
    });
    
    // Move to next player
    this.advanceTurn();
  }
  
  /**
   * Advances the turn to the next connected player
   */
  private advanceTurn(): void {
    // Find next connected player
    let nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    let attempts = 0;
    
    while (attempts < this.players.length) {
      const nextPlayer = this.players[nextPlayerIndex];
      const monitor = this.connectionMonitors.get(nextPlayer.id);
      
      if (monitor && monitor.isConnected()) {
        // Found a connected player
        this.startTurn(nextPlayerIndex);
        return;
      }
      
      // Try next player
      nextPlayerIndex = (nextPlayerIndex + 1) % this.players.length;
      attempts++;
    }
    
    // If we get here, no players are connected
    this.handleAllPlayersDisconnected();
  }
  
  /**
   * Handles the case when all players are disconnected
   */
  private handleAllPlayersDisconnected(): void {
    // Save game state for potential resumption
    this.gameTransport.sendGameAction({
      action: 'game_suspended',
      reason: 'all_disconnected',
      timestamp: Date.now()
    });
    
    // Trigger game suspension event
    // This could save the game state to persistent storage
  }
}
