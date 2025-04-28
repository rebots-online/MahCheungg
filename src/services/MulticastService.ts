/**
 * MulticastService - A modular implementation for peer-to-peer game state multicasting
 * 
 * This service provides a decentralized way to synchronize game state between players
 * using a peer-to-peer approach inspired by Jami's distributed architecture.
 */

// Event types for the multicast service
export enum MulticastEventType {
  INITIALIZED = 'initialized',
  PEER_CONNECTED = 'peer_connected',
  PEER_DISCONNECTED = 'peer_disconnected',
  STATE_UPDATED = 'state_updated',
  MESSAGE_RECEIVED = 'message_received',
  ERROR = 'error',
  CONNECTION_LOST = 'connection_lost',
  CONNECTION_RESTORED = 'connection_restored'
}

// Connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Peer information
export interface Peer {
  id: string;
  name?: string;
  isHost: boolean;
  connectionState: ConnectionState;
  lastSeen?: Date;
}

// Session information
export interface Session {
  id: string;
  name?: string;
  peers: Peer[];
  createdAt: Date;
  hostId: string;
}

// Message types
export enum MessageType {
  STATE_UPDATE = 'state_update',
  ACTION = 'action',
  CHAT = 'chat',
  SYSTEM = 'system',
  PING = 'ping',
  PONG = 'pong'
}

// Message interface
export interface Message {
  id: string;
  type: MessageType;
  senderId: string;
  timestamp: number;
  payload: any;
  requiresAck?: boolean;
}

