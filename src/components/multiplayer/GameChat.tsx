import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Feedback } from '@/lib/sound';
import GameMulticastManager from '@/services/GameMulticastManager';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

interface GameChatProps {
  className?: string;
  playerName: string;
  opponentName: string;
}

const GameChat: React.FC<GameChatProps> = ({ className, playerName, opponentName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const multicastManager = GameMulticastManager.getInstance();

  // Add system message when component mounts
  useEffect(() => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: 'Chat started. Be respectful and have fun!',
      timestamp: Date.now(),
      isSystem: true
    };
    
    setMessages([systemMessage]);
  }, []);

  // Set up event listener for incoming chat messages
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      const { message, senderId, timestamp } = data;
      
      // Play message sound
      Feedback.notification();
      
      // Get sender name (this is simplified - in a real app, you'd have a way to map IDs to names)
      const senderName = senderId === multicastManager.getPeerId() ? playerName : opponentName;
      
      const chatMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        senderId,
        senderName,
        text: message,
        timestamp
      };
      
      setMessages(prevMessages => [...prevMessages, chatMessage]);
    };
    
    // Register event listener
    multicastManager.on('chat_message_received', handleChatMessage);
    
    // Clean up
    return () => {
      multicastManager.off('chat_message_received', handleChatMessage);
    };
  }, [multicastManager, playerName, opponentName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Play send sound
    Feedback.buttonClick();
    
    // Send message via multicast manager
    multicastManager.sendChatMessage(inputValue.trim());
    
    // Add message to local state (the multicast manager will also emit an event that we'll catch)
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: multicastManager.getPeerId(),
      senderName: playerName,
      text: inputValue.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, chatMessage]);
    
    // Clear input
    setInputValue('');
    
    // Focus input for next message
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Focus input when expanding
    if (!isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={`border rounded-md ${className} ${isExpanded ? 'h-80' : 'h-12'} transition-all duration-300 overflow-hidden`}>
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <h3 className="text-sm font-medium">Game Chat</h3>
        <Button variant="ghost" size="sm" onClick={toggleExpanded} className="h-6 px-2">
          {isExpanded ? 'Minimize' : 'Expand'}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          <ScrollArea className="h-56 p-2" ref={scrollAreaRef}>
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-md ${
                    message.isSystem
                      ? 'bg-muted text-center text-xs'
                      : message.senderId === multicastManager.getPeerId()
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted/50 mr-8'
                  }`}
                >
                  {!message.isSystem && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  <div className={message.isSystem ? '' : 'text-sm'}>{message.text}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-2 border-t flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameChat;
