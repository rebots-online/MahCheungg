/**
 * Jami Service Worker
 *
 * This worker handles the communication with the Jami SDK, isolating it from the main thread
 * for better performance and maintainability. It communicates with the main thread using
 * the postMessage API.
 */

// Type definitions for Jami SDK
// Note: These are placeholder types and should be replaced with actual Jami SDK types
interface JamiSDK {
  initialize(): Promise<boolean>;
  createGroupConversation(): Promise<string>;
  inviteContact(groupId: string, contactId: string): Promise<boolean>;
  sendMessage(groupId: string, message: string): Promise<boolean>;
  onMessageReceived(callback: (groupId: string, message: string, sender: string) => void): void;
  onPresenceChanged(callback: (contactId: string, status: string) => void): void;
  getContacts(): Promise<string[]>;
  getGroupMembers(groupId: string): Promise<string[]>;
  leaveGroup(groupId: string): Promise<boolean>;
}

// Message types for worker communication
interface WorkerRequest {
  action: string;
  id: string;
  data?: any;
}

interface WorkerResponse {
  type: 'response' | 'event';
  id?: string;
  data?: any;
  error?: string;
}

/**
 * JamiWorker class
 * Handles communication with the Jami SDK within a worker context
 */
class JamiWorker {
  private jamiSDK: JamiSDK | null = null;
  private initialized: boolean = false;
  private userId: string = '';
  private messageCache: Map<string, string[]> = new Map();
  private heartbeatInterval: number | null = null;

  /**
   * Constructor
   */
  constructor() {
    // Set up message handler
    self.onmessage = this.handleMessage;

    // Initialize Jami SDK
    this.initializeJamiSDK();
  }

  /**
   * Initialize the Jami SDK
   */
  private async initializeJamiSDK(): Promise<void> {
    try {
      // In a real implementation, this would load and initialize the Jami SDK
      // For now, we'll create a mock implementation
      this.jamiSDK = this.createMockJamiSDK();

      const success = await this.jamiSDK.initialize();
      this.initialized = success;

      if (success) {
        // Set up message handler
        this.jamiSDK.onMessageReceived(this.handleMessageReceived);

        // Set up presence handler
        this.jamiSDK.onPresenceChanged(this.handlePresenceChanged);

        // Generate a mock user ID for testing
        this.userId = `user-${Math.random().toString(36).substring(2, 9)}`;

        // Start heartbeat
        this.startHeartbeat();

        console.log('Jami SDK initialized successfully in worker');
      }
    } catch (error) {
      console.error('Failed to initialize Jami SDK in worker:', error);
    }
  }

