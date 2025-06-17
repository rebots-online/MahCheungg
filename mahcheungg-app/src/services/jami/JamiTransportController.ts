/**
 * JamiTransportController
 * 
 * This controller manages communication with the Jami service worker, providing
 * a clean interface for the rest of the application to interact with Jami.
 */

// Type definitions for worker communication
interface WorkerResponse {
  type: 'response' | 'event';
  id?: string;
  data?: any;
  error?: string;
}

// Message handler type
type MessageHandler = (message: string, sender: string) => void;

// Presence handler type
type PresenceHandler = (status: string) => void;

// Event handler type
type EventHandler = (data: any) => void;

/**
 * JamiTransportController class
 * Provides an interface to interact with the Jami service worker
 */
class JamiTransportController {
  private static instance: JamiTransportController;
  private worker: Worker | null = null;
  private initialized: boolean = false;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private presenceHandlers: Map<string, PresenceHandler> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private messageIdCounter: number = 0;
  private messagePromises: Map<string, { resolve: (value: any) => void, reject: (reason: any) => void }> = new Map();
  private userId: string = '';
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Get the singleton instance of JamiTransportController
   */
  public static getInstance(): JamiTransportController {
    if (!JamiTransportController.instance) {
      JamiTransportController.instance = new JamiTransportController();
    }
    return JamiTransportController.instance;
  }
  
  /**
   * Initialize the controller and worker
   * @returns Promise resolving to true if initialization was successful
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Create worker
      this.worker = new Worker(new URL('./jami-worker.ts', import.meta.url), { type: 'module' });
      
      // Set up message handler
      this.worker.onmessage = this.handleWorkerMessage;
      
      // Initialize worker
      const success = await this.sendWorkerMessage('initialize');
      this.initialized = success;
      
      if (success) {
        // Get user ID
        this.userId = await this.sendWorkerMessage('getUserId');
        
        console.log('JamiTransportController initialized successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to initialize JamiTransportController:', error);
      return false;
    }
  }
  
  /**
   * Create a new game session (group chat)
   * @returns Promise resolving to the group ID
   */
  public async createGameSession(): Promise<string> {
    if (!this.initialized || !this.worker) {
      throw new Error('JamiTransportController not initialized');
    }
    
    try {
      // Create a new game session
      const groupId = await this.sendWorkerMessage('createGameSession');
      
      // Initialize message handlers set for this group
      this.messageHandlers.set(groupId, new Set());
      
      console.log(`Created game session with ID: ${groupId}`);
      return groupId;
    } catch (error) {
      console.error('Failed to create game session:', error);
      throw error;
    }
  }
  
