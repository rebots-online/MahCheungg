/**
 * MessageDisplayController
 *
 * This controller manages the display of messages in the chat interface,
 * controlling the visibility of game state messages based on debug mode.
 */

/**
 * Message interface
 */
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isGameState: boolean;
}

/**
 * MessageDisplayController class
 */
class MessageDisplayController {
  private debugMode: boolean = false;
  private messages: Message[] = [];
  private messageContainer: HTMLElement | null = null;
  private onMessagesChangedCallbacks: ((messages: Message[]) => void)[] = [];

  /**
   * Constructor
   * @param containerId Optional ID of the container element
   */
  constructor(containerId?: string) {
    if (containerId) {
      this.setContainer(containerId);
    }

    // Try to load debug mode preference from localStorage
    this.loadDebugModePreference();
  }

  /**
   * Set the container element
   * @param containerId ID of the container element
   */
  public setContainer(containerId: string): void {
    this.messageContainer = document.getElementById(containerId);

    if (!this.messageContainer) {
      console.warn(`Container element with ID ${containerId} not found`);
    }

    // Update the display
    this.updateDisplay();
  }

  /**
   * Set debug mode
   * @param enabled Whether debug mode is enabled
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;

    // Save preference to localStorage
    localStorage.setItem('mahcheungg_debug_mode', this.debugMode.toString());

    // Update the display
    this.updateDisplay();

    // Notify callbacks
    this.notifyMessagesChanged();
  }

  /**
   * Check if debug mode is enabled
   * @returns Whether debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Toggle debug mode
   */
  public toggleDebugMode(): void {
    this.setDebugMode(!this.debugMode);
  }

  /**
   * Add a message
   * @param content Message content
   * @param sender Message sender
   * @param isGameState Whether the message is a game state message
   * @returns The added message
   */
  public addMessage(content: string, sender: string, isGameState: boolean): Message {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content,
      sender,
      timestamp: new Date(),
      isGameState
    };

    this.messages.push(message);

    // Limit the number of messages
    if (this.messages.length > 1000) {
      this.messages.shift();
    }

    // Update the display
    this.updateDisplay();

    // Notify callbacks
    this.notifyMessagesChanged();

    return message;
  }

  /**
   * Get all messages
   * @returns Array of all messages
   */
  public getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Get visible messages (filtered by debug mode)
   * @returns Array of visible messages
   */
  public getVisibleMessages(): Message[] {
    return this.messages.filter(message => !message.isGameState || this.debugMode);
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messages = [];

    // Update the display
    this.updateDisplay();

    // Notify callbacks
    this.notifyMessagesChanged();
  }

  /**
   * Register a callback for when messages change
   * @param callback The callback function
   */
  public onMessagesChanged(callback: (messages: Message[]) => void): void {
    this.onMessagesChangedCallbacks.push(callback);
  }

  /**
   * Update the display
   */
  private updateDisplay(): void {
    if (!this.messageContainer) {
      return;
    }

    // Clear the container
    this.messageContainer.innerHTML = '';

    // Add visible messages
    const visibleMessages = this.getVisibleMessages();

    for (const message of visibleMessages) {
      const messageElement = document.createElement('div');
      messageElement.className = message.isGameState ? 'game-state-message' : 'chat-message';
      messageElement.dataset.id = message.id;

      // Format the message
      if (message.isGameState) {
        // Format game state message (maybe with syntax highlighting)
        try {
          const gameState = JSON.parse(message.content);
          messageElement.innerHTML = `<span class="debug-prefix">[GAME]</span> <pre>${JSON.stringify(gameState, null, 2)}</pre>`;
        } catch {
          messageElement.textContent = `[GAME] ${message.content}`;
        }
      } else {
        // Format chat message
        messageElement.innerHTML = `<strong>${message.sender}:</strong> ${message.content}`;
      }

      this.messageContainer.appendChild(messageElement);
    }

    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  /**
   * Notify all callbacks that messages have changed
   */
  private notifyMessagesChanged(): void {
    const visibleMessages = this.getVisibleMessages();

    for (const callback of this.onMessagesChangedCallbacks) {
      try {
        callback(visibleMessages);
      } catch (error) {
        console.error('Error in messages changed callback:', error);
      }
    }
  }

  /**
   * Load debug mode preference from localStorage
   */
  private loadDebugModePreference(): void {
    const savedDebugMode = localStorage.getItem('mahcheungg_debug_mode');

    if (savedDebugMode) {
      this.debugMode = savedDebugMode === 'true';
    }
  }
}

export default MessageDisplayController;
export type { Message };
