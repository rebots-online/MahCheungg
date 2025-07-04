class TurnManager {
  private currentPlayerIndex: number = 0;
  private players: Player[] = [];
  private turnTimeout: number = 30000; // 30 seconds default
  private timeoutTimer: NodeJS.Timeout | null = null;
  private connectionMonitors: Map<string, ConnectionMonitor> = new Map();
  private gameTransport: GameStateTransport;
  
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

class ConnectionMonitor {
  private playerId: string;
  private connected: boolean = true;
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private disconnectCallbacks: Array<() => void> = [];
  private reconnectCallbacks: Array<() => void> = [];
  
  constructor(playerId: string) {
    this.playerId = playerId;
    
    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();
  }
  
  private startHeartbeatMonitoring(): void {
    // Check heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastHeartbeat > 15000) { // 15 seconds without heartbeat
        if (this.connected) {
          this.connected = false;
          this.notifyDisconnect();
        }
      }
    }, 5000);
  }
  
  public updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    
    if (!this.connected) {
      this.connected = true;
      this.notifyReconnect();
    }
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public onDisconnect(callback: () => void): void {
    this.disconnectCallbacks.push(callback);
  }
  
  public onReconnect(callback: () => void): void {
    this.reconnectCallbacks.push(callback);
  }
  
  private notifyDisconnect(): void {
    this.disconnectCallbacks.forEach(callback => callback());
  }
  
  private notifyReconnect(): void {
    this.reconnectCallbacks.forEach(callback => callback());
  }
  
  public dispose(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
