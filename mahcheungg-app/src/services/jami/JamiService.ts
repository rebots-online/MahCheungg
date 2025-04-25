/**
 * JamiService
 * 
 * This service provides an abstraction over the Jami SDK, handling group chat creation,
 * invitations, and message sending/receiving. It is implemented as a singleton to ensure
 * a single instance throughout the application.
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

// Group chat information
interface GroupChat {
  id: string;
  members: string[];
  created: Date;
}

// Message handler type
type MessageHandler = (message: string, sender: string) => void;

/**
 * JamiService class
 * Provides an interface to interact with the Jami SDK
 */
class JamiService {
  private static instance: JamiService;
  private initialized: boolean = false;
  private jamiSDK: JamiSDK | null = null;
  private groupChats: Map<string, GroupChat> = new Map();
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private presenceHandlers: Map<string, (status: string) => void> = new Map();
  private userId: string = '';
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Get the singleton instance of JamiService
   */
  public static getInstance(): JamiService {
    if (!JamiService.instance) {
      JamiService.instance = new JamiService();
    }
    return JamiService.instance;
  }
  
  /**
   * Initialize the Jami SDK
   * @returns Promise resolving to true if initialization was successful
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
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
        
        console.log('JamiService initialized successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to initialize JamiService:', error);
      return false;
    }
  }
  
  /**
   * Create a new game session (group chat)
   * @returns Promise resolving to the group ID
   */
  public async createGameSession(): Promise<string> {
    if (!this.initialized || !this.jamiSDK) {
      throw new Error('JamiService not initialized');
    }
    
    try {
      // Create a new group conversation
      const groupId = await this.jamiSDK.createGroupConversation();
      
      // Store group information
      this.groupChats.set(groupId, {
        id: groupId,
        members: [this.userId],
        created: new Date()
      });
      
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
    if (!this.initialized || !this.jamiSDK) {
      throw new Error('JamiService not initialized');
    }
    
    if (!this.groupChats.has(groupId)) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    try {
      // Invite the player to the group
      const success = await this.jamiSDK.inviteContact(groupId, playerId);
      
      if (success) {
        // Update group members
        const group = this.groupChats.get(groupId)!;
        group.members.push(playerId);
        
        console.log(`Invited player ${playerId} to game session ${groupId}`);
      }
      
      return success;
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
    if (!this.initialized || !this.jamiSDK) {
      throw new Error('JamiService not initialized');
    }
    
    if (!this.groupChats.has(groupId)) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    try {
      // Send the message
      const success = await this.jamiSDK.sendMessage(groupId, message);
      
      if (success) {
        console.log(`Sent message to group ${groupId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      }
      
      return success;
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
  public subscribeToPresence(playerId: string, callback: (status: string) => void): void {
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
   * Leave a game session
   * @param groupId The ID of the group chat
   * @returns Promise resolving to true if leaving was successful
   */
  public async leaveGameSession(groupId: string): Promise<boolean> {
    if (!this.initialized || !this.jamiSDK) {
      throw new Error('JamiService not initialized');
    }
    
    if (!this.groupChats.has(groupId)) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    try {
      // Leave the group
      const success = await this.jamiSDK.leaveGroup(groupId);
      
      if (success) {
        // Remove group from local storage
        this.groupChats.delete(groupId);
        this.messageHandlers.delete(groupId);
        
        console.log(`Left game session ${groupId}`);
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
    if (!this.initialized || !this.jamiSDK) {
      throw new Error('JamiService not initialized');
    }
    
    if (!this.groupChats.has(groupId)) {
      throw new Error(`Group ${groupId} not found`);
    }
    
    try {
      // Get group members from Jami SDK
      return await this.jamiSDK.getGroupMembers(groupId);
    } catch (error) {
      console.error(`Failed to get members of group ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Handle a message received from Jami
   * @param groupId The ID of the group chat
   * @param message The message content
   * @param sender The ID of the sender
   */
  private handleMessageReceived = (groupId: string, message: string, sender: string): void => {
    // Skip messages from self
    if (sender === this.userId) {
      return;
    }
    
    console.log(`Received message from ${sender} in group ${groupId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    
    // Notify all handlers for this group
    if (this.messageHandlers.has(groupId)) {
      this.messageHandlers.get(groupId)!.forEach(handler => {
        try {
          handler(message, sender);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  };
  
  /**
   * Handle a presence change from Jami
   * @param contactId The ID of the contact
   * @param status The new status
   */
  private handlePresenceChanged = (contactId: string, status: string): void => {
    console.log(`Presence changed for ${contactId}: ${status}`);
    
    // Notify handler for this contact
    if (this.presenceHandlers.has(contactId)) {
      try {
        this.presenceHandlers.get(contactId)!(status);
      } catch (error) {
        console.error('Error in presence handler:', error);
      }
    }
  };
  
  /**
   * Create a mock Jami SDK for testing
   * @returns A mock implementation of the Jami SDK
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
        console.log('Mock Jami SDK initialized');
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

export default JamiService;
