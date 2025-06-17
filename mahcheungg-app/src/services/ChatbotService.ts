// This service would connect to an actual LLM API in a real implementation
// For demonstration purposes, we'll simulate responses

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

class ChatbotService {
  private static instance: ChatbotService;
  private messages: ChatMessage[] = [];
  private isProcessing: boolean = false;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  
  // Simulated knowledge base for Mahjong
  private mahjongKnowledge: Record<string, string[]> = {
    'rules': [
      'In Cantonese Mahjong, a winning hand consists of 14 tiles arranged in four sets and one pair.',
      'A set can be a pung (three identical tiles), a kong (four identical tiles), or a chow (three consecutive tiles of the same suit).',
      'Players take turns drawing and discarding tiles until someone forms a winning hand.',
      'When another player discards a tile you need to win, you can call "Huu" to claim the victory.'
    ],
    'terminology': [
      'Pung (碰) refers to a set of three identical tiles.',
      'Kong (槓) refers to a set of four identical tiles.',
      'Chow or Sreung (吃/上) refers to three consecutive tiles of the same suit.',
      'Huu (和/糊) is the call made when winning a hand.',
      'Tin (天和) refers to a heavenly hand - when the dealer wins with their initial tiles.'
    ],
    'strategy': [
      'It\'s generally better to keep your hand flexible in the early game.',
      'Pay attention to what tiles other players discard to understand what they might be collecting.',
      'Sometimes it\'s better to sacrifice potential points for a faster win.',
      'In Cantonese Mahjong, players often strategically wait to win by taking a tile from a specific opponent.'
    ]
  };
  
  private constructor() {}

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  public getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public setOnMessageCallback(callback: (message: ChatMessage) => void): void {
    this.onMessageCallback = callback;
  }

  public async sendMessage(content: string, isAudio: boolean = false): Promise<void> {
    if (this.isProcessing) {
      console.warn('Already processing a message, please wait');
      return;
    }
    
    this.isProcessing = true;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      isAudio
    };
    
    this.messages.push(userMessage);
    
    // Notify callback if set
    if (this.onMessageCallback) {
      this.onMessageCallback(userMessage);
    }
    
    try {
      // In a real implementation, this would call an LLM API
      // For demonstration, we'll simulate a response
      const response = await this.generateResponse(content);
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      this.messages.push(assistantMessage);
      
      // Notify callback if set
      if (this.onMessageCallback) {
        this.onMessageCallback(assistantMessage);
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async generateResponse(query: string): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convert query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();
    
    // Check if query contains keywords related to our knowledge base
    let relevantResponses: string[] = [];
    
    if (lowerQuery.includes('rule') || lowerQuery.includes('how to play') || lowerQuery.includes('winning')) {
      relevantResponses = [...relevantResponses, ...this.mahjongKnowledge.rules];
    }
    
    if (lowerQuery.includes('term') || lowerQuery.includes('word') || lowerQuery.includes('mean') || 
        lowerQuery.includes('pung') || lowerQuery.includes('kong') || lowerQuery.includes('chow') || 
        lowerQuery.includes('huu') || lowerQuery.includes('sreung')) {
      relevantResponses = [...relevantResponses, ...this.mahjongKnowledge.terminology];
    }
    
    if (lowerQuery.includes('strategy') || lowerQuery.includes('tip') || lowerQuery.includes('advice') || 
        lowerQuery.includes('how to win') || lowerQuery.includes('best way')) {
      relevantResponses = [...relevantResponses, ...this.mahjongKnowledge.strategy];
    }
    
    // If we found relevant responses, combine them
    if (relevantResponses.length > 0) {
      // Select up to 2 random relevant responses
      const selectedResponses = this.getRandomElements(relevantResponses, Math.min(2, relevantResponses.length));
      return `I'd be happy to help with that! ${selectedResponses.join(' ')} Is there anything specific about this you'd like me to explain further?`;
    }
    
    // Default responses for different types of queries
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return "Hello! I'm your Mahjong learning assistant. How can I help you learn about Cantonese Mahjong today?";
    }
    
    if (lowerQuery.includes('thank')) {
      return "You're welcome! Feel free to ask if you have any other questions about Mahjong.";
    }
    
    if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you')) {
      return "I'm your AI Mahjong tutor, designed to help you learn about Cantonese Mahjong through natural conversation. You can ask me about rules, terminology, strategy, or anything else related to the game!";
    }
    
    // Generic response for other queries
    return "That's an interesting question about Mahjong. While I'm still learning, I can tell you that Cantonese Mahjong is played with 144 tiles and focuses on creating sets of three identical tiles (pungs) or three consecutive tiles of the same suit (chows). Would you like to know more about a specific aspect of the game?";
  }
  
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  public clearConversation(): void {
    this.messages = [];
  }
}

export default ChatbotService;