  /**
   * Handle a message from the main thread
   */
  private handleMessage = async (event: MessageEvent): Promise<void> => {
    const request = event.data as WorkerRequest;

    try {
      if (!this.initialized && request.action !== 'initialize') {
        throw new Error('Jami SDK not initialized');
      }

      let result;

      // Handle different actions
      switch (request.action) {
        case 'initialize':
          result = this.initialized;
          break;
        case 'createGameSession':
          result = await this.createGameSession();
          break;
        case 'inviteToGameSession':
          result = await this.inviteToGameSession(request.data.groupId, request.data.playerId);
          break;
        case 'sendGroupMessage':
          result = await this.sendGroupMessage(request.data.groupId, request.data.message);
          break;
        case 'getGroupMembers':
          result = await this.getGroupMembers(request.data.groupId);
          break;
        case 'leaveGameSession':
          result = await this.leaveGameSession(request.data.groupId);
          break;
        case 'getUserId':
          result = this.userId;
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      // Send response back to main thread
      this.sendResponse(request.id, result);
    } catch (error) {
      // Send error back to main thread
      this.sendError(request.id, error.message);
    }
  };

  /**
   * Send a response back to the main thread
   */
  private sendResponse(id: string, data: any): void {
    const response: WorkerResponse = {
      type: 'response',
      id,
      data
    };

    self.postMessage(response);
  }

  /**
   * Send an error back to the main thread
   */
  private sendError(id: string, error: string): void {
    const response: WorkerResponse = {
      type: 'response',
      id,
      error
    };

    self.postMessage(response);
  }

  /**
   * Send an event to the main thread
   */
  private sendEvent(eventType: string, data: any): void {
    const event: WorkerResponse = {
      type: 'event',
      data: {
        eventType,
        ...data
      }
    };

    self.postMessage(event);
  }

  /**
   * Create a new game session (group chat)
   */
  private async createGameSession(): Promise<string> {
    if (!this.jamiSDK) {
      throw new Error('Jami SDK not initialized');
    }

    // Create a new group conversation
    const groupId = await this.jamiSDK.createGroupConversation();

    // Initialize message cache for this group
    this.messageCache.set(groupId, []);

    return groupId;
  }

  /**
   * Invite a player to a game session
   */
  private async inviteToGameSession(groupId: string, playerId: string): Promise<boolean> {
    if (!this.jamiSDK) {
      throw new Error('Jami SDK not initialized');
    }

    // Invite the player to the group
    return await this.jamiSDK.inviteContact(groupId, playerId);
  }

  /**
   * Send a message to a group
   */
  private async sendGroupMessage(groupId: string, message: string): Promise<boolean> {
    if (!this.jamiSDK) {
      throw new Error('Jami SDK not initialized');
    }

    // Send the message
    const success = await this.jamiSDK.sendMessage(groupId, message);

    if (success) {
      // Cache the message
      this.cacheMessage(groupId, message);
    }

    return success;
  }

  /**
   * Get the members of a group
   */
  private async getGroupMembers(groupId: string): Promise<string[]> {
    if (!this.jamiSDK) {
      throw new Error('Jami SDK not initialized');
    }

    // Get group members from Jami SDK
    return await this.jamiSDK.getGroupMembers(groupId);
  }

  /**
   * Leave a game session
   */
  private async leaveGameSession(groupId: string): Promise<boolean> {
    if (!this.jamiSDK) {
      throw new Error('Jami SDK not initialized');
    }

    // Leave the group
    const success = await this.jamiSDK.leaveGroup(groupId);

    if (success) {
      // Clear message cache for this group
      this.messageCache.delete(groupId);
    }

    return success;
  }

  /**
   * Handle a message received from Jami
   */
  private handleMessageReceived = (groupId: string, message: string, sender: string): void => {
    // Cache the message
    this.cacheMessage(groupId, message);

    // Send event to main thread
    this.sendEvent('message', {
      groupId,
      message,
      sender
    });
  };

  /**
   * Handle a presence change from Jami
   */
  private handlePresenceChanged = (contactId: string, status: string): void => {
    // Send event to main thread
    this.sendEvent('presence', {
      contactId,
      status
    });
  };

  /**
   * Cache a message
   */
  private cacheMessage(groupId: string, message: string): void {
    if (!this.messageCache.has(groupId)) {
      this.messageCache.set(groupId, []);
    }

    const cache = this.messageCache.get(groupId)!;

    // Add message to cache
    cache.push(message);

    // Limit cache size
    if (cache.length > 100) {
      cache.shift();
    }
  }

  /**
   * Start the heartbeat system
   */
  private startHeartbeat(): void {
    // Send heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendEvent('heartbeat', {
        timestamp: Date.now(),
        userId: this.userId
      });
    }, 5000);
  }

  /**
   * Create a mock Jami SDK for testing
   */
  private createMockJamiSDK(): JamiSDK {
    const contacts: string[] = [
      'user-abc123',
      'user-def456',
      'user-ghi789'
    ];

    const groups: Map<string, string[]> = new Map();
    let messageCallback: ((groupId: string, message: string, sender: string) => void) | null = null;
    let presenceCallback: ((contactId: string, status: string) => void) | null = null;

    return {
      initialize: async () => {
        console.log('Mock Jami SDK initialized in worker');
        return true;
      },

      createGroupConversation: async () => {
        const groupId = `group-${Math.random().toString(36).substring(2, 9)}`;
        groups.set(groupId, [this.userId]);
        return groupId;
      },

      inviteContact: async (groupId: string, contactId: string) => {
        if (!groups.has(groupId)) {
          return false;
        }

        groups.get(groupId)!.push(contactId);

        // Simulate acceptance after a delay
        setTimeout(() => {
          if (messageCallback) {
            messageCallback(groupId, `[CHAT] ${contactId} joined the game`, 'system');
          }
        }, 1000);

        return true;
      },

      sendMessage: async (groupId: string, message: string) => {
        if (!groups.has(groupId)) {
          return false;
        }

        // Simulate message delivery to self (for testing)
        setTimeout(() => {
          if (messageCallback) {
            messageCallback(groupId, message, this.userId);
          }
        }, 100);

        // Simulate responses from other players
        if (!message.startsWith('[CHAT]') && Math.random() > 0.7) {
          setTimeout(() => {
            if (messageCallback) {
              const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
              messageCallback(groupId, '[CHAT] Interesting move!', randomContact);
            }
          }, 2000);
        }

        return true;
      },

      onMessageReceived: (callback) => {
        messageCallback = callback;
      },

      onPresenceChanged: (callback) => {
        presenceCallback = callback;

        // Simulate presence changes for testing
        setInterval(() => {
          if (presenceCallback) {
            const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
            const status = Math.random() > 0.5 ? 'online' : 'offline';
            presenceCallback(randomContact, status);
          }
        }, 30000);
      },

      getContacts: async () => {
        return contacts;
      },

      getGroupMembers: async (groupId: string) => {
        if (!groups.has(groupId)) {
          return [];
        }

        return groups.get(groupId)!;
      },

      leaveGroup: async (groupId: string) => {
        if (!groups.has(groupId)) {
          return false;
        }

        groups.delete(groupId);
        return true;
      }
    };
  }
}

// Initialize worker
const worker = new JamiWorker();

// Export empty object to satisfy TypeScript module requirements
export {};
