/**
 * Monitors the connection status of a player
 * Uses heartbeat mechanism to detect disconnections
 */
export class ConnectionMonitor {
  private playerId: string;
  private connected: boolean = true;
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private disconnectCallbacks: Array<() => void> = [];
  private reconnectCallbacks: Array<() => void> = [];
  
  /**
   * Creates a new ConnectionMonitor instance
   * @param playerId ID of the player to monitor
   */
  constructor(playerId: string) {
    this.playerId = playerId;
    
    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();
  }
  
  /**
   * Starts the heartbeat monitoring process
   */
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
  
  /**
   * Updates the heartbeat timestamp
   * Called when a heartbeat message is received from the player
   */
  public updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    
    if (!this.connected) {
      this.connected = true;
      this.notifyReconnect();
    }
  }
  
  /**
   * Checks if the player is currently connected
   * @returns True if the player is connected, false otherwise
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Registers a callback for disconnection events
   * @param callback Function to call when the player disconnects
   */
  public onDisconnect(callback: () => void): void {
    this.disconnectCallbacks.push(callback);
  }
  
  /**
   * Registers a callback for reconnection events
   * @param callback Function to call when the player reconnects
   */
  public onReconnect(callback: () => void): void {
    this.reconnectCallbacks.push(callback);
  }
  
  /**
   * Notifies all registered callbacks about a disconnection
   */
  private notifyDisconnect(): void {
    this.disconnectCallbacks.forEach(callback => callback());
  }
  
  /**
   * Notifies all registered callbacks about a reconnection
   */
  private notifyReconnect(): void {
    this.reconnectCallbacks.forEach(callback => callback());
  }
  
  /**
   * Cleans up resources used by the monitor
   */
  public dispose(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