// Configuration options
export interface MulticastConfig {
  peerId?: string;
  peerName?: string;
  iceServers?: RTCIceServer[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  messageTimeout?: number;
  debug?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: MulticastConfig = {
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  messageTimeout: 10000,
  debug: false,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Event listener type
type EventListener = (data: any) => void;

/**
 * MulticastService class for handling peer-to-peer game state synchronization
 */
class MulticastService {
  private static instance: MulticastService;
  private config: MulticastConfig;
  private peerId: string;
  private peerName: string;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private currentSession: Session | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private eventListeners: Map<string, EventListener[]> = new Map();
  private messageQueue: Message[] = [];
  private pendingMessages: Map<string, { message: Message, timeout: NodeJS.Timeout }> = new Map();
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Generate a random peer ID if not provided
    this.peerId = this.generatePeerId();
    this.peerName = `Player_${this.peerId.substring(0, 6)}`;
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Get the singleton instance of the MulticastService
   * @returns The MulticastService instance
   */
  public static getInstance(): MulticastService {
    if (!MulticastService.instance) {
      MulticastService.instance = new MulticastService();
    }
    return MulticastService.instance;
  }

  /**
   * Initialize the multicast service with configuration
   * @param config Configuration options
   */
  public async initialize(config: MulticastConfig = {}): Promise<void> {
    if (this.initialized) {
      this.log('MulticastService already initialized');
      return;
    }

    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Use provided peer ID or keep the generated one
    if (config.peerId) {
      this.peerId = config.peerId;
    }
    
    // Use provided peer name or keep the default
    if (config.peerName) {
      this.peerName = config.peerName;
    }

    this.log('Initializing MulticastService', { peerId: this.peerId, peerName: this.peerName });
    
    // Check WebRTC support
    if (!this.checkWebRTCSupport()) {
      const error = new Error('WebRTC is not supported in this browser');
      this.emit(MulticastEventType.ERROR, { error });
      throw error;
    }

    this.initialized = true;
    this.emit(MulticastEventType.INITIALIZED, { peerId: this.peerId });
  }

  /**
   * Create a new game session
   * @param sessionName Optional name for the session
   * @returns The created session
   */
  public createSession(sessionName?: string): Session {
    if (!this.initialized) {
      throw new Error('MulticastService not initialized');
    }

    const sessionId = this.generateSessionId();
    
    const session: Session = {
      id: sessionId,
      name: sessionName,
      peers: [
        {
          id: this.peerId,
          name: this.peerName,
          isHost: true,
          connectionState: ConnectionState.CONNECTED
        }
      ],
      createdAt: new Date(),
      hostId: this.peerId
    };

    this.currentSession = session;
    this.connectionState = ConnectionState.CONNECTED;
    
    this.log('Session created', { sessionId, sessionName });
    
    // Start ping timer to keep connections alive
    this.startPingTimer();
    
    return session;
  }

  /**
   * Join an existing session
   * @param sessionId The ID of the session to join
   * @param hostConnectionInfo Connection information for the host
   */
  public async joinSession(sessionId: string, hostConnectionInfo: any): Promise<void> {
    if (!this.initialized) {
      throw new Error('MulticastService not initialized');
    }

    if (this.currentSession) {
      throw new Error('Already in a session');
    }

    this.log('Joining session', { sessionId });
    
    this.connectionState = ConnectionState.CONNECTING;
    
    try {
      // TODO: Implement actual connection logic
      // This is a placeholder for the actual WebRTC connection establishment
      
      // Create a temporary session object
      this.currentSession = {
        id: sessionId,
        peers: [
          {
            id: 'host-placeholder', // Will be updated with actual host ID
            isHost: true,
            connectionState: ConnectionState.CONNECTING
          },
          {
            id: this.peerId,
            name: this.peerName,
            isHost: false,
            connectionState: ConnectionState.CONNECTING
          }
        ],
        createdAt: new Date(),
        hostId: 'host-placeholder' // Will be updated with actual host ID
      };
      
      // Start ping timer to keep connections alive
      this.startPingTimer();
      
    } catch (error) {
      this.connectionState = ConnectionState.ERROR;
      this.emit(MulticastEventType.ERROR, { error });
      throw error;
    }
  }

  /**
   * Leave the current session
   */
  public leaveSession(): void {
    if (!this.currentSession) {
      return;
    }

    this.log('Leaving session', { sessionId: this.currentSession.id });
    
    // Close all peer connections
    this.peers.forEach((connection, peerId) => {
      this.closePeerConnection(peerId);
    });
    
    // Clear all timers
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear message queue and pending messages
    this.messageQueue = [];
    this.pendingMessages.forEach(({ timeout }) => {
      clearTimeout(timeout);
    });
    this.pendingMessages.clear();
    
    // Reset state
    this.currentSession = null;
    this.connectionState = ConnectionState.DISCONNECTED;
  }

  /**
   * Send a message to all peers in the session
   * @param type Message type
   * @param payload Message payload
   * @param requiresAck Whether the message requires acknowledgment
   * @returns The message ID
   */
  public sendMessage(type: MessageType, payload: any, requiresAck: boolean = false): string {
    if (!this.currentSession) {
      throw new Error('Not in a session');
    }

    const message: Message = {
      id: this.generateMessageId(),
      type,
      senderId: this.peerId,
      timestamp: Date.now(),
      payload,
      requiresAck
    };

    this.log('Sending message', { messageId: message.id, type });
    
    // Add to queue and process
    this.messageQueue.push(message);
    this.processMessageQueue();
    
    return message.id;
  }

  /**
   * Send a game state update to all peers
   * @param gameState The current game state
   * @param requiresAck Whether acknowledgment is required
   * @returns The message ID
   */
  public sendGameState(gameState: any, requiresAck: boolean = true): string {
    return this.sendMessage(MessageType.STATE_UPDATE, gameState, requiresAck);
  }

  /**
   * Send a game action to all peers
   * @param action The game action
   * @param requiresAck Whether acknowledgment is required
   * @returns The message ID
   */
  public sendGameAction(action: any, requiresAck: boolean = true): string {
    return this.sendMessage(MessageType.ACTION, action, requiresAck);
  }

  /**
   * Send a chat message to all peers
   * @param text The chat message text
   * @returns The message ID
   */
  public sendChatMessage(text: string): string {
    return this.sendMessage(MessageType.CHAT, { text }, false);
  }

  /**
   * Get the current session
   * @returns The current session or null if not in a session
   */
  public getSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Get the current connection state
   * @returns The current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get the peer ID
   * @returns The peer ID
   */
  public getPeerId(): string {
    return this.peerId;
  }

  /**
   * Get the peer name
   * @returns The peer name
   */
  public getPeerName(): string {
    return this.peerName;
  }

  /**
   * Set the peer name
   * @param name The new peer name
   */
  public setPeerName(name: string): void {
    this.peerName = name;
    
    // If in a session, notify other peers of the name change
    if (this.currentSession) {
      this.sendMessage(MessageType.SYSTEM, { 
        action: 'name_change', 
        oldName: this.peerName, 
        newName: name 
      });
    }
  }

  /**
   * Add an event listener
   * @param event The event type
   * @param listener The event listener function
   */
  public on(event: MulticastEventType, listener: EventListener): void {
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
  public off(event: MulticastEventType, listener: EventListener): void {
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
   * Generate a session code that's easy for users to share
   * @returns A human-readable session code
   */
  public getSessionCode(): string {
    if (!this.currentSession) {
      throw new Error('Not in a session');
    }
    
    // Convert the session ID to a more user-friendly format
    // For example, take the first 6 characters and format them as XXX-XXX
    const code = this.currentSession.id.substring(0, 6).toUpperCase();
    return `${code.substring(0, 3)}-${code.substring(3, 6)}`;
  }

  /**
   * Check if the current peer is the host
   * @returns True if the current peer is the host
   */
  public isHost(): boolean {
    if (!this.currentSession) {
      return false;
    }
    
    return this.currentSession.hostId === this.peerId;
  }

  /**
   * Get debug information about the current state
   * @returns Debug information
   */
  public getDebugInfo(): any {
    return {
      peerId: this.peerId,
      peerName: this.peerName,
      connectionState: this.connectionState,
      session: this.currentSession,
      peerConnections: Array.from(this.peers.keys()),
      dataChannels: Array.from(this.dataChannels.keys()),
      messageQueueLength: this.messageQueue.length,
      pendingMessagesCount: this.pendingMessages.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Private methods

  /**
   * Emit an event to all registered listeners
   * @param event The event type
   * @param data The event data
   */
  private emit(event: MulticastEventType, data: any): void {
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
   * Process the message queue
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }
    
    // Process up to 10 messages at a time
    const messagesToProcess = this.messageQueue.splice(0, 10);
    
    for (const message of messagesToProcess) {
      this.broadcastMessage(message);
    }
  }

  /**
   * Broadcast a message to all peers
   * @param message The message to broadcast
   */
  private broadcastMessage(message: Message): void {
    // If no peers, nothing to do
    if (this.dataChannels.size === 0) {
      return;
    }
    
    const messageStr = JSON.stringify(message);
    
    // Send to all data channels
    this.dataChannels.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        try {
          channel.send(messageStr);
          
          // If acknowledgment is required, set up a timeout
          if (message.requiresAck) {
            const timeout = setTimeout(() => {
              // Handle message timeout
              this.handleMessageTimeout(message, peerId);
            }, this.config.messageTimeout);
            
            this.pendingMessages.set(`${message.id}-${peerId}`, { message, timeout });
          }
        } catch (error) {
          console.error('Error sending message', error);
          this.emit(MulticastEventType.ERROR, { error, peerId, messageId: message.id });
        }
      } else {
        // Queue the message for later if the channel is not open
        this.messageQueue.push(message);
      }
    });
  }

  /**
   * Handle a message timeout
   * @param message The message that timed out
   * @param peerId The peer ID that didn't acknowledge
   */
  private handleMessageTimeout(message: Message, peerId: string): void {
    this.log('Message timeout', { messageId: message.id, peerId });
    
    // Remove from pending messages
    this.pendingMessages.delete(`${message.id}-${peerId}`);
    
    // Check if the peer is still connected
    const peer = this.currentSession?.peers.find(p => p.id === peerId);
    
    if (peer && peer.connectionState === ConnectionState.CONNECTED) {
      // Try to reconnect to the peer
      this.reconnectToPeer(peerId);
    }
  }

  /**
   * Reconnect to a peer
   * @param peerId The peer ID to reconnect to
   */
  private reconnectToPeer(peerId: string): void {
    this.log('Reconnecting to peer', { peerId });
    
    // Close existing connection
    this.closePeerConnection(peerId);
    
    // Update peer state
    if (this.currentSession) {
      const peerIndex = this.currentSession.peers.findIndex(p => p.id === peerId);
      
      if (peerIndex !== -1) {
        this.currentSession.peers[peerIndex].connectionState = ConnectionState.RECONNECTING;
      }
    }
    
    // TODO: Implement actual reconnection logic
    // This is a placeholder for the actual WebRTC reconnection
  }

  /**
   * Close a peer connection
   * @param peerId The peer ID to close connection with
   */
  private closePeerConnection(peerId: string): void {
    // Close data channel if it exists
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel) {
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }
    
    // Close peer connection if it exists
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
    }
  }

  /**
   * Start the ping timer to keep connections alive
   */
  private startPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }
    
    this.pingTimer = setInterval(() => {
      if (this.currentSession) {
        this.sendMessage(MessageType.PING, { timestamp: Date.now() });
      }
    }, this.config.pingInterval);
  }

  /**
   * Check if WebRTC is supported in the current browser
   * @returns True if WebRTC is supported
   */
  private checkWebRTCSupport(): boolean {
    return (
      typeof RTCPeerConnection !== 'undefined' &&
      typeof RTCDataChannel !== 'undefined'
    );
  }

  /**
   * Generate a random peer ID
   * @returns A random peer ID
   */
  private generatePeerId(): string {
    return 'peer_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a random session ID
   * @returns A random session ID
   */
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a random message ID
   * @returns A random message ID
   */
  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Log a message if debug is enabled
   * @param message The message to log
   * @param data Additional data to log
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[MulticastService] ${message}`, data);
    }
  }
}

export default MulticastService;