  /**
   * Invite a player to a game session
   * @param groupId The ID of the group chat
   * @param playerId The ID of the player to invite
   * @returns Promise resolving to true if invitation was successful
   */
  public async inviteToGameSession(groupId: string, playerId: string): Promise<boolean> {
    if (!this.initialized || !this.worker) {
      throw new Error('JamiTransportController not initialized');
    }
    
    try {
      // Invite the player to the group
      return await this.sendWorkerMessage('inviteToGameSession', { groupId, playerId });
    } catch (error) {
      console.error(`Failed to invite player ${playerId} to game session ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Send a message to a group
   * @param groupId The ID of the group chat
   * @param message The message to send
   * @returns Promise resolving to true if message was sent successfully
   */
  public async sendGroupMessage(groupId: string, message: string): Promise<boolean> {
    if (!this.initialized || !this.worker) {
      throw new Error('JamiTransportController not initialized');
    }
    
    try {
      // Send the message
      return await this.sendWorkerMessage('sendGroupMessage', { groupId, message });
    } catch (error) {
      console.error(`Failed to send message to group ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Subscribe to messages from a group
   * @param groupId The ID of the group chat
   * @param callback The callback function to call when a message is received
   */
  public subscribeToGroup(groupId: string, callback: MessageHandler): void {
    if (!this.messageHandlers.has(groupId)) {
      this.messageHandlers.set(groupId, new Set());
    }
    
    this.messageHandlers.get(groupId)!.add(callback);
    console.log(`Subscribed to messages from group ${groupId}`);
  }
  
  /**
   * Unsubscribe from messages from a group
   * @param groupId The ID of the group chat
   * @param callback The callback function to remove
   */
  public unsubscribeFromGroup(groupId: string, callback: MessageHandler): void {
    if (!this.messageHandlers.has(groupId)) {
      return;
    }
    
    this.messageHandlers.get(groupId)!.delete(callback);
    console.log(`Unsubscribed from messages from group ${groupId}`);
  }
  
  /**
   * Subscribe to presence changes for a player
   * @param playerId The ID of the player
   * @param callback The callback function to call when presence changes
   */
  public subscribeToPresence(playerId: string, callback: PresenceHandler): void {
    this.presenceHandlers.set(playerId, callback);
    console.log(`Subscribed to presence changes for player ${playerId}`);
  }
  
  /**
   * Unsubscribe from presence changes for a player
   * @param playerId The ID of the player
   */
  public unsubscribeFromPresence(playerId: string): void {
    this.presenceHandlers.delete(playerId);
    console.log(`Unsubscribed from presence changes for player ${playerId}`);
  }
  
  /**
   * Subscribe to a specific event type
   * @param eventType The type of event to subscribe to
   * @param callback The callback function to call when the event occurs
   */
  public subscribeToEvent(eventType: string, callback: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(callback);
    console.log(`Subscribed to event type: ${eventType}`);
  }
  
  /**
   * Unsubscribe from a specific event type
   * @param eventType The type of event to unsubscribe from
   * @param callback The callback function to remove
   */
  public unsubscribeFromEvent(eventType: string, callback: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }
    
    this.eventHandlers.get(eventType)!.delete(callback);
    console.log(`Unsubscribed from event type: ${eventType}`);
  }
  
  /**
   * Leave a game session
   * @param groupId The ID of the group chat
   * @returns Promise resolving to true if leaving was successful
   */
  public async leaveGameSession(groupId: string): Promise<boolean> {
    if (!this.initialized || !this.worker) {
      throw new Error('JamiTransportController not initialized');
    }
    
    try {
      // Leave the group
      const success = await this.sendWorkerMessage('leaveGameSession', { groupId });
      
      if (success) {
        // Remove group from local storage
        this.messageHandlers.delete(groupId);
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to leave game session ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get the current user ID
   * @returns The current user ID
   */
  public getUserId(): string {
    return this.userId;
  }
  
  /**
   * Get the members of a group
   * @param groupId The ID of the group chat
   * @returns Promise resolving to an array of member IDs
   */
  public async getGroupMembers(groupId: string): Promise<string[]> {
    if (!this.initialized || !this.worker) {
      throw new Error('JamiTransportController not initialized');
    }
    
    try {
      // Get group members
      return await this.sendWorkerMessage('getGroupMembers', { groupId });
    } catch (error) {
      console.error(`Failed to get members of group ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Handle a message from the worker
   */
  private handleWorkerMessage = (event: MessageEvent): void => {
    const response = event.data as WorkerResponse;
    
    if (response.type === 'response') {
      // Handle response to a request
      if (response.id && this.messagePromises.has(response.id)) {
        const { resolve, reject } = this.messagePromises.get(response.id)!;
        
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
        
        // Remove the promise
        this.messagePromises.delete(response.id);
      }
    } else if (response.type === 'event') {
      // Handle event
      this.handleEvent(response.data);
    }
  };
  
  /**
   * Handle an event from the worker
   */
  private handleEvent(event: any): void {
    const eventType = event.eventType;
    
    switch (eventType) {
      case 'message':
        this.handleMessageEvent(event);
        break;
      case 'presence':
        this.handlePresenceEvent(event);
        break;
      case 'heartbeat':
        this.handleHeartbeatEvent(event);
        break;
      default:
        // Notify generic event handlers
        if (this.eventHandlers.has(eventType)) {
          this.eventHandlers.get(eventType)!.forEach(handler => {
            try {
              handler(event);
            } catch (error) {
              console.error(`Error in event handler for ${eventType}:`, error);
            }
          });
        }
    }
  }
  
  /**
   * Handle a message event
   */
  private handleMessageEvent(event: any): void {
    const { groupId, message, sender } = event;
    
    // Notify message handlers for this group
    if (this.messageHandlers.has(groupId)) {
      this.messageHandlers.get(groupId)!.forEach(handler => {
        try {
          handler(message, sender);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }
  
  /**
   * Handle a presence event
   */
  private handlePresenceEvent(event: any): void {
    const { contactId, status } = event;
    
    // Notify presence handler for this contact
    if (this.presenceHandlers.has(contactId)) {
      try {
        this.presenceHandlers.get(contactId)!(status);
      } catch (error) {
        console.error('Error in presence handler:', error);
      }
    }
  }
  
  /**
   * Handle a heartbeat event
   */
  private handleHeartbeatEvent(event: any): void {
    // Notify heartbeat event handlers
    if (this.eventHandlers.has('heartbeat')) {
      this.eventHandlers.get('heartbeat')!.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in heartbeat handler:', error);
        }
      });
    }
  }
  
  /**
   * Send a message to the worker
   * @param action The action to perform
   * @param data The data to send
   * @returns Promise resolving to the response data
   */
  private async sendWorkerMessage(action: string, data?: any): Promise<any> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }
    
    return new Promise((resolve, reject) => {
      // Generate a unique ID for this message
      const messageId = (this.messageIdCounter++).toString();
      
      // Store the promise callbacks
      this.messagePromises.set(messageId, { resolve, reject });
      
      // Send the message to the worker
      this.worker.postMessage({
        action,
        id: messageId,
        data
      });
    });
  }
}

export default JamiTransportController;
